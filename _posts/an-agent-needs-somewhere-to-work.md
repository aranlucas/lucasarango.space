---
title: An agent needs somewhere to work
date: 2026-09-16
summary: Tools, persistent state, clients, shared workspaces, and status displays give an agent's work a life beyond a single chat connection.
draft: true
---

A chat window makes it easy to start working with an agent. As the work grows, other questions come up. Where does its state live? Which tools can it reach? What happens when I open a different client? How does someone else join in, and how do I tell what's still running?

Several of my repositories deal with those questions. Together they show what it takes to give an agent a working environment, even though the tasks themselves (groceries, travel, research, coding) look unrelated.

The shared pieces are the boring ones: configuration, credentials, stored records, and some way to watch progress. They also decide whether I can pick the work up again later.

## Separate the task from its surroundings

[Agents](https://github.com/aranlucas/agents) runs specialist agents on a common Go service. Each specialist has its own instructions, state, and handlers, and a gateway provides the runtime that clients talk to. Several specialists also have evaluation datasets.

That way a grocery agent and a research agent share the machinery around a run but keep their own task instructions. A change to storage or configuration happens in one place, and I can still inspect each specialist's behavior on its own.

The service currently uses SQLite for application data, sessions, and artifacts. Its [deployment documentation](https://github.com/aranlucas/agents#deployment) describes one Railway replica with a mounted volume. That's where the architecture is today. It hasn't always worked this way, and an operation that's in flight won't necessarily survive a process crash.

Tools are another boundary. The [grocery integration](https://github.com/aranlucas/agents/blob/main/internal/agents/grocery/kroger.go) reaches Kroger through MCP using the shopper's token, so the retail integration stays a separate capability the runtime calls.

[Lucas Plugins](https://github.com/aranlucas/lucas-plugins) packages access to tools like that along with instructions for using them. I wrote about [keeping the plugin definitions in one place](/blog/one-plugin-repo-for-all-my-mcp-servers) because setting up the same servers in every client had gotten repetitive. I want to reach a tool from a new interface without redesigning it.

[Agents Mobile](https://github.com/aranlucas/agents-mobile) is the client side: native phone screens for travel, groceries, fitness, and wellness, with a gateway doing the actual work. The client and backend docs still disagree on some storage details, so I treat whether they deploy together as a separate question from the design.

## Give collaboration a room

A shared coding agent adds another layer. Everyone involved needs the same view of the conversation, the queued requests, the repository, and the app being changed.

[Relay](https://github.com/aranlucas/multiplayer-chat) puts those in a room. A Cloudflare Durable Object holds the room's state, OpenCode runs the coding-agent session, and a Railway Sandbox provides the workspace. Because the room keeps an event history and a prompt queue, the activity lives somewhere other than one person's browser.

The preview matters too. When the agent changes an app, everyone needs to know which revision they're looking at. Relay's revision and handoff code is my attempt to keep the room continuous while the app serving its interface changes underneath it.

So it's more than adding a second person to a chat. The conversation refers to code and to a running app, and both need identities of their own.

## Make ongoing work visible

[Keyboard Studio](https://github.com/aranlucas/keyboard-studio) tries a physical interface for watching agents. Besides its native macOS configuration tools for a SayoDevice keyboard, it reads local Codex summaries and session events to show what's going on.

It's a small project, but it follows from the rest. Once an agent can work for a while, finding out what it's doing is worth designing for, even if the status display has nothing to do with producing the next response.

Each of these projects gives one job a concrete home. The runtime executes, tools expose capabilities, plugins package access, clients present the work, rooms coordinate it, and status displays show it. They're experiments at different stages, and they don't add up to one finished platform.

What I get from splitting things up this way is that I can inspect and change each part. When something feels awkward, I can ask which part of the environment needs to behave differently, which is a more useful question than whether the agent is good.
