---
title: The first Ask DoorDash prototype was an MCP server
date: 2026-09-25
summary: Before Ask DoorDash had an interface, it was a Kroger MCP server I wrote for my own groceries. I'd still start an agent product the same way.
---

In May 2025 I wanted Claude to do my grocery shopping. Kroger has a public API, so I wrote a small MCP server on a Cloudflare Worker that let a model search products at my local QFC and put them in my cart. The first README says the goal was to let AI models "help manage QFC/Kroger shopping lists."

That server, [ai-shopping-mcp](https://github.com/aranlucas/ai-shopping-mcp), was the first prototype of what became Ask DoorDash. Shopping for my own groceries by describing what I wanted, and letting an agent find the products, is the experience I later pitched at DoorDash.

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

The [source is on GitHub](https://github.com/aranlucas/ai-shopping-mcp). It deploys to Cloudflare with `wrangler deploy`, and you'll need your own Kroger developer app for the OAuth client ID and secret. Once it's deployed, add the Worker's `/mcp` URL to any MCP client and ask it to find a store near you.
