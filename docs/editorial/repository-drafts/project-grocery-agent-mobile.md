---
title: "A grocery plan needs a place to live"
date: 2026-09-15
summary: "A dedicated mobile app carries meal planning into saved lists, reusable recipes, household sharing, and a reviewed Kroger cart."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/grocery-agent-mobile
---

Groceries are one of the areas where I actually use the software I build. A conversation can help decide what to cook, but the plan still needs to become a list that can be checked, revisited, and shared.

The goal is to give the grocery workflow a dedicated mobile home, including the parts that happen after the planning conversation.

[Grocery Agent](https://github.com/aranlucas/grocery-agent-mobile) provides a conversational planning flow for iOS and Android. A request can start with meals or a budget, then move into a reviewable list with quantities and matched products.

Saved lists and recipes preserve useful work for later. Household sharing lets members work from shared material, while chat history makes it possible to return to an earlier plan. Kroger is an optional connection for live products, prices, and cart actions; the documented flow asks for confirmation before sending matched items to the cart.

The distinction between planning and cart changes is a product decision. Someone should be able to organize dinner without first connecting a retailer, and connecting the retailer should still leave a review step.

The repository implements a path from a meal idea to a persistent, shareable shopping plan. It gives the grocery tools an interface suited to reopening a list and coordinating with another person.

My broader grocery workflow is in use. I still need to distinguish which parts of that use happen in this mobile app and which happen through the MCP server or another client before claiming a mobile-specific outcome.
