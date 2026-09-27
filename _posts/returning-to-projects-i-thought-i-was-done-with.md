---
title: Returning to projects I thought I was done with
date: 2026-09-20
summary: Revisiting old repositories with agents has become part of my workflow. The work ranges from restoring application foundations to making maintenance checks useful again.
draft: true
---

Some of my repositories are extremely old. I have been returning to them to modernize the software, and that has become part of my experience with agents alongside building new projects.

The first job is often understanding what is already there. A recent dependency file does not explain an old design. A successful workflow does not help if it never runs on the branch where changes land. A repository can look active while important parts of its original environment are still missing.

That makes modernization a collection of specific problems. The changes become more useful to discuss when they are tied to the thing they restore or make easier to maintain.

## Preserve the application while changing its foundation

[Better Bracket](https://github.com/aranlucas/better-bracket) began as a college group project in 2014. The current application still concerns tournament picks, groups, and past games, but its README documents a rewrite from CodeIgniter 2 to CodeIgniter 4.

The foundation now includes Composer-managed dependencies, a public web root, password hashing, CSRF protection, and a responsive interface. Database migrations and an idempotent seeder provide a way to initialize the application while preserving the historical tournament dataset.

The interesting responsibility in a rewrite like this is continuity. Changing the framework should not make the old data meaningless. Understanding what the application used to do is part of deciding what a successful update looks like.

[Garmin Friend Finder](https://github.com/aranlucas/garmin-friend-finder) has a different scale of change. Its documentation records updates to the framework and tooling, plus a cached SQLite accessor intended to survive development reloads. These are changes around the day-to-day experience of running and working on the application.

A library has another version of the same problem. [React Hook Form Mantine](https://github.com/aranlucas/react-hook-form-mantine) sits between two upstream APIs. Its purpose is to remove repeated field wiring while preserving the differences between text fields, checkboxes, date inputs, and other controls. Keeping that boundary useful requires understanding both libraries' behavior, not just raising version numbers.

## A small correction can restore a missing check

One recent [Spring Todo API change](https://github.com/aranlucas/spring-todo-api/commit/5c36fd7913e078fc0ba2cf3ce2546c30f3f85d89) changed the CI push trigger from `master` to `main`, the actual default branch. The check could already exist and still miss the place where ordinary changes arrived.

In [leetcode-sync](https://github.com/aranlucas/leetcode-sync/commit/c47505ecab907809da34cc6642be1445e9287b16), a formatting workflow moved to Java 21 and received explicit write permission. That is maintenance around a learning archive: the saved solutions can remain the same while the machinery that handles them catches up.

The older [Reminder](https://github.com/aranlucas/reminder) app, Raspberry Pi sensor project, and OpenCV experiments received workflow-maintenance updates too. Their recent history supports those specific changes. It does not establish that the old email path, physical device, or every image-processing experiment has been restored end to end.

That distinction helps keep the work bounded. A workflow correction is a useful result on its own. It becomes misleading only when it is used to imply that the entire application has been validated.

## Decide what deserves attention next

A collection this varied creates its own maintenance problem. Each repository has different dependencies, history, and evidence about whether it is working.

[Shipshape MCP](https://github.com/aranlucas/shipshape-mcp) turns public GitHub signals into a ranked maintenance plan. Its model distinguishes checks that pass, fail, are unknown, or do not apply. The difference between a failure and missing evidence is especially useful when deciding what to investigate.

The server produces a deterministic ordering from its rules. An assistant can help explain or act on the report, but it does not have to invent a fresh scoring policy each time. The policy remains something that can be inspected and questioned.

The collection now contains examples of substantial rewrites, smaller runtime and tooling updates, and corrections to the checks themselves. That is a more useful picture of modernization than a single claim that everything is up to date.

For me, revisiting these repositories belongs beside the new experiments. The old code already contains a purpose, constraints, and decisions. Working through those gives the agent-assisted process something concrete to preserve, challenge, and improve.
