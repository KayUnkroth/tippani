# Portal lifecycle: reference-counted, work-context navigation, in-place token refresh

Status: Draft (design spec)

## 1. Problem

The MCP shim launches a portal child process and tracks it in
`~/.tippani/instances/<port>.json`. Today the portal's life is bound rigidly to
the **spawning shim**:

- `process.on("disconnect") → process.exit(0)` — the portal exits the instant
  its shim's IPC channel closes.
- `reapInstances` — a later shim startup kills any orphan whose `shimPid` is
  gone.
- `stop()` — a shim hard-kills every portal it owns.

Embedding hosts routinely recycle the stdio shim (between calls, on idle, on
reconnect). Each recycle severs the IPC channel, so the portal exits — even
though a browser may be open on it. Observed symptoms:

1. **Portal dies between calls.** A URL minted one moment is backed by a dead
   server the next; the user opens it and gets an auth/`ECONNREFUSED` page.
2. **Port churn.** Because adopt-or-launch keys on the PR, a browse session and
   a PR session become two registry entries and spawn two ports (e.g. 3847 then
   3848); a link for the first port is stale the moment work moves to the
   second.
3. **Token churn.** Refreshing an expired upstream token means shutting the
   whole shim down and restarting it, which restarts the portal, changes the
   port, and drops the browser session.

None of this is a single-use-token being *consumed early* — a freshly minted
link probed before any browser opens still signs in successfully. The defects
are **portal lifetime** and **port/instance instability**.

## 2. Model

Three rules:

1. **Reference-counted lifetime.** A portal stays up while anything holds a ref;
   it exits only when the ref count reaches **0** ("last man standing").
2. **Work-context navigation; portals == MCP servers.** One MCP server owns one
   portal, which hosts one or more *work contexts* and navigates between them in
   place. A second portal is created by launching a second MCP server. There is
   no per-PR forking.
3. **In-place token refresh.** A throwaway MCP server launched with
   `--refreshToken` on a running portal's port hands the host-provided token to
   that portal and exits — no restart, no new port, no lost browser session, and
   only when the two are the **same build**.

### 2.1 Reference-counted lifetime

The **portal process owns its ref count.** Attachments signal add/release; the
portal decides when to exit. Ref holders:

| Holder | +1 when | −1 when |
| --- | --- | --- |
| **Shim** | a shim attaches (launch or adopt) and its IPC channel is connected | IPC disconnect, or an explicit release/`close` from that shim |
| **Browser tab** | a tab connects and sends its keepalive | the tab closes, or its keepalive lapses past the idle TTL |
| **Pending browser** | a browser bootstrap link is minted | the first browser connection converts it to a tab ref, or a short TTL expires with no connection |

The portal exits **only at ref count 0**. Consequences:

- A shim recycle (IPC disconnect) **decrements**, it does not force-exit. If a
  browser or pending ref remains, the portal lives.
- `close`/`stop` from a shim **decrements that shim's ref**; a browser still
  attached keeps the portal open.
- Teardown moves *into* the portal. Shims and browsers **signal** ref changes
  (IPC message / authenticated control call); the shim no longer hard-kills the
  portal on `stop`, except as a last-resort fallback for a portal that is hung
  and unresponsive to the release signal.

**Pending-browser ref (the mint→connect gap).** Between minting a bootstrap link
and the browser actually connecting there is no tab ref yet. To stop a shim
recycle in that window from dropping the count to 0, minting a bootstrap link
adds a **pending-browser ref** with a short TTL (default ~90s). The first
successful browser sign-in converts it into a normal tab ref; if nobody connects
before the TTL, it is released. This closes the gap host-independently, on top
of the shim's own ref which already covers the common case.

### 2.2 Work contexts and portal count

A **work context** is a coherent review target — an ADO/GitHub PR, a local spec,
a branch/file browse. A portal can hold several and navigate between them (open a
PR, then a local spec, and switch back and forth in the same window).

- **Default: reuse and navigate.** A portal-launching tool navigates the MCP
  server's existing portal to the requested context instead of spawning another
  one. Every tool that ensures a portal (not one specific tool) goes through the
  same reuse-and-navigate path.
- **A second portal is a second MCP server.** When parallel windows are wanted,
  the LLM launches another MCP server; that server owns its own portal on its own
  port. There is no in-server "new window" flag and no per-PR fork.
- **Adoption across shim recycles.** When a host recycles a shim, the new shim
  process **adopts** the still-live portal (kept alive by a browser or pending
  ref), re-stamping the registry `shimPid` to itself, rather than spawning a
  duplicate. Adoption attaches a shim ref; the dead shim's ref was already
  released on its IPC disconnect.

Registry impact: entries are keyed by **port** and record the portal's live
**build id**, current **ref count** (or enough to derive liveness), the
**context(s)** visited, `pid`, and `shimPid`. The `prId`-keyed adopt match is
replaced by "find this MCP server's own live portal" + navigate.

### 2.3 In-place token refresh (`--refreshToken`)

The upstream (ADO/GitHub) token is always **host-provided on the command line**;
the LLM never handles it. `setAdoToken` already swaps a portal's live bearer in
place. `--refreshToken` is the delivery path:

1. The host launches a throwaway MCP server with `--refreshToken`, the new token
   (host-provided), and the target port.
2. The instance checks whether the port is already held.
   - **Free (or held by a non-tippani process):** do **not** hand off. (Free →
     start normally with the token as the initial value; foreign holder → fail
     with a clear message.)
   - **Held by a running tippani:** probe it (registry + health) and compare
     **build ids**.
3. **Same build only.** If the running instance's build id (package version +
   binary identity) matches this instance's exactly, push the token via the
   existing authenticated `setAdoToken` path, print `Token updated
   successfully`, and exit. **Any mismatch → no handoff**, fail with a
   version-mismatch message. A token is never pushed into a different build.

The handoff is authenticated (the refresher presents the running portal's
registry bearer / shared secret) so no unrelated local process can inject a
token, and the token stays off any surface a bystander can read beyond the
command line the host already controls.

## 3. Lifecycle (state view)

```
launch/adopt ──▶ RUNNING (refcount ≥ 1)
                   │  attach shim / browser / pending  → refcount++
                   │  release shim / browser / pending → refcount--
                   └─ refcount == 0 ──▶ EXIT (remove registry entry)

--refreshToken on this port + same build  ──▶ setAdoToken (no state change)
--refreshToken on this port + build mismatch ──▶ REFUSE (no handoff)
```

Explicit vs implicit teardown are unified: both are just ref releases. An
explicit `close` from the only holder ends the portal; the same `close` with a
browser still attached does not.

## 4. Security

- Token handoff requires **same build** and **authentication**; a mismatched or
  unauthenticated refresh is refused, never a best-effort push.
- The port holder is confirmed **tippani** (registry + health) before any token
  is offered; a foreign process on the port gets nothing.
- The portal continues to serve only its own localhost surface; nothing here
  adds an arbitrary-URL or arbitrary-command path.

## 5. Implementation plan

Grounded in the current code:

1. **`portal` process — own the ref count.** Add a ref registry inside the
   portal: shim refs (keyed by shim IPC identity), browser-tab refs (keyed by a
   per-tab session with a keepalive/idle TTL — build on the existing
   `lastSeenAt`/idle-TTL machinery), and a pending-browser ref set on bootstrap
   mint. Exit only at 0. Expose an authenticated control endpoint for
   attach/release and for `setAdoToken`.
2. **`portal-launcher.js`** — replace `process.on("disconnect") → exit` with a
   **shim-ref release** signal to the portal; `stop()` sends releases (hard-kill
   only as a hung-portal fallback). Replace prId adopt-or-launch with
   reuse-and-navigate on this server's own live portal, adopting + re-stamping
   `shimPid` across recycles.
3. **`portal-registry.js`** — record `buildId`, liveness/refcount, and
   context(s); `reapInstances` reaps only genuinely dead portals (refcount 0 /
   pid dead), never a live portal that still holds refs. Keep the recycled-PID
   safety (port identity probe).
4. **`--refreshToken` entry** (mcp boot / cli) — port-held + same-build check →
   authenticated `setAdoToken` + `Token updated successfully` + exit; else
   refuse. Reuse the port-in-use pre-check and health probe already present.
5. **Browser keepalive** — a lightweight per-tab heartbeat (or SSE) so a
   *viewing* (not just editing) tab holds a ref; releases on close / TTL lapse.

Every module keeps its `src/<name>.test.mjs` and the `npm test` chain green.

## 6. Test plan

- **Ref count:** launch → attach 2 shims + 1 browser → release both shims →
  still running (browser ref) → close browser → exits at 0.
- **Shim recycle:** IPC disconnect while a browser is attached → portal survives;
  new shim adopts and re-stamps `shimPid`.
- **Mint gap:** mint bootstrap → shim recycle before connect → portal survives on
  the pending ref → first connect converts it → later close exits.
- **No browser, no shim:** last shim releases with no browser and an expired
  pending ref → exits.
- **Navigation:** one portal opens context A then context B in place; no second
  port appears.
- **`--refreshToken` same build:** running portal on port → refresh → token
  swapped, `Token updated successfully`, no restart, browser session intact.
- **`--refreshToken` build mismatch:** running portal is a different build →
  refresh refuses with a version-mismatch message, no token pushed.
- **`--refreshToken` foreign/free port:** foreign holder → refuse; free → normal
  start.
- **Reaper:** dead pid reaped; live portal with refs never reaped; recycled-PID
  stranger never killed.

## 7. Out of scope

- The host's own MCP-connection management (when it recycles or launches shims)
  — this spec only requires the portal to survive a recycle when a ref remains.
- Changing what a work context *is* beyond "a navigable review target".
- Multi-user / remote portals; everything stays localhost.
