---
title: "A shared coding agent needs more than shared chat"
date: 2026-09-25
summary: "Relay gives a room an ordered history, a repository workspace, and a way to move participants into the preview they just changed."
draft: true
repository: https://github.com/aranlucas/multiplayer-chat
---

When several people share a coding agent, the conversation is only one part of the shared state. There is also the agent's current work, prompts waiting behind it, tool activity, a repository checkout, and the version of the app everyone is looking at.

Relay, the project in my multiplayer-chat repository, brings those pieces into one room. A Cloudflare Durable Object holds the room state, OpenCode supplies the coding-agent session, and a Railway Sandbox provides the repository workspace. The useful engineering story is how the room keeps its history and its running preview connected.

The room stores timeline events in SQLite with an increasing sequence number and a unique event ID. That gives participants an official ordering and lets repeated events be recognized. Queued prompts also have a stored status, so waiting work is represented in the room instead of existing only as an unsent draft in someone's browser. A prompt can be delivered as steering or placed in the queue; the server's handling distinguishes those cases. The [room implementation](https://github.com/aranlucas/multiplayer-chat/blob/1abcfc18bf638517724fcee16db1b80ccc21acff/src/server/agent-room.ts) contains both the event log and that queue state.

An ordered log is useful for recovery, but a raw event stream is a poor reading experience. One response can contain many text fragments, tool updates, and form lifecycle events. On the client, Relay sorts by sequence and coalesces those events into stable items. Text fragments become one stream entry. A tool's input and final result become one tool entry. A form keeps its identity as its status changes. The [timeline reducer](https://github.com/aranlucas/multiplayer-chat/blob/1abcfc18bf638517724fcee16db1b80ccc21acff/src/client/coalesce-events.ts) is a separate piece of code because display grouping and persistence answer different questions.

Then there is the preview itself. When the agent changes the app, a room revision records the workspace revision, commit SHA, deployment state, and eventual preview URL. The server checks that deployment observations refer to a published revision. It also prevents an older poll from moving a revision that is already ready back into an earlier state.

Moving participants into that preview is a small protocol of its own. Relay issues a short-lived handoff ticket tied to the target origin. The server stores a hash of the ticket with the participant and validated client state, and redemption checks the destination, expiry, and whether it has already been used. This lets the application preserve room continuity while the page serving its interface changes. It is a particularly interesting feature because the coding environment can be modifying the interface its collaborators are using.

Asynchronous completion needs a similar identity check. A finished agent turn should only update the status if it belongs to the current generation. The tiny [turn-status helper](https://github.com/aranlucas/multiplayer-chat/blob/1abcfc18bf638517724fcee16db1b80ccc21acff/src/server/agent-turn.ts) makes that condition explicit, protecting a newer turn from an older completion callback.

I would not describe the event log as an unlimited transcript: the snapshot query currently returns the latest 500 events. Nor does the presence of a permission interface establish that every production authorization concern is solved. What the implementation does demonstrate is a coherent room model. Conversation, execution, queued intent, and deployed revisions each have identities, and the code defines how they relate when participants reconnect or move to a new preview.
