---
title: From a grocery MCP server to Ask DoorDash
date: 2026-10-12
summary: I prototyped and led engineering for Ask DoorDash's grocery agent, launched June 2026. How a personal experiment became a pitch, what the production agent does, and the platform and reliability work underneath it.
draft: true
---

I left DoorDash in August. The thing I'm proudest of from my time there is Ask DoorDash's grocery agent, which launched in June 2026. I prototyped it and led engineering on it, and its origin is a personal project: in May 2025 I wanted Claude to do my grocery shopping, so I wrote a small MCP server against Kroger's public API. I wrote about [that server and the pitch it became](/blog/the-first-ask-doordash-prototype-was-an-mcp-server) last month. This post is about what happened after the pitch landed.

## What the agent does

The grocery agent turns a recipe link, a cookbook photo, or a plain description of what you want into a personalized grocery cart. It searches across roughly 800,000 products, fills in quantities, checks your pantry staples so you don't rebuy butter and salt, and lets you review and swap items before checkout. It also increased average order totals — when the cart builds itself, people finish the shop instead of abandoning it halfway.

That last part matters more than it sounds. The original pitch was about convenience. The business case turned out to be completion: fewer abandoned carts, bigger baskets.

## From prototype to production

A prototype proves an experience is possible. Production means the experience survives contact with real users, real catalogs, and real money.

The personal MCP server taught me the shape of the problem: separate product search, selection, and cart writes; make every step inspectable; treat an uncertain cart response as a shopping problem, not a generic error. Those decisions carried straight into the production agent. The platform underneath it — New Verticals agent infrastructure — became my other job: I owned its reliability, along with shared MCP tools used by the restaurant agent, DoorDash's ChatGPT integration, and the developer CLI.

I also wrote the agent-platform strategy that got leadership support to expand from external MCP grocery ordering to the in-app Assistant. That meant coordinating across engineering, ML, product, and design — four groups with four different definitions of "done." The strategy document's real job was to give them one.

## Reliability is a product feature

Agents fail in ways that traditional services don't. A model can be right 95% of the time and still destroy trust in the 5% — especially when money is involved. So the reliability work was first-class, not an afterthought:

- I built DashMart's integration-test framework on isolated test tenants, so agent runs could be tested end to end without touching production.
- I migrated execution from Jenkins to Buildkite on Kubernetes.
- I set org-wide performance standards with golden-path SLOs and blocking CI regression gates — if the golden path regressed, it didn't ship.

None of that is glamorous. All of it is why the agent could launch.

## The people part

I mentored New Verticals engineers on agent architecture and MCP tool design, and drove adoption of Claude Code and Codex on the team — with architecture and security review before merge, because agents writing production code need guardrails, not just enthusiasm.

The engineers who joined the project mid-flight picked up the MCP tool patterns fast. That was the point of writing them down: good defaults compound.

## What I'd do again

Start with the capabilities as MCP tools before building any interface. The personal server had no UI at all — Claude Desktop was the whole product — and that was enough to learn whether conversational grocery shopping worked. The tools outlived every client I pointed at them.

And write the strategy doc early. A prototype convinces one person; a strategy convinces an organization.

---

_The team's [engineering overview](https://careersatdoordash.com/blog/building-doordash-assistant-an-engineering-overview/) and the [platform deep dive I coauthored](https://careersatdoordash.com/blog/building-ask-doordash-part-four-a-platform-for-building_and_evolving_agents/) cover the production system in more depth._
