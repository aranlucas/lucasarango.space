---
title: "Giving my agents one runtime and a durable record"
date: 2026-04-26
summary: "The Agents gateway puts specialist agents behind one Go service, with explicit boundaries for tools, sessions, artifacts, and deployment."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/agents
---

A collection of specialist agents creates repeated infrastructure work. A grocery agent and a travel agent need different instructions and tools, but both still need a runtime, session state, configuration, and a way to communicate with a client.

The interesting part of [Agents](https://github.com/aranlucas/agents) is how it gives those shared responsibilities a home without putting every task into the same set of instructions.

The goal is to provide a common gateway for specialist agents and make their persistence and tool boundaries explicit enough to inspect and change.

The current repository is a Go ADK service serving agents through AG-UI. Each specialist has its own package, with instructions, handlers, and state; several also have evaluation datasets. The application composition layer brings them together behind the gateway.

Persistence now lives in one SQLite file. The [storage implementation](https://github.com/aranlucas/agents/blob/main/internal/storage/db.go) gives application stores a batch interface that executes statements in one transaction. It also provides the surrounding persistence integration for sessions and artifacts. The database uses one connection to serialize access through that handle, a concrete choice that keeps this implementation's write path straightforward.

The [grocery integration](https://github.com/aranlucas/agents/blob/main/internal/agents/grocery/kroger.go) shows how a specialist reaches an external capability. It discovers Kroger tools through an MCP connection using the shopper's token. The agent runtime and the retail integration remain separate pieces of software.

Deployment follows the same bounded shape. The [README](https://github.com/aranlucas/agents#deployment) documents one Railway replica with a mounted data volume and startup migrations. That is the architecture of this snapshot; earlier writing about D1 and R2 describes a previous version.

The repository provides one service in which multiple agents can share runtime and storage infrastructure while retaining separate behavior and tool composition. It makes the machinery around the model part of the application's design.

This does not establish that an in-flight model invocation survives every process failure or that the deployment supports multiple active replicas. The current documented deployment is deliberately narrower.

The personal story still needs the reason for the architectural change: what was cumbersome in the earlier platform, why this arrangement fit better, and what improved after using it. Those decisions will say more about my agentic experience than the package layout alone.
