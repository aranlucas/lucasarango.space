---
title: "Returning to a college bracket project"
date: 2026-09-17
summary: "Better Bracket preserves the idea of a tournament app while rebuilding its application foundation."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/better-bracket
---

Better Bracket began as a college group project in 2014. Revisiting software from that era brings a different kind of challenge from starting a new app: the existing behavior and data have to be understood before the surrounding framework can change.

The goal is to carry the bracket application forward while retaining its tournament functionality and historical dataset.

[Better Bracket](https://github.com/aranlucas/better-bracket) supports making picks, creating groups, and following past games. Its README documents a rewrite from CodeIgniter 2 to CodeIgniter 4, with Composer-managed dependencies and a public web root.

The current project includes password hashing, CSRF protection, session handling, and a responsive interface. It also documents an idempotent tournament seeder, migrations, and checks covering syntax, static analysis, tests, and dependencies.

The interesting part of this story is preservation: a modernization should make the old product runnable without losing the meaning of its data.

The repository contains a rewritten version of a longstanding project. That is the observable result; it does not establish which parts of the rewrite were agent-assisted or how they compare with the original group members' work.

A personal account should add that attribution and one specific migration problem. The creation date alone cannot tell the story of the recent work.
