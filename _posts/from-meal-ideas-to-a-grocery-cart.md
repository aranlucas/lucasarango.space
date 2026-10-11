---
title: From meal ideas to a grocery cart
date: 2026-09-08
summary: Recipes, product matching, shared lists, and pantry inventory are
  different parts of the same grocery problem. Reviewable drafts and durable
  records make each handoff easier to check and recover.
draft: false
---

Groceries are one of the places where I actually use the software I build. The request sounds simple: help me decide what to cook and get what I need. Doing it means dealing with recipes, quantities, real store products, a shopping list, and whatever is already at home.

My first grocery MCP server connected Claude to Kroger so it could search my local QFC and add products to a cart. I wrote about that experiment and how it relates to my job in [the grocery MCP server behind my Ask DoorDash pitch](/blog/the-first-ask-doordash-prototype-was-an-mcp-server). This post covers what happens before and after picking a product.

A meal idea still has a long way to go before it's a shopping list. Ingredients need quantities, the store sells specific products, and someone has to check the plan. At every step, an answer that sounds right can turn into an annoying purchase.

## Make the information reviewable

[Janella Cookbook](https://github.com/aranlucas/janella-cookbook) handles an early step: keeping track of things worth cooking. Recipes can come in as links, photos of recipe pages, pasted text, or manual entry, and extraction produces an editable draft before anything is saved.

That draft gives a person a chance to fix a quantity or an instruction. If I import the same source again, the app asks whether to open the saved recipe or review an update, so it won't overwrite my earlier corrections without asking. The [implementation notes](https://github.com/aranlucas/janella-cookbook/blob/e60314424322b4a3c25bbe03953224a953177eac/docs/design/recipe-workflow.md) also cover recoverable drafts and save identities, which make a retried save return the same recipe.

Saving a recipe is supposed to keep my work. If a failed save loses my corrections, or a second import overwrites them, the next model call has just made another chore for me.

The cookbook also has a useful shortcut: a page containing a complete schema.org recipe can be parsed without AI. Keyword search is written when the recipe is saved, independently of optional embeddings. Collecting a recipe and finding it again can keep working without adding a generation or embedding dependency to every step.

Picking products needs a similar checkpoint. [ai-shopping-mcp](https://github.com/aranlucas/ai-shopping-mcp) returns up to five eligible Kroger candidates per requested ingredient. The calling assistant chooses an exact UPC using the conversation's requirements. Searching makes no list or cart changes.

Take a request for cream. Whipping cream, sour cream, and cream cheese are all plausible search results, but the recipe decides which one belongs in the meal. A catalog match gives the agent evidence; it still needs to resolve the ingredient. I cover the selector experiments and cart recovery in [the grocery server post](/blog/the-first-ask-doordash-prototype-was-an-mcp-server).

A grocery interface has to be able to say it couldn't find a good match. I'd rather see that than a convincing description of a product I can't check or buy.

## Carry the plan beyond the conversation

[Grocery Agent Mobile](https://github.com/aranlucas/grocery-agent-mobile) gives planning its own interface, with saved recipes, saved lists, chat history, and household sharing. The documented flow goes from a conversation to reviewing the list, and optionally on to Kroger cart actions.

You can plan without connecting a store at all. If you do connect Kroger, the app still asks for confirmation before sending matched items to the cart, which keeps exploring a meal plan separate from acting on it.

The mobile app also accounts for groceries being shared work. Someone else in the household should be able to open the list and use it, so it has to stick around after the conversation that made it.

[Pantry Pulse](https://github.com/aranlucas/pantry-pulse) covers the physical side. An RFID station records when items are used up or restocked, and anything below its target amount goes into a shopping queue. The hardware is another way for the household to update inventory, and MCP tools give an assistant access to the same inventory.

A scan hides a network problem. A device can lose its connection after sending a change and then retry. The reference firmware keeps a bounded outbox on the ESP32 and reuses each event ID across retries. The server can tell a repeated request from a second item being used. People still have to scan things or fix the inventory by hand, but a retry won't count as a second change. Compact tombstones retain that protection even after detailed event history is pruned.

Manual corrections need a different check. If two people open an item showing three cans and one consumes a can before the other saves a correction, the old screen is now stale. Pantry Pulse can reject that correction with `inventory_conflict`; stock, metadata, and the inventory event commit together. The [inventory contract](https://github.com/aranlucas/pantry-pulse#linking-and-stock-corrections) makes that disagreement visible instead of quietly losing the newer scan.

Between them, these repositories cover saving recipes, matching products, keeping a plan, sharing a list, and tracking inventory. They're related tools and experiments, and they don't yet work together as one app.

The choice I keep making is to leave behind a record I can check: a recipe draft, a matched product, a shared list, or an inventory event. The conversation is where I say what I want, and those records let me check the result and pick it up later.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
