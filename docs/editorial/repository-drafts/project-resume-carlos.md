---
title: "Bringing another résumé into the shared workflow"
date: 2026-09-17
summary: "resume-carlos belongs to the same document-maintenance story as Resume Template and resume-yani, with its migration state still to clarify."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/resume-carlos
---

Maintaining résumés for different people repeats the same kinds of work: content edits, layout decisions, and PDF generation. I group `resume-carlos` with the Resume Template and `resume-yani` workflow.

The goal is to reuse the document-generation approach while keeping this résumé's information in its own repository.

The private `resume-carlos` repository currently exposes a LaTeX source and a short setup README. In contrast, [Resume Template](https://github.com/aranlucas/resume-template) documents structured JSON Resume input and reusable rendering, and `resume-yani` documents consuming that renderer.

That distinction matters for the story. The repositories belong to the same workflow in purpose, but the inspected `resume-carlos` tree does not yet show the JSON input and generation integration described by the other two.

The useful next step in the account is to identify whether this document is an earlier member of the workflow, a pending migration, or generated through a process outside its current tree.

There is a concrete recent maintenance change: the [September workflow update](https://github.com/aranlucas/resume-carlos/commit/68b482f69d6c4744518bb9183b33e5817f501fe3) adds automatic validation of GitHub Actions files when workflows or dependency configuration change. That gives future maintenance edits a check of their own, even in a repository whose application code is much older.

The confirmed result is its place in the shared résumé-maintenance effort. The technical migration status remains open, so this draft does not claim the renderer already updates it automatically.

Once that is clarified, one content or formatting change can show the benefit of the shared approach without exposing the résumé's private details.
