---
title: Practicing system design with an AI on the whiteboard
date: 2026-09-25
summary: I built System Design Companion, a shared Excalidraw canvas where Claude Code draws alongside me, and used it to get my system design reps in.
---

System design interviews are hard to practice alone. You can read about consistent hashing and fan-out on write all day, but the interview itself happens at a whiteboard: you draw, someone pokes at the drawing, and you defend it or change it. A chat window can't stand in for that, because the diagram you're arguing about lives somewhere the model can't see.

The goal is to make system design practice happen on a shared diagram, with an agent able to respond to the design as I work through it.

So I built [System Design Companion](https://system-design-companion.aranlucas.workers.dev/) ([source](https://github.com/aranlucas/system-design-companion)), a shared whiteboard where my AI agent draws alongside me.

## What it is

It's a multiplayer [Excalidraw](https://excalidraw.com/) canvas with an MCP server attached. I open a diagram in the browser, tell Claude Code (or Codex) to join with the share link, and from then on we're both working on the same board. An interviewer can join from the same link, and everyone sees each other's cursors and selections.

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

Everything runs on Cloudflare. A Worker serves the React and Excalidraw frontend along with a stateless MCP endpoint. Each diagram is its own Durable Object, which owns the live scene, merges concurrent edits and relays presence between tabs. Snapshots and templates go to R2 and metadata goes to D1.

Making the MCP server stateless is the design choice I'm happiest with. The diagram's share link is the handle: every tool takes it as an argument, and the server stores nothing per agent. Any MCP client can join any diagram with just a link, the same way a person would.

The scene engine is pure, with no I/O, so most of the test suite runs against it directly. That made it practical to keep iterating on the fiddly parts, like routing arrows around boxes and keeping connections inside their frames.

## Try it

The [hosted version](https://system-design-companion.aranlucas.workers.dev/) is open, which means anyone with a link can see and edit that diagram. For real practice, [deploy your own](https://github.com/aranlucas/system-design-companion/blob/main/docs/setup.md). It takes one command to run locally or on Cloudflare and one more to connect your agent:

```sh
claude mcp add --transport http system-design https://<your-worker>.workers.dev/mcp
```

After that, open a diagram, tell your agent to join, and start drawing.
