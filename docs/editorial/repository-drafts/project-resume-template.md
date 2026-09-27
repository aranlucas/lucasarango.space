---
title: "One résumé record, two kinds of document"
date: 2026-08-05
summary: "A reusable renderer turns JSON Resume data into a compact résumé or a longer CV."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/resume-template
---

A résumé has content and presentation that change for different reasons. Editing the document directly makes a formatting change compete with updating a job, publication, or date, especially when more than one person needs the same layout.

The goal is to keep the facts in a structured file and reuse the rendering machinery across résumé repositories.

[Resume Template](https://github.com/aranlucas/resume-template) renders JSON Resume data through LaTeX templates. The compact résumé and longer CV support different document needs, while empty sections can be skipped and section titles customized.

The repository supplies a CLI and a reusable GitHub Actions workflow. A consuming repository can keep its own data and call the shared renderer to produce the TeX and PDF outputs. Pull requests receive generated artifacts, giving document changes something concrete to review.

The abstraction is narrow: share the template and generation rules, while each résumé keeps its own content.

The result is reusable document production with a structured input. It also creates a clear path for an agent to help: propose a data or template change, generate the document, and inspect the output.

The README describes the intended PDF as ATS-readable. That is not a guarantee about every hiring system; the concrete output is a generated PDF whose text and layout can be checked. The personal result still needs the story of what was difficult in the previous editing process.
