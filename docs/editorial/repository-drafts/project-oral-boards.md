---
title: "Giving the oral-boards study app its own home"
date: 2026-09-27
summary: "An extracted study app keeps its reference corpus and deployment independent of the wider agent platform."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/oral-boards
---

A study application has a different job from a general agent service. Its reference pages and search need to be available without requiring the entire platform checkout to build or deploy.

The goal is to make the oral-boards study interface independently runnable while retaining its existing development history.

The private `oral-boards` repository was extracted from `agents`, preserving the app directory's Git history. Its README documents a standalone Next.js app with local UI components and no workspace dependency on the old checkout.

The reference search corpus is an included SQLite snapshot traced into the search and document routes. Updating the source material is therefore an explicit replacement rather than an implicit dependency on a sibling repository. The app exposes cases, an exam framework, resources, search, and a study plan.

This is a software packaging story, not a claim that the included educational material has been clinically validated.

The result is a study application with its own build and deployment boundary. The reference corpus can travel with it, and the extracted history retains the path by which it was built.

The next personal detail to record is what prompted the extraction: a deployment obstacle, a change in how the app was used, or simply a clearer separation of responsibilities.
