---
title: "Keeping the tutor beside the problem"
date: 2026-07-31
summary: "ProblemPrism puts explanations, hints, visualizations, and requested code review into a Chrome side panel."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/leetcode-visualize
---

When a coding exercise and its explanation live in different places, even asking a question involves moving context. The tutor needs to know which problem is open and, sometimes, what the learner has tried.

The goal is to keep help close to the active problem and distinguish understanding the question from reviewing the learner's code.

[ProblemPrism](https://github.com/aranlucas/leetcode-visualize) is a client-only Chrome side-panel extension for LeetCode and NeetCode. It prepares an explanation for the detected problem after sign-in, then exposes examples, hints, visualizations, and optional interview practice inline.

Code review is a separate requested action. The README states that code is read when the user asks for review, rather than making editor contents part of every interaction. The extension uses ChatGPT without a separate ProblemPrism server or an OpenAI API key.

The interface is a useful distinction from a standalone practice app: it meets the learner in the environment where the problem is already being solved.

The repository provides a contextual tutoring interface that can discuss the active exercise and review a requested attempt. It reduces the amount of context the user needs to assemble for that interaction by design.

That is a capability claim, not evidence of better interview performance. The personal result needs a specific problem, the hint it gave, and whether that hint helped me reason through the next step.
