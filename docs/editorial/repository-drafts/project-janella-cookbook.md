---
title: "Import the recipe, then let me check it"
date: 2026-01-02
summary: "Janella Cookbook separates recipe extraction, review, and saving so a useful collection can grow without silently replacing corrections."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/janella-cookbook
---

Recipes arrive as links, text, and pictures of recipe pages. Extracting their contents is only the first step: a collection becomes useful when those contents can be checked, corrected, saved, and found again.

The goal is to make recipe intake dependable enough that importing a source does not immediately commit every extraction mistake to the cookbook.

[Janella Cookbook](https://github.com/aranlucas/janella-cookbook) uses a Link, Photo, Text, or Manual intake flow with an editable review before persistence. Its [implementation notes](https://github.com/aranlucas/janella-cookbook/blob/main/docs/design/recipe-workflow.md) describe handling a known source by offering to open the saved recipe or review an update.

The persistence details support that interaction. A unique save key lets a retried creation return the same recipe; version checking protects edits; recoverable drafts keep a failed save from erasing the review work. Keyword search is maintained independently of embeddings, so basic retrieval does not depend on another model call.

This is a useful role for AI in a personal collection: help interpret the source, then hand an editable object to the person who will use it.

The repository records local verification of the intake and persistence improvements, including saving, reopening, editing, and duplicate handling. Those are documented local results, not tests rerun for this article or evidence that every external integration is working in production.

The resulting workflow makes review a first-class step. The personal part of the story still needs an example of a recipe imported, corrected, and cooked.
