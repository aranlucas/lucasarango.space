---
title: "A workout plan should tell me what to do next"
date: 2026-08-31
summary: "Set & Signal connects a training plan, a workout in progress, and the record used for the next session."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/set-and-signal
---

A workout plan is useful only if it can be followed while training. The immediate questions are small: what is scheduled, which set comes next, and what happened last time? A training log that takes too much attention competes with the workout.

The goal is to keep the plan, the active session, and the completed record connected, while exposing deliberate operations to an agent.

[Set & Signal](https://github.com/aranlucas/set-and-signal) is a workout planner and training log. Its [product documentation](https://github.com/aranlucas/set-and-signal/blob/main/docs/product.md) centers the experience on opening the scheduled routine, starting or resuming a workout, logging sets, and updating history when it is finished.

The surrounding screens support routines, exercise selection, statistics, and exports. MCP tools add another interface to the training system, including program previews checked against a revision. That creates a place to examine an assistant's proposed change before treating it as the current program.

The useful design principle is continuity. Planning with an assistant should lead to something the workout interface can execute and record.

The repository brings planning and execution into one training application, with an agent interface alongside the regular UI. It offers a concrete setting for investigating whether conversational planning is helpful when paired with a structured log.

I have not yet recorded a personal training outcome for this post. Its next revision should include a real workout and clarify the project's origins and the changes I made.
