---
title: "Practicing a backend problem through its rules"
date: 2026-08-27
summary: "Two Java exercises make payroll intervals and expense policies concrete enough to test."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/rippling-tech-screen
---

Interview preparation is more useful when a problem's rules are executable. Payroll cutoffs and expense policies sound straightforward until overlapping intervals, repeated operations, or changing rules make the edge cases visible.

The goal is to create contained backend exercises whose behavior can be checked without setting up external services.

The private `rippling-tech-screen` repository has two independent Java/Maven projects. One models hourly driver payroll with half-open delivery intervals and a paid-through cutoff that moves forward. The other models expense and trip violations through a configurable rule engine.

Each question has its own code, tests, and design notes. The README describes the tests as the specification and keeps persistence and external services outside the exercises.

The separation matters for practice: each exercise can be read, attempted, and tested on its own, with the hard part concentrated in the rules.

The repository provides executable preparation material for reasoning about backend behavior. It can show whether an implementation satisfies the specified cases without claiming to reproduce a current employer interview.

What still needs documenting is the practice session itself: which edge case exposed a gap, how an agent helped, and what I could explain more clearly afterward.
