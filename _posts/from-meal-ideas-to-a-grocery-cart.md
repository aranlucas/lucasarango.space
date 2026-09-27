---
title: From meal ideas to a grocery cart
date: 2026-09-08
summary: Recipes, product matching, shared lists, and pantry inventory are different parts of the same grocery problem. My projects explore what connects them.
draft: true
---

Groceries are one of the places where I actually use the software I build. The request sounds simple: help me decide what to cook and get what I need. Carrying it out touches recipes, quantities, real store products, a shopping list, and whatever is already at home.

My first grocery MCP server connected Claude to Kroger so it could search my local QFC and put products in a cart. I wrote about that experiment and its connection to my work in [the grocery MCP server behind my Ask DoorDash pitch](/blog/the-first-ask-doordash-prototype-was-an-mcp-server). This is the wider story around the shopping task: the pieces before and after selecting a product.

A meal idea is not yet a shopping instruction. Ingredients need quantities, a store has specific products, and someone still needs to inspect the resulting plan. Each transition is a place where a plausible answer can become an inconvenient purchase.

## Make the information reviewable

[Janella Cookbook](https://github.com/aranlucas/janella-cookbook) tackles an early part of that process: retaining something worth cooking. Recipes can enter through links, pictures of recipe pages, text, or manual entry. Extraction produces an editable draft before saving.

That review step gives a person somewhere to correct a quantity or instruction. Reimporting a source offers a choice to open the saved recipe or review an update, instead of silently replacing earlier corrections. The [implementation notes](https://github.com/aranlucas/janella-cookbook/blob/main/docs/design/recipe-workflow.md) also describe recoverable drafts and save identities that make retries return the same recipe.

Those details matter because collecting a recipe is supposed to preserve work. If a failed save loses the corrections, or a repeated import overwrites them, the next model call has created another chore.

Product selection has a similar boundary. [ai-shopping-mcp](https://github.com/aranlucas/ai-shopping-mcp) gathers real Kroger candidates and asks a model to choose among them or report that a match needs review. The model can interpret an ingredient request, while the tools carry concrete product identifiers, store context, and cart operations.

A useful grocery interface needs a way to say it could not find a suitable match. A convincing product description is not a substitute for an available product I can inspect.

## Carry the plan beyond the conversation

[Grocery Agent Mobile](https://github.com/aranlucas/grocery-agent-mobile) gives planning a dedicated interface with saved recipes, saved lists, chat history, and household sharing. Its documented flow moves from a conversation into list review and then, optionally, Kroger cart actions.

Planning can happen without connecting a retailer. When a shopper does connect Kroger, the flow still includes confirmation before sending matched items to the cart. That separates exploring a meal plan from acting on it.

The mobile app also addresses a practical property of groceries: the work can be shared. A useful list is something another household member can reopen and act on. It needs to remain available after the conversation that produced it.

[Pantry Pulse](https://github.com/aranlucas/pantry-pulse) explores the physical side. An RFID station records consume-or-restock events against inventory, and items below their targets contribute to a shopping queue. The hardware gives a household another way to update the record; MCP tools expose that same inventory to an assistant.

There is a network problem hidden inside a scan. A device can lose its connection after sending a change, then retry. Preserving the event's identity lets the server distinguish a repeated request from another item being consumed. The system still depends on people scanning or correcting their inventory, but a retry should not create a second change.

Together, these repositories cover collecting recipes, matching products, preserving a plan, coordinating a list, and recording inventory. They are related tools and experiments, not a claim that every part currently works as one seamless application.

The recurring design choice is to leave behind something inspectable: a recipe draft, a matched product, a shared list, or an inventory event. Conversation helps express the intention. Those records make it possible to check the work and continue with it later.
