---
title: "Four agent workflows in my pocket"
date: 2026-09-15
summary: "Agents Mobile explores native screens for travel, groceries, fitness, and coordinated wellness."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/agents-mobile
---

Travel plans, groceries, and workouts often become relevant away from a desktop. A general agent gateway can serve these tasks, but the client still has to make its state and output usable on a phone.

The goal is to provide native entry points for four everyday workflows while retaining a shared backend contract.

[Agents Mobile](https://github.com/aranlucas/agents-mobile) is an Expo app with travel, grocery, fitness, and wellness screens. Its README describes tabs that use a CopilotKit-compatible runtime from the Go gateway and render backend state as compact summaries.

The app refreshes its Clerk session token before a run. Fitness adds an Android Health Connect integration that requires a native build or development client. That makes the phone more than another place to display a transcript: it can also supply activity data to the authenticated workflow.

The repository contains its own Markdown renderer and native integration tests, keeping the client self-contained after its separation from a workspace.

The result is a native client organized around four activities, with authentication and a device-data integration represented explicitly. The repository establishes the client structure; it does not establish how often each tab is used.

There is also a documentation boundary to resolve: its README still mentions D1 fitness persistence, while the current gateway documents SQLite. This post therefore describes the client behavior without asserting an end-to-end storage architecture.
