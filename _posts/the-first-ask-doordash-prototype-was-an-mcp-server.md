---
title: The grocery MCP server behind my Ask DoorDash pitch
date: 2026-09-25
summary: A Kroger MCP server for my own groceries became the prototype behind my
  Ask DoorDash pitch. Its current design separates product search, selection,
  and cart writes, with explicit recovery when a purchase action is uncertain.
draft: false
---

In May 2025 I wanted Claude to do my grocery shopping. Kroger has a public API, so I wrote a small MCP server on a Cloudflare Worker that let a model search products at my local QFC and put them in my cart. The first README says the goal was to let AI models "help manage QFC/Kroger shopping lists."

That personal server, [ai-shopping-mcp](https://github.com/aranlucas/ai-shopping-mcp), gave me a working prototype for the experience I later pitched at DoorDash: describe the groceries I want and let an agent find the products. I went on to prototype and lead engineering for Ask DoorDash's grocery agent, which launched in June 2026 as part of the broader Assistant.

My work there also included New Verticals platform and reliability, and shared MCP tools used across agents and external integrations. The team's [engineering overview](https://careersatdoordash.com/blog/building-doordash-assistant-an-engineering-overview/) and the [platform deep dive I coauthored](https://careersatdoordash.com/blog/building-ask-doordash-part-four-a-platform-for-building_and_evolving_agents/) cover that production system. This post is about the personal experiment that helped me get to the pitch.

## What it does now

The server now has 13 tools for stores, products, weekly deals, pantry and kitchen inventory, shopping lists, cart operations, and order history. Four workflow prompts help the client plan meals or shop for ingredients. Kroger OAuth connects those tools to the shopper's account, while D1 stores the lists and household context.

Shopping lists render inside the chat as an interactive view through MCP Apps. I can check items off or change a quantity without leaving the conversation, and the list updates after every edit the agent makes.

The biggest change is where product selection happens. `shop_for_items` is now read-only: it searches up to ten requested items and returns up to five eligible, distinct products for each. It filters explicit out-of-stock entries and products that do not support the requested pickup or delivery mode. The calling agent gets UPCs, sizes, prices, and available ingredient or dietary information, then chooses what belongs on the list. There is no second model call inside the shopping server.

That makes the steps inspectable. A search can return candidates for milk and no result for another ingredient without changing either the list or the cart. The agent can ask a follow-up, refine a search, or preserve an unmatched ingredient as a plain list entry. Cart writes use exact UPCs after selection.

## What removing a model actually proved

An earlier version used a dedicated product selector, JEV. The [paired evaluation](https://github.com/aranlucas/ai-shopping-mcp/blob/449cb73fd274b38a7318dd2f1f0f160c752e1f01/docs/jev-value-evaluation.md) is useful because it complicates the easy story that a calling agent must be better.

On the compact synthetic challenge set, JEV returned 121 correct outcomes out of 126, compared with 116 for the tested calling model. Both included correct decisions to abstain. Giving the calling model twenty candidates increased its wrong selections from eight to fifteen. More options added distraction when the extra products were irrelevant.

The production design still moved selection to the caller. I read that as a decision about where the responsibility belongs: the assistant already has the conversation and preferences, while the server owns catalog access and writes. The experiment did not establish an accuracy improvement from that move. It replayed fixed shortlists, rather than running representative shopping conversations against live Kroger retrieval.

## A lost response is a shopping problem

Once a cart is involved, a timeout can mean two different things: Kroger rejected the request, or Kroger accepted it and the response never arrived. Retrying both cases the same way can add the groceries twice.

The [cart operation journal](https://github.com/aranlucas/ai-shopping-mcp/blob/449cb73fd274b38a7318dd2f1f0f160c752e1f01/src/cart-operations.ts) reserves an operation before contacting Kroger. A list-backed retry uses the saved list identity; inline additions can supply an operation ID and reuse it. Changed items cannot reuse the same ID.

If the upstream outcome is unknown, the tool returns `MUTATION_OUTCOME_UNKNOWN` with instructions to check the real Kroger cart. The app replaces its retry action with **Check Kroger cart**. An assistant's local cart mirror cannot establish what Kroger received.

That is a more useful result than a generic error. It tells the person and the agent what evidence they need before deciding to act again.

## Why MCP first

If I were starting an agent product again, I'd write the capabilities as MCP tools before building any interface.

When I started there was no app at all. Claude Desktop connected to the Worker through `mcp-remote`, and the chat window was the whole product. That was enough to learn whether shopping by conversation worked for me, and I didn't write a line of UI to find out.

The tools also outlived that first client. My grocery agent moved from Claude Desktop to my own web console and then to Telegram. The [Go gateway](https://github.com/aranlucas/agents) calls the Kroger integration through MCP, and the server has its own evaluation runners. A new interface can reuse the integration while changing how it presents the shopping plan.

MCP also gives you a clean line between the model and the system of record. The model turns a recipe or a vague request into a list. The server supplies catalog UPCs, reported stock and prices, and controlled writes to the cart. When a result was wrong, I could usually tell from the tool call whether the model had asked for the wrong thing or the tool had done the wrong thing.

The same idea showed up at DoorDash. Besides Ask DoorDash, I drove our external MCP integration for ChatGPT, which put DoorDash's catalog and commerce tools inside an assistant we didn't build.

## Running your own

The [source and setup instructions are on GitHub](https://github.com/aranlucas/ai-shopping-mcp). You'll need a Cloudflare deployment and your own Kroger developer app for the OAuth client ID and secret. Follow the README to configure storage, apply migrations, build, and deploy. Then connect the Worker's `/mcp` endpoint to an MCP client with remote OAuth support and ask it to find a store near you. The agent can build the cart; you review it and complete checkout in Kroger.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
