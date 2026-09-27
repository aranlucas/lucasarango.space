---
title: "A live auction needs one official order"
date: 2026-08-23
summary: "Gavel Live uses one auction authority, saved retry results, and explicit deadline checks to keep bids and closing in the same order."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/live-auction
---

A live auction looks like a realtime interface: a changing price, a countdown, and a stream of bids. The harder part is deciding what happened when two bidders act at nearly the same time, or when a bid reaches the server just as the countdown ends.

The goal is to give each auction one official ordering for bids and closing, including requests retried or received near a deadline.

Gavel Live is my auction demo built around one authority for each auction. A Cloudflare Durable Object owns the bids, current leader, event history, and deadline. The browser can display those decisions, but it does not decide which bidder won. Different auctions have independent authorities, so they do not need a single global ordering point.

The bid transaction shows why that boundary matters. It reads the auction, checks whether the request is a retry, checks the deadline and minimum price, inserts the bid, updates the auction, and records an event and response. Only after the transaction completes does the code publish the saved result. A viewer may see an update late, but the published update represents a decision already made by the auction authority. This ordering is visible in [the auction implementation](https://github.com/aranlucas/live-auction/blob/5946676de0f60c65411959ca80a9804c4e0abb51/src/auction.ts).

Retries are part of that decision process. Each command includes an idempotency key scoped to its actor. The server stores the original successful response alongside the action type and a fingerprint of the request. Repeating the same bid returns that stored response; reusing the key with a different amount returns a conflict.

That is more precise than checking whether an actor has bid before. A bidder can legitimately place several bids, while a network retry should not become another bid. Returning the original response also avoids rewriting history with whatever the auction happens to look like when the retry arrives.

The countdown has similar edge cases. An alarm asks the auction to close when its deadline arrives, but a new bid also checks the deadline itself. A delayed alarm therefore does not create an accidental grace period for late bids. Conversely, an alarm that fires before an extended deadline re-arms itself. The anti-sniping rule extends the existing deadline when a qualifying bid arrives inside the configured final window.

The public contract uses integer cents for prices and explicit auction states: draft, live, closed, and cancelled. Events carry sequence numbers, and realtime snapshots carry a cursor and a resynchronization flag. These fields make both the state machine and gaps in delivery visible to a client. They are defined in the [request, response, and event schemas](https://github.com/aranlucas/live-auction/blob/5946676de0f60c65411959ca80a9804c4e0abb51/src/model.ts).

This remains a demo with a deliberately bounded scope. The [system design notes](https://github.com/aranlucas/live-auction/blob/5946676de0f60c65411959ca80a9804c4e0abb51/SYSTEM_DESIGN.md) distinguish auction correctness from payment eligibility, settlement, and video delivery. Those surrounding systems are not features I would claim this repository has implemented. Likewise, separating viewer delivery from bidding gives the design room to evolve, but it is not evidence of a particular tested audience size.

The part I would carry into another realtime system is the relationship between saving and broadcasting. First give an operation an official place in history. Then let as many clients as necessary observe that history, reconnect to it, and ask for missing pieces.
