/**
 * `@shoo/contracts-mcp` — the nine MVP MCP tools, read-only resources and optional
 * prompts from docs/38.
 *
 * Local stdio and remote Streamable HTTP expose the same product semantics. Credentials
 * come from the transport (Shoo Local / OS vault or OAuth) and never appear in
 * model-visible tool arguments or results.
 */
export * from './common.js';
export * from './tools.js';
export * from './resources.js';
