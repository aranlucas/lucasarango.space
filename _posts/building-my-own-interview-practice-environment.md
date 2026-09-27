---
title: Building my own interview practice environment
date: 2026-09-12
summary: My interview projects range from solution archives to shared
  whiteboards. The common question is how to make assistance improve the
  practice itself.
draft: false
---

My interview repositories each cover a different part of learning. Some keep solutions, some help me spot a pattern, and others give me somewhere to explain a design, answer a follow-up, or build a feature under constraints.

An explanation can feel clear and still leave the next problem just as hard to start. That makes help tricky during practice. It can get me to the next step, or it can skip the step I needed to learn.

The repositories span years. The older study tools and solution collections predate December 2025, when I started coding with agents, and revisiting and modernizing old work is part of what I've been doing since. Not all of them started as software an agent wrote.

## From a saved answer to a decision

The LeetCode and [NeetCode submission archives](https://github.com/aranlucas/neetcode-submissions) keep my practice as files I can go back to. [leetcode-sync](https://github.com/aranlucas/leetcode-sync) has workflows for syncing and formatting them, and the private `leetcode` repository keeps problem descriptions, code, and the occasional note together.

An archive tells me what I wrote. It won't necessarily help me pick an approach when I see a new problem.

[LeetFlow](https://github.com/aranlucas/leetflow) shows that choice as an interactive decision tree. The features of a problem lead to a pattern, with a starter template, complexity notes, and practice problems alongside. Following the branches, I can see why a problem points to a sliding window, a heap, or a graph traversal.

The older [leetcode-flashcards](https://github.com/aranlucas/leetcode-flashcards) app has topic material and a problem browser. Despite the name, nothing in the source I looked at is a spaced-repetition system, so I think of it as one more way to browse study material.

[ProblemPrism](https://github.com/aranlucas/leetcode-visualize) brings help into the exercise itself through a Chrome side panel. It can prepare an explanation for the problem it detects, give hints and visualizations, and review code when asked. Reading my current code is a separate review action, which keeps help understanding the question apart from feedback on my attempt.

All of these target the stretch before I have a working solution. What matters is the decision or correction they help me make.

## Practice the follow-up

A practical coding exercise often changes after the first answer. A parser gets malformed input, a retry helper needs a different error policy, or a data structure has to handle events in another order.

My private Java practice repositories build those changes into the exercise. `samsara-java-screen-practice` has staged prompts, reference solutions, and tests. `rippling-tech-screen` focuses on two backend problems, driver payroll and expense rules. The tests pin down the expected behavior well enough to push back on an implementation.

These are practice materials, and I can't say whether any employer asks these questions now. What they give me is a counterexample for my solution to run into. A follow-up shows whether the design can change without breaking what already worked.

`onsite-lab` widens practice to conversation rounds, technical deep dives, system design, and building features with AI help. It keeps attempts in the browser, can export them, and can give optional feedback against a rubric. I can review any score the model proposes, so it doesn't get the final say on an attempt.

## Give the discussion a shared object

For system design, the shared object is a diagram. [System Design Companion](https://github.com/aranlucas/system-design-companion) puts me and the agent on the same Excalidraw canvas. The agent reads components and connections, sees what I've selected, and can point at things or edit them. Saved versions let me undo changes.

In [my write-up of practicing with it](/blog/practicing-system-design-with-an-ai-on-the-whiteboard), I describe drawing the first pass myself and then asking for hints, capacity estimates, and a rubric review. The agent responds to the design that's actually on the board, including the part I'm pointing at.

That's what connects the whole collection. A saved solution, a pattern decision, a failing test, and a shared diagram each give feedback something specific to respond to, and they leave me room to try the work first and look at what changed afterward.

Building the tools gets me a practice environment. What I actually want to know comes from practicing: whether I can explain a decision, handle the next constraint, or solve a similar problem without the same help. Those are the results I want to keep track of as I use it.
