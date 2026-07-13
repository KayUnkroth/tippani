#!/usr/bin/env node
// Tippani MCP shim — exposes the control API as an MCP stdio server so LLM
// clients (Claude Desktop, GitHub Copilot, etc.) can drive tippani
// via tool calls.
//
// Architecture: this is a thin HTTP client. The real state lives in a tippani
// portal process (default http://localhost:3847). Unlike the original shim,
// this one does NOT require a portal to already be running — it launches and
// owns one on demand via the `open_pr` tool (see portal-launcher.js), so the
// MCP tool surface always exists and an agent can start a review from cold.
// The portal opens a visible browser for the user; the shim drives it.
//
// Auth: the embedding host injects the ADO REST/git token as TIPPANI_ADO_TOKEN.
// The launcher forwards it to the portal via env. The host may also set
// TIPPANI_ADO_AUDIENCE to have the shim verify the token's audience on startup.
//
// Usage in an MCP client config:
//   { "mcpServers": { "tippani": { "command": "tippani-mcp" } } }

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildTools, createHttpClient } from "./mcp-tools.js";
import { createPortalSession } from "./portal-launcher.js";
import { inspectAdoToken, tokenRejectionMessage } from "./ado-token-check.js";

// Give MCP "Test connection" real meaning: validate the bound account's ADO
// token before serving. If it isn't an Azure DevOps git/REST token (wrong
// account bound, e.g. GitHub), exit so Test fails with a clear reason instead
// of a false success.
const adoCheck = inspectAdoToken(process.env.TIPPANI_ADO_TOKEN, process.env.TIPPANI_ADO_AUDIENCE);
if (!adoCheck.ok) {
  console.error(tokenRejectionMessage(adoCheck));
  process.exit(1);
}

const session = createPortalSession();
const http = createHttpClient({
  getBaseUrl: session.getBaseUrl,
  getToken: session.getToken,
  clientName: session.clientName,
  fetch,
});
const tools = buildTools(http, session);

const server = new McpServer(
  { name: "tippani", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

for (const t of tools) {
  server.registerTool(
    t.name,
    { description: t.description, inputSchema: t.inputSchema },
    async (args) => {
      try {
        const result = await t.handler(args || {});
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: String(e?.message || e) }],
        };
      }
    }
  );
}

process.on("SIGINT", () => { session.stop(); process.exit(0); });
process.on("SIGTERM", () => { session.stop(); process.exit(0); });

const transport = new StdioServerTransport();
await server.connect(transport);
