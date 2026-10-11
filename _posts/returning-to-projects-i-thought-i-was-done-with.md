---
title: Returning to projects I thought I was done with
date: 2026-09-20
summary: Revisiting old repositories with agents has become part of my workflow.
  The useful changes preserve old data, consolidate study tools, and repair
  checks. Each needs evidence at the level of the behavior it restores.
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

## Consolidation is a kind of modernization

My interview tools used to occupy several repositories. The current private `leetcode` monorepo puts the study website, LeetFlow pattern finder, ProblemPrism extension, and shared GitHub syncing beside one content collection.

The migration preserves the problem statements and saved solutions as different files. Content refreshes do not overwrite solution directories, and website code excludes saved answers from page rendering and deployment traces. LeetFlow keeps its learned-state storage key, but browser state from a different hosting origin does not transfer automatically.

That is the part of a migration I want to describe precisely. Moving the code is one job; keeping content, practice behavior, and state expectations understandable is another. I explain the resulting practice loop in [the interview tools post](/blog/building-my-own-interview-practice-environment).

## A small correction can restore a missing check

A recent [Spring Todo API change](https://github.com/aranlucas/spring-todo-api/commit/5c36fd7913e078fc0ba2cf3ce2546c30f3f85d89) switched the CI push trigger from `master` to `main`, the actual default branch. The check existed, but it wasn't running where ordinary changes landed.

Solution syncing now has a more direct place in the LeetCode monorepo. Website and extension code share path validation and upload behavior; repeated identical code produces no new commit, and a conflict stops the write. Those are observable maintenance behaviors, beyond updating the runtime that executes a workflow.

[Reminder](https://github.com/aranlucas/reminder) has a more specific repair now: Composer-managed PHPMailer replaces the old bundled entrypoint, SMTP settings come from the environment, and the delivery contract distinguishes complete acceptance, partial acceptance, and total failure. Its offline tests use fake delivery outcomes. That can establish the application's handling of a failed send without establishing that a legacy carrier gateway still delivers to a phone.

The private Raspberry Pi `software-eng` project still needs its database and physical setup checked. A local server command and cleaner configuration are useful maintenance, but they do not establish a working sensor deployment.

## Reconstruct the experiment and audit its data

The private `machine-learning` repository has moved beyond workflow maintenance. It reconstructs my 2014 shelf-change experiment as a Python CLI, an OpenCV detector, reproducible benchmarks, and a [static comparison gallery](https://scene-change-gallery.aranlucas.workers.dev/).

The method chooses its comparison path from image correspondences. A stationary-camera pair uses exposure correction and color differences; a moving-camera pair needs local normalization and forward/backward dense correspondence. That distinction matters because glare, parallax, and a small missing object can all produce different-looking changes in the pixels.

The current README reports 201 correct classifications out of 204 on the corrected-label benchmark. The same documentation explains why that headline needs context: some pairs are identical files or re-encodes, photographs are reused, and two label corrections improved the count without changing predictions. Parameter exploration also used this small collection. It is development evidence, with new photographs still needed to test generalization.

The gallery makes the failure cases inspectable. I can compare before and after images, examine the highlighted region, and read the decision explanation. The area score is the fraction of usable pixels in the largest detected region; it is not a confidence percentage. An image-level label also cannot prove that every highlighted pixel identifies the changed object.

Reconstructing the old project gave me a runnable experiment. Auditing its data told me what the resulting benchmark could actually claim. Both are part of bringing it back.

## Decide what deserves attention next

A collection this mixed is its own maintenance problem. Every repository has different dependencies, a different history, and different evidence about whether it works.

[Shipshape MCP](https://github.com/aranlucas/shipshape-mcp) turns public GitHub signals into a ranked maintenance plan. It marks each check as passing, failing, unknown, or not applicable. Telling a failure apart from missing evidence is especially helpful when I'm deciding what to look into.

The server is read-only. Its [reports](https://github.com/aranlucas/shipshape-mcp) cover readiness, branch risk, delivery hygiene, and security posture, then rank repositories deterministically from the rules. A report can point to missing evidence without claiming it ran the application. An assistant can help explain the report or act on it without inventing a new scoring policy each time, and I can inspect and question the rules.

Looking across the newer prototypes makes the same distinction useful. [Holdfast](https://github.com/aranlucas/holdfast-local) stores receipt records in the browser and exports proof packets. Its build and browser checks can verify imports, backups, and offline behavior; deployment configuration alone does not establish that a hosted instance exists. [Paper Options Lab](https://github.com/aranlucas/paper-options-lab) replays synthetic paper events, so its passing risk invariants say something about those modeled scenarios, never about investment performance.

The collection now has a few big rewrites, consolidation work, some smaller runtime and tooling updates, and fixes to the checks themselves. That tells me more about where things stand than saying everything is up to date.

I put revisiting these repositories right next to the new experiments. The old code already has a purpose, constraints, and past decisions, and working through them gives me and the agent something concrete to keep, question, and improve.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
