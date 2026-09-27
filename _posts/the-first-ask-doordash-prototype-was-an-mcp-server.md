---
title: The grocery MCP server behind my Ask DoorDash pitch
date: 2026-09-25
summary: A Kroger MCP server for my own groceries became the prototype behind my
  Ask DoorDash pitch. Here's why I'd start with tools again.
draft: false
---
In May 2025 I wanted Claude to do my grocery shopping. Kroger has a public API, so I wrote a small MCP server on a Cloudflare Worker that let a model search products at my local QFC and put them in my cart. The first README says the goal was to let AI models "help manage QFC/Kroger shopping lists."

That personal server, [ai-shopping-mcp](https://github.com/aranlucas/ai-shopping-mcp), gave me a working prototype for the experience I later pitched at DoorDash: describe the groceries I want and let an agent find the products. I went on to prototype and lead engineering for Ask DoorDash's grocery agent, which launched in June 2026 as part of the broader Assistant.

My work there also included New Verticals platform and reliability, and shared MCP tools used across agents and external integrations. The team's [engineering overview](https://careersatdoordash.com/blog/building-doordash-assistant-an-engineering-overview/) and the [platform deep dive I coauthored](https://careersatdoordash.com/blog/building-ask-doordash-part-four-a-platform-for-building_and_evolving_agents/) cover that production system. This post is about the personal experiment that helped me get to the pitch.

## What it does now

The server has grown a lot since the first commit. It has 18 tools for stores, product search, weekly deals, a pantry, shopping lists, the cart and past orders, plus four prompts for jobs like planning meals from what's already in the pantry. It signs in with Kroger OAuth, so the agent works with my real account and cart.

Shopping lists render inside the chat as an interactive view through MCP Apps. I can check items off or change a quantity without leaving the conversation, and the list updates after every edit the agent makes.

The tool that does the most work is `shop_for_items`. It sends a whole list to a model in one call, gives it up to 20 candidate products per item, and asks it to pick one or say that nothing fits. Anything explicitly out of stock is filtered out before the model sees it.

## Why MCP first

If I were starting an agent product again, I'd write the capabilities as MCP tools before building any interface.

When I started there was no app at all. Claude Desktop connected to the Worker through `mcp-remote`, and the chat window was the whole product. That was enough to learn whether shopping by conversation worked for me, and I didn't write a line of UI to find out.

The tools also outlived that first client. The Go gateway for my agent platform, my Telegram bot and my eval runner all call the same `/mcp` endpoint today. The grocery agent moved from Claude Desktop to my own web console and then to Telegram, and the Kroger integration stayed the same through all of it.

MCP also gives you a clean line between the model and the system of record. The model turns a recipe or a vague request into a list. The server handles the parts that have to be right: real UPCs, stock, prices and writes to the cart. When a result was wrong, I could usually tell from the tool call whether the model had asked for the wrong thing or the tool had done the wrong thing.

The same idea showed up at DoorDash. Besides Ask DoorDash, I drove our external MCP integration for ChatGPT, which put DoorDash's catalog and commerce tools inside an assistant we didn't build.

## Running your own

The [source and setup instructions are on GitHub](https://github.com/aranlucas/ai-shopping-mcp). You'll need a Cloudflare deployment and your own Kroger developer app for the OAuth client ID and secret. Follow the README to configure storage, apply migrations, build, and deploy. Then connect the Worker's `/mcp` endpoint to an MCP client with remote OAuth support and ask it to find a store near you. The agent can build the cart; you review it and complete checkout in Kroger.