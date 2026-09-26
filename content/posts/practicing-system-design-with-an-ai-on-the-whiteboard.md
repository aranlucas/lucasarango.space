---
title: Practicing system design with an AI on the whiteboard
date: 2026-09-25
summary: I built System Design Companion, a shared Excalidraw canvas where Claude Code draws alongside me, and used it to get my system design reps in.
---

System design interviews are hard to practice alone. You can read about consistent hashing and fan-out on write all day, but the interview itself is a conversation at a whiteboard: you draw, someone pokes at your drawing, you defend it or change it. Reading doesn't give you that loop. A chat window doesn't either, because the thing being discussed, the diagram, lives somewhere the model can't see.

So I built [System Design Companion](https://system-design-companion.aranlucas.workers.dev/) ([source](https://github.com/aranlucas/system-design-companion)): a shared whiteboard where my AI agent draws alongside me.

## What it is

It's a multiplayer [Excalidraw](https://excalidraw.com/) canvas with an MCP server attached. I open a diagram in the browser, tell Claude Code (or Codex) "join" with the share link, and from then on we're both working on the same board. An interviewer can join from the same link too, with cursors and selections for everyone.

The important part is that the agent doesn't see pixels. It sees the diagram as components and connections: this box is a cache, that arrow goes from the API service to the queue. It edits the same way, with high-level operations like "add a component", "connect these two" or "group these into a frame", instead of raw drawing commands. Its changes show up in violet so I can tell who did what.

## How I practiced with it

Here's the loop I settled into for each problem:

1. **Start from the interview framework template.** It lays out frames for each stage: requirements, estimates, API, high-level design and deep dives. Having the stages on the canvas keeps me from jumping straight to boxes and arrows, which is the most common way to blow an interview.
2. **Drive the design myself.** I draw the first pass by hand. The point is practice, so the agent stays quiet unless I ask.
3. **Point and ask.** When I'm unsure about a piece, I select it and ask "what about this?". The agent knows what I selected, so the question can be as vague as it would be in a real interview.
4. **Do the math on the board.** Back-of-envelope estimates are easy to skip when practicing alone. I ask the agent to run capacity estimates and write them onto the canvas, then check whether my design actually survives those numbers.
5. **Get reviewed.** At the end I ask for a review against a ten-point rubric: requirements, estimates, API, data model, high-level design, scaling, reliability, consistency, operability and trade-offs. That's the feedback a good interviewer gives, and it's the part that's hardest to get on your own.

When I get stuck mid-design I ask for a suggested next step instead of a full answer. It's the difference between a hint and a solution, and it keeps the reps honest.

A few details turned out to matter more than I expected. Every agent edit is saved as a version first, so if it rearranges something I liked, one click in **Versions** undoes it. **Tidy** fixes overlaps and uneven spacing without redesigning anything, which keeps a 45-minute diagram readable. And the agent can point at a component with a laser marker without touching the diagram, which is exactly what an interviewer does.

## How it's built

The whole thing runs on Cloudflare. A Worker serves the React + Excalidraw frontend and a stateless MCP endpoint, and each diagram is its own Durable Object that owns the live scene, merges concurrent edits and relays presence between tabs. Snapshots and templates go to R2, metadata to D1.

Making the MCP server stateless was the design choice I'm happiest with. The diagram's share link is the handle: every tool takes it as an argument, and the server stores nothing per agent. Any MCP client can join any diagram with nothing but a link, the same way a person would.

The scene engine is pure, with no I/O, so most of the test suite runs against it directly. That made it practical to iterate on the fiddly parts, like routing arrows around boxes and keeping connections inside their frames.

## Try it

The [hosted version](https://system-design-companion.aranlucas.workers.dev/) is open, so anyone with the link can see and edit diagrams there. For real practice, [deploy your own](https://github.com/aranlucas/system-design-companion/blob/main/docs/setup.md): it's one command to run locally or on Cloudflare, and one more to connect your agent:

```sh
claude mcp add --transport http system-design https://<your-worker>.workers.dev/mcp
```

Then open a diagram, tell your agent to join, and start drawing.
