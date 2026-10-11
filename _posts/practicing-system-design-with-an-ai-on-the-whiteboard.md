---
title: Practicing system design with an AI on the whiteboard
date: 2026-09-25
summary: A shared Excalidraw canvas gives my agent the design I am practicing.
  Semantic edits, saved versions, and feedback on the actual board keep the
  discussion grounded in my attempt.
draft: false
---

System design interviews are hard to practice alone. You can read about consistent hashing and fan-out on write all day, but the interview itself happens at a whiteboard: you draw, someone pokes at the drawing, and you defend it or change it. A chat window can't stand in for that, because the diagram you're arguing about lives somewhere the model can't see.

I wanted to practice on a diagram the agent could see and respond to while I worked, so I built [System Design Companion](https://system-design-companion.aranlucas.workers.dev/) ([source](https://github.com/aranlucas/system-design-companion)), a shared whiteboard where my AI agent draws alongside me.

## What it is

It's a multiplayer [Excalidraw](https://excalidraw.com/) canvas with an MCP server attached. I open a diagram in the browser, tell Claude Code (or Codex) to join with the share link, and from then on we're both working on the same board. An interviewer can join from the same link, and everyone sees each other's cursors and selections. GitHub sign-in creates diagrams and manages the private library; collaborators can draw through the shared link. Agent connections authenticate through OAuth and still need the board link.

The agent reads the diagram as components and connections instead of pixels, so it knows that one box is a cache and that an arrow runs from the API service to the queue. It edits at that level too, with operations like adding a component, connecting two of them or grouping several into a frame. Its changes show up in violet, so I can always tell who drew what.

## How I practiced with it

For each problem I followed roughly the same loop.

1. I started from the interview framework template, which lays out a frame for each stage: requirements, estimates, API, high-level design and deep dives. Having the stages on the canvas kept me from jumping straight to boxes and arrows, which is the easiest way to blow an interview.
2. I drew the first pass myself. The point was practice, so the agent stayed quiet unless I asked it something.
3. When I wasn't sure about a piece, I selected it and asked "what about this?" The agent knows what's selected, so the question could be as vague as it would be in a real interview.
4. I asked the agent to run back-of-envelope capacity estimates and write them onto the canvas, then checked whether my design held up against those numbers. Estimates are the step I'm most tempted to skip when practicing alone.
5. At the end I asked for a review against a ten-point rubric covering requirements, estimates, API, data model, high-level design, scaling, reliability, consistency, operability and trade-offs. A good interviewer gives that kind of feedback, and it's the hardest thing to get on your own.

When I got stuck halfway through, I asked for a suggested next step instead of a full answer. A hint kept me doing the work, where a finished design would have done it for me.

Some smaller features ended up mattering more than I expected. Every agent edit is saved as a version first, so if it rearranged something I liked, one click in Versions undid it. Tidy fixes overlaps and uneven spacing without redesigning anything, which kept a 45-minute diagram readable. The agent can also point at a component with a laser marker without touching the diagram, the way an interviewer taps the whiteboard.

## How it's built

A Cloudflare Worker serves the React and Excalidraw frontend and the MCP endpoint. Each diagram has its own room for live collaboration.

The board is the durable unit of work. The [DiagramRoom](https://github.com/aranlucas/system-design-companion/blob/48f99a5f3b278858e705bdd1b73b01e860a8b4bd/docs/design.md) owns the scene and presence, with Durable Object SQLite for room state, R2 for snapshots and templates, and D1 for metadata. HTTP and MCP adapters reach the same room operations, so an agent edit follows the same scene rules as a human edit.

The share link identifies and grants access to a board. OAuth supplies the agent's identity and read/write scopes. Those solve separate problems: signing in does not grant access to every diagram, and a shared canvas is deliberately editable by the people holding its link.

The scene engine is pure, with no I/O, so most of the test suite runs against it directly. That made it practical to keep iterating on the fiddly parts, like routing arrows around boxes and keeping connections inside their frames.

## Let the board come back into the conversation

The canvas can now appear as an inline MCP App in supporting chat clients. A separate [ChatGPT Extensions experiment](https://github.com/aranlucas/system-design-chatgpt) explores the host integration with MCP v2; it has its own deployment and still needs verification inside a deployed ChatGPT development plugin.

The original companion also exposes subscriptions for human edits, renames, and saved checkpoints. Events exclude the agent's own edits, which avoids a loop where it reacts to its last change. Delivery is best-effort and has no replay log, so a missed event cannot be treated as proof nothing changed. The saved scene remains the place to inspect the design.

That adds a different practice mode: I can ask for feedback as I work, while keeping the first pass and the decisions on the board. It still needs the same discipline as an ordinary hint: help should leave me something to reason through.

## Try it

The [hosted version](https://system-design-companion.aranlucas.workers.dev/) uses capability links: anyone holding a board link can see and edit it. Sign in with GitHub to create a board, then share its link with the people joining the session. To run your own instance, follow the [setup guide](https://github.com/aranlucas/system-design-companion/blob/48f99a5f3b278858e705bdd1b73b01e860a8b4bd/docs/setup.md), including the Cloudflare resources and GitHub OAuth app. Connect Claude Code to its MCP endpoint with:

```sh
claude mcp add --transport http system-design https://<your-worker>.workers.dev/mcp
```

After that, open a diagram, tell your agent to join, and start drawing.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
