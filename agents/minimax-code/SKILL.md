---
name: agent-comm-hub
description: >-
  Real-time two-way communication with other AI agents connected to the local
  agent-comm-hub. Use when the user mentions another agent, the hub, group
  chat, sending messages or tasks to another agent, waiting for another
  agent's reply, or forwarding results between agents. Tools:
  bridge_register / bridge_chat / bridge_task / bridge_ack / bridge_wait /
  bridge_poll / bridge_status / bridge_peers / bridge_history.
---

# agent-comm-hub usage

A local hub (`agent-comm-hub` on 127.0.0.1:18764) connects this agent with
every other MCP-capable agent on this machine (MiniMax Code, opencode, Kimi
Code, Claude Code, DeepSeek Harness, …).

**Register before using bridge tools**: `initialize` opens the MCP transport
only; it does not create a business peer. On first use, call
`bridge_register(peerId, registrationRequestId)` with a UUID v4 request id, and keep the returned private
`agentSessionToken`. Include that token in every subsequent tool call. Choose a
unique `peerId`; same-name connections are not merged. With remote bearer auth,
omit `peerId` to use the identity bound to your token. If the registration
response is lost while the same Hub process is running, retry with the same UUID v4 `registrationRequestId`.

## Tools

- `bridge_chat(to, message)` — send a chat message to a peer; `to: "all"`
  broadcasts.
- `bridge_task(to, prompt, context?, deliverable?)` — delegate a structured
  task.
- `bridge_ack(ref, status, note?)` — acknowledge a task
  (`accepted`/`rejected`/`done`/`failed`), auto-routed back to the original
  sender.
- `bridge_wait(from?, timeoutMs?)` — long-poll for the next message (default
  40 s; the default server ceiling is 45 s, below common 60 s MCP tool-call limits).
  A timeout is a normal retryable result: follow `nextAction` and call again while
  the conversation is active.
- `bridge_poll(from?)` — non-blocking drain of every queued message.
- `bridge_status()` / `bridge_peers()` — hub health and who is online.
- `bridge_history(peer?, limit?)` — recent messages (newest first).

## When to use

1. The user mentions "another agent / the hub / over there" pointing at a
   different agent — use the bridge tools.
2. **After registering, call `bridge_peers()` before messaging a specific
   agent and use its exact peerId.** If the target is not listed, it is not connected yet —
   do NOT guess a peerId or send blindly; tell the user the other agent needs
   to be running and explicitly registered.
3. Receiving: try `bridge_poll()` first; if empty, loop `bridge_wait()` until
   a message arrives or the user explicitly ends the wait.
4. On receiving a `task` (content is `{prompt, context?, deliverable?}`):
   acknowledge with `bridge_ack(ref, "accepted")` when you take it on, then
   `bridge_ack(ref, "done"[, note])` when finished; use `"rejected"` to
   decline and `"failed"` when it could not be completed (always with a note).
5. Unsure whether the peer is online: check `bridge_peers()` first.

## Notes

- Messages travel on loopback only (127.0.0.1:18764); never put credentials
  in bridge messages.
- A timeout is not a failure: the result includes `retryable: true`,
  `taskCompleted: false`, and `nextAction`. If you are still waiting, call
  `bridge_wait` again with the same filters. Keep each call below the configured
  MCP client's tool-call timeout; check `bridge_peers()` when unsure.
