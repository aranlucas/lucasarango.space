---
title: "A CV that shares the renderer but keeps its own content"
date: 2026-07-07
summary: "resume-yani applies the shared JSON Resume and LaTeX workflow to a longer professional CV."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/resume-yani
---

A professional CV can need research, publications, leadership, and other sections that do not fit the same layout as a compact engineering résumé. Sharing tooling should not force those documents to have identical content or structure.

The goal is to keep the CV's information local while reusing the document-generation machinery.

The private `resume-yani` repository stores its content in JSON Resume format and uses the CV template from [Resume Template](https://github.com/aranlucas/resume-template). Its README documents generated TeX and PDF files, rather than treating the TeX as the primary editing surface.

A pre-commit hook rebuilds the outputs when the JSON changes, and a GitHub Actions workflow provides another generation path. Section titles and custom section placement let the shared renderer accommodate the CV's organization.

This is one part of the résumé workflow that also includes my résumé and `resume-carlos`. Each document retains its own content while drawing on shared presentation work.

The repository has a repeatable path from structured CV content to a rendered document. A template fix can be reused without copying personal content between repositories.

The practical result still needs an editing example: a new section or publication that was easier to add, or a layout issue the shared workflow helped correct.
