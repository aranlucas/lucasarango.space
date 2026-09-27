---
title: Returning to projects I thought I was done with
date: 2026-09-20
summary: Revisiting old repositories with agents has become part of my workflow.
  The work ranges from restoring application foundations to making maintenance
  checks useful again.
draft: false
---

Some of my repositories are very old. I've been going back to modernize them, and that's become as much a part of working with agents as starting new projects.

The first job is usually figuring out what's already there. A recent dependency file doesn't explain an old design. A passing workflow doesn't help if it never runs on the branch where changes land. A repository can look active while important parts of its original setup are still missing.

So modernization turns into a list of specific problems, and each change is easier to talk about when I tie it to what it restores or makes easier to maintain.

## Preserve the application while changing its foundation

[Better Bracket](https://github.com/aranlucas/better-bracket) started as a college group project in 2014. The app is still about tournament picks, groups, and past games, and its README documents a rewrite from CodeIgniter 2 to CodeIgniter 4.

It now has Composer-managed dependencies, a public web root, password hashing, CSRF protection, and a responsive interface. Database migrations and an idempotent seeder set the app up while keeping the historical tournament data.

In a rewrite like this, what I care about most is continuity. Changing the framework shouldn't make the old data meaningless, and knowing what the app used to do is how I decide what a successful update looks like.

[Garmin Friend Finder](https://github.com/aranlucas/garmin-friend-finder) needed smaller changes. Its docs record framework and tooling updates, plus a cached SQLite accessor meant to survive reloads during development. Those changes are about the everyday experience of running and working on the app.

A library runs into the same problem in its own way. [React Hook Form Mantine](https://github.com/aranlucas/react-hook-form-mantine) sits between two upstream APIs. It removes repetitive field wiring while keeping the differences between text fields, checkboxes, date inputs, and other controls. Keeping it useful means understanding how both libraries behave, which takes more than bumping version numbers.

## A small correction can restore a missing check

A recent [Spring Todo API change](https://github.com/aranlucas/spring-todo-api/commit/5c36fd7913e078fc0ba2cf3ce2546c30f3f85d89) switched the CI push trigger from `master` to `main`, the actual default branch. The check existed, but it wasn't running where ordinary changes landed.

In [leetcode-sync](https://github.com/aranlucas/leetcode-sync/commit/c47505ecab907809da34cc6642be1445e9287b16), a formatting workflow moved to Java 21 and got explicit write permission. That's maintenance on a learning archive: the saved solutions stay the same while the tooling around them catches up.

The older [Reminder](https://github.com/aranlucas/reminder) app, a Raspberry Pi sensor project, and some OpenCV experiments got workflow maintenance updates too. Their recent history shows those specific changes and nothing more. I haven't confirmed that the old email path, the physical device, or every image-processing experiment works end to end again.

Keeping that distinction keeps the work bounded. Fixing a workflow is a useful result by itself, as long as I don't treat it as proof the whole app works.

## Decide what deserves attention next

A collection this mixed is its own maintenance problem. Every repository has different dependencies, a different history, and different evidence about whether it works.

[Shipshape MCP](https://github.com/aranlucas/shipshape-mcp) turns public GitHub signals into a ranked maintenance plan. It marks each check as passing, failing, unknown, or not applicable. Telling a failure apart from missing evidence is especially helpful when I'm deciding what to look into.

The server ranks repositories deterministically from its rules. An assistant can help explain the report or act on it without inventing a new scoring policy each time, and I can inspect and question the rules.

The collection now has a few big rewrites, some smaller runtime and tooling updates, and fixes to the checks themselves. That tells me more about where things stand than saying everything is up to date.

I put revisiting these repositories right next to the new experiments. The old code already has a purpose, constraints, and past decisions, and working through them gives me and the agent something concrete to keep, question, and improve.
