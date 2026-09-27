---
title: "Letting practice leave a record"
date: 2026-07-30
summary: "NeetCode submissions become a small versioned archive for returning to interview exercises."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/neetcode-submissions
---

I use these solution repositories for interview learning. Keeping the code after completing an exercise makes the attempt available for later review instead of leaving only a completion mark.

The goal is to capture submitted solutions without making a separate manual archiving step part of every practice session.

[neetcode-submissions](https://github.com/aranlucas/neetcode-submissions) documents NeetCode's GitHub synchronization workflow. The current tree contains Java submissions under topic and problem directories, including multiple saved submissions for an anagram exercise.

The repository is intentionally an output of practice rather than another application to operate. That keeps its role clear alongside my other projects: LeetFlow helps choose a pattern, a contextual tutor can help during an attempt, and a submission archive preserves the code afterward.

Those tools need not all have been used together for the archive to remain useful.

There is a concrete recent maintenance change: the [September workflow update](https://github.com/aranlucas/neetcode-submissions/commit/a515d83fa08d04f308b3946da393c0e3a222b995) adds automatic validation of GitHub Actions files when workflows or dependency configuration change. That gives future maintenance edits a check of their own.

The observable result is a set of saved submissions that can be compared or revisited. Neither the README nor the files establish a measured learning gain or how much assistance went into an individual solution.

The personal part to add is how I use the archive after the initial submission, and whether comparing attempts changes what I practice next.
