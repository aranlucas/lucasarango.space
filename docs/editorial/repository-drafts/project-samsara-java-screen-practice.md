---
title: "Practicing the follow-up, not just the first answer"
date: 2026-09-01
summary: "A set of staged Java exercises makes changing requirements part of interview preparation."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/samsara-java-screen-practice
---

A practical coding screen can start with a small task and then change the requirements. Preparing only the first solution leaves out the work of extending an API, handling malformed input, or preserving behavior under a new constraint.

The goal is to build contained exercises with progressive follow-ups and executable reference behavior.

The private `samsara-java-screen-practice` repository contains ten Java exercises, including parsing, duration formatting, retries, event aggregation, and configuration merging. Each question includes multiple inputs, follow-ups, a reference solution, and tests.

The repository labels material by its basis—publicly reported, preparation-guide-adjacent, or inferred practice. It explicitly avoids promising current interview questions.

That structure makes the exercise reusable: attempt an initial implementation, take a follow-up, and compare behavior with the tests. The learning can focus on the transition between requirements rather than memorizing one finished answer.

The result is an executable practice collection for staged reasoning in Java. Tests provide a way to inspect behavior; they do not establish readiness for an employer's actual interview.

The personal account needs one session in which a follow-up forced a design change, plus the role an agent played in generating, reviewing, or challenging the solution.
