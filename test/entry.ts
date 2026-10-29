/**
 * Standalone test entry: re-exports the hub core so the smoke test can drive
 * the real wiring (startHub → server + registry + tools) without any
 * external dependencies.
 */
export { startHub, DEFAULT_CONFIG, AgentHub, McpStreamableHttpServer, SessionRegistry, hubTools, addToken, removeToken, readTokens, loadTokenFile } from '../src/index.js'
export { DEFAULT_WAIT_MS } from '../src/hub-tools.js'
