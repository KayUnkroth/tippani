import { WorkspaceStoreError } from "./workspace-contract.mjs";

const DEFINITIONS = Object.freeze({
  onedrive: Object.freeze({
    url: "https://graph.microsoft.com/v1.0/me?$select=id,userPrincipalName",
    headers: Object.freeze({ Accept: "application/json" }),
    subject(body) {
      return body?.id ? `onedrive:${body.id}` : null;
    },
  }),
  ado: Object.freeze({
    url: "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.1",
    headers: Object.freeze({ Accept: "application/json" }),
    subject(body) {
      return body?.id ? `ado:${body.id}` : null;
    },
  }),
  github: Object.freeze({
    url: "https://api.github.com/user",
    headers: Object.freeze({
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "tippani-s0",
    }),
    subject(body) {
      const id = body?.node_id || body?.id;
      return id ? `github:${id}` : null;
    },
  }),
});

const TOKEN_ENV = Object.freeze({
  onedrive: "S0_ONEDRIVE_TOKEN",
  ado: "S0_ADO_TOKEN",
  github: "S0_GITHUB_TOKEN",
});

export async function resolveProviderIdentity({
  provider,
  getToken,
  fetchImpl = globalThis.fetch,
  signal = null,
  identityResolver = null,
  beforeAttempt = null,
  wrapResponse = (response) => response,
} = {}) {
  const definition = DEFINITIONS[provider];
  if (!definition) throw new TypeError(`Unknown provider identity surface: ${provider}`);
  if (typeof getToken !== "function") {
    throw new WorkspaceStoreError(`No ${provider} credential supplied`, "no_token");
  }
  const token = await getToken();
  if (typeof identityResolver === "function") {
    const resolved = await identityResolver({ provider, token, signal });
    const subject = typeof resolved === "string" ? resolved : resolved?.subject;
    if (!subject || typeof subject !== "string") {
      throw new WorkspaceStoreError(
        `${provider} identity resolver returned no stable subject`,
        "identity_unverified",
      );
    }
    return subject;
  }
  await beforeAttempt?.();
  const response = wrapResponse(await fetchImpl(definition.url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, ...definition.headers },
    signal,
  }));
  if (!response.ok) {
    throw new WorkspaceStoreError(
      `${provider} identity resolution failed: ${response.status}`,
      "identity_unverified",
    );
  }
  const body = await response.json();
  const subject = definition.subject(body);
  if (!subject) {
    throw new WorkspaceStoreError(
      `${provider} identity response lacked a stable subject`,
      "identity_unverified",
    );
  }
  return subject;
}

export async function resolveProviderIdentityForConfig(config, {
  env = process.env,
  identityResolver = config?.identityResolver || null,
  fetchImpl = config?.fetchImpl || globalThis.fetch,
  signal = config?.signal || null,
  beforeAttempt = null,
  wrapResponse = (response) => response,
} = {}) {
  const tokenEnv = TOKEN_ENV[config?.backingPath];
  const explicitToken = {
    onedrive: config?.graphToken,
    ado: config?.adoToken,
    github: config?.githubToken,
  }[config?.backingPath];
  const token = explicitToken || (tokenEnv ? env[tokenEnv] : null);
  return resolveProviderIdentity({
    provider: config?.backingPath,
    getToken: token ? async () => token : config?.getToken,
    fetchImpl,
    signal,
    identityResolver,
    beforeAttempt,
    wrapResponse,
  });
}
