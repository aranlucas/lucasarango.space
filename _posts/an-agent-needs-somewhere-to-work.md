---
title: An agent needs somewhere to work
date: 2026-09-16
summary: Tools, persistent state, clients, shared workspaces, and status displays give an agent's work a life beyond a single chat connection.
draft: true
---

A chat window makes it easy to start working with an agent. As the work grows, other questions appear. Where does its state live? Which tools can it reach? What happens when I open a different client? How does another person join the work, and how do I tell what is still running?

Several of my repositories address those surrounding questions. They form a useful account of what it takes to give an agent a working environment, even when the individual tasks—groceries, travel, research, or coding—look unrelated.

The common pieces are less glamorous than the first successful response. They include configuration, credentials, stored records, and ways to observe progress. They also determine whether the work can be picked up again.

## Separate the task from its surroundings

[Agents](https://github.com/aranlucas/agents) gives specialist agents a common Go service. Each specialist has its own instructions, state, and handlers, while a gateway supplies the client-facing runtime. Several specialists also have evaluation datasets.

A grocery agent and a research agent can share the machinery around a run without sharing the same task instructions. That gives a change to storage or configuration one place to happen, while the specialist behavior remains separately inspectable.

The current service uses SQLite for application data, sessions, and artifacts. Its [deployment documentation](https://github.com/aranlucas/agents#deployment) describes one Railway replica with a mounted volume. This is the current version of the architecture, not a claim that the project has always worked that way or that every in-flight operation survives a process failure.

Tools are another boundary. The [grocery integration](https://github.com/aranlucas/agents/blob/main/internal/agents/grocery/kroger.go) connects to Kroger capabilities through MCP using the shopper's token. Retail integration remains a separate capability the runtime can call.

[Lucas Plugins](https://github.com/aranlucas/lucas-plugins) packages access to those kinds of tools together with instructions for using them. I wrote about [keeping the plugin definitions in one place](/blog/one-plugin-repo-for-all-my-mcp-servers) because configuring the same servers across clients had become repetitive. A tool should not need to be redesigned each time I want to reach it through a different interface.

[Agents Mobile](https://github.com/aranlucas/agents-mobile) explores that client side with native screens for travel, groceries, fitness, and wellness. It gives those activities a phone interface while relying on a gateway for execution. The client and backend documentation have some storage details that still need reconciliation, so I would keep their deployment compatibility separate from the architectural idea.

## Give collaboration a room

A shared coding agent adds another layer. Participants need a common view of the conversation, the queued requests, the repository, and the application being changed.

[Relay](https://github.com/aranlucas/multiplayer-chat) puts those pieces in a room. A Cloudflare Durable Object holds room state, OpenCode supplies the coding-agent session, and a Railway Sandbox supplies the workspace. The room's event history and prompt queue give activity a representation outside one participant's browser.

The preview matters as well. When the agent changes an application, participants need to know which revision they are looking at. Relay's revision and handoff machinery explores how the room can retain continuity while the application serving its interface changes.

That is a different problem from adding another person to a chat. The conversation refers to code and a running result; those objects need identities too.

## Make ongoing work visible

[Keyboard Studio](https://github.com/aranlucas/keyboard-studio) explores observation through a physical interface. Alongside its native macOS configuration tools for a SayoDevice keyboard, it reads local Codex summaries and session events to assemble activity information.

It is a small but revealing extension of the same theme. Once an agent can work for a while, finding out what it is doing becomes an interaction worth designing. A status display can have a purpose even when it contributes nothing to generating the next response.

These projects give different responsibilities concrete places: a runtime executes, tools expose capabilities, plugins package access, clients present the work, rooms coordinate it, and status interfaces make it visible. They are experiments at different stages, rather than proof of one finished platform.

The useful result is that the surrounding work can be inspected and changed. When something is awkward, there is a more precise question to ask than whether the agent is good: which part of the environment needs to behave differently?
