---
title: "Turning item photos into a listing draft"
date: 2026-08-22
summary: "Snaphaul uses photos and seller details to generate structured marketplace copy for review."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/snaphaul
---

Listing an item for resale involves several kinds of writing: a title, a description, attributes, tags, and a price explanation. Photos contain useful evidence, but they do not arrive in the structure a marketplace expects.

The goal is to convert item photos and seller-supplied details into an editable listing draft for a selected marketplace.

The private `snaphaul` application accepts images and optional details such as brand, condition, size, and flaws. Its generation route validates the request and asks a vision-capable model for a structured result containing listing copy, item specifics, photo notes, and a suggested price range.

The route can supplement the output with eBay comparisons when the integration is available. Those comparisons are separate from the model's estimate, and their absence does not become proof that the estimate is accurate.

The code reviewed here generates a draft. It does not establish automatic marketplace publication or a completed sale.

The implemented result is a structured listing proposal from photos and seller input. That is a useful boundary for review: the seller can inspect the inferred identification, condition, and price before relying on them.

The personal result needs an actual item and a comparison between the generated draft and what was eventually listed. The landing page's speed and sales language is not a measured outcome for this article.
