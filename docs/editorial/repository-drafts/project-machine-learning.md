---
title: "Returning to the experiments that taught me image processing"
date: 2026-08-31
summary: "Small OpenCV scripts provide a concrete starting point for revisiting older learning code."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/machine-learning
---

Some older repositories are valuable as records of learning. My private `machine-learning` project dates to 2014 and contains small Python/OpenCV experiments rather than a deployed machine-learning product.

The goal is to preserve what the experiments demonstrate while making the old code easier to understand and run again.

The repository contains histogram, image-subtraction, feature-matching, and edge-detection experiments. Test files sit alongside several of those scripts, giving a reader something more concrete than the broad repository name.

The useful scope is image-processing behavior. Calling it a trained model or an agent system would overstate what the repository contains.

I have returned to old projects as part of modernization work with agents. For this one, the interesting account will be how an assistant helped reconstruct an experiment, adapt an old assumption, or explain a test.

There is a concrete recent maintenance change: the [September workflow update](https://github.com/aranlucas/machine-learning/commit/fe00b4b98285080d92a8785115f8239b2a904813) adds automatic validation of GitHub Actions files when workflows or dependency configuration change. That gives future maintenance edits a check of their own, even in a repository whose application code is much older.

The repository preserves a set of inspectable experiments and their supporting material. It provides a bounded place to compare old and updated behavior.

The specific modernization result is still to be recorded: which script was restored, what input was used, and whether the output matched the intended operation. No model-performance claim follows from this inventory.
