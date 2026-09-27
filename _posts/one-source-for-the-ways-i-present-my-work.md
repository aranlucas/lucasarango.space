---
title: One source for the ways I present my work
date: 2026-09-24
summary: A résumé, a CV, a website, and a chat interface need different presentations. Shared structured content keeps their maintenance connected.
draft: true
---

My work appears in several forms: a résumé document, a page on this site, project descriptions, and answers to questions about my experience. Each format has a different job, but the facts behind them should agree.

There is a similar repetition in maintaining résumés for different people. The content must stay separate, while formatting and generation problems often recur. A fix to the renderer can be reusable even when no personal information should move between documents.

The projects around my résumé explore those two kinds of reuse: one person's information reaching several presentations, and several documents using the same rendering machinery.

## Separate the facts from the layout

[Resume Template](https://github.com/aranlucas/resume-template) takes JSON Resume data and renders it through LaTeX. It provides a compact résumé template and a longer CV template, with sections that can be omitted when empty and titles that can be customized.

The repository also provides a CLI and a reusable GitHub Actions workflow. A consuming repository can retain its own information and generate reviewable TeX and PDF output through shared tooling.

That gives content changes and presentation changes different places to happen. Adding a publication should not require rediscovering the layout rules, and correcting a template should not require copying someone's career history into another project.

The private `resume-yani` repository uses that workflow for a CV. Its JSON content drives the generated documents, with generation available through a pre-commit hook and CI. The longer document can retain research and leadership sections while benefiting from the shared renderer.

`resume-carlos` belongs to the same document-maintenance effort, but its inspected repository still contains the older LaTeX source. That is a useful boundary in the account: it is part of the same family of work without being evidence that every document has already completed the same migration.

## Let each reader use a different interface

My private résumé repository supplies the structured source used by this site's résumé integration. The site's documented refresh hook updates the public-facing presentation after a résumé deployment, keeping the source and its consumers connected.

[Resume Chat](https://github.com/aranlucas/resume-chat) offers another route into that information. A visitor can ask a question instead of reading the document from top to bottom. Its current implementation puts the résumé directly into the model's context rather than maintaining a separate embedding and retrieval pipeline.

That choice fits the size of the material. A résumé is a bounded source, and supplying it directly keeps the path from information to answer understandable. The quality of an answer still depends on whether it stays faithful to that source.

[This site](https://github.com/aranlucas/lucasarango.space) adds the context that a résumé usually cannot hold. A project link shows where the code lives; a post can explain what prompted the work and what happened while building or using it. The site's assistant can list and read published posts, with links back to the writing behind an answer.

That makes the writing part of the information available about my work. An unfinished draft remains outside that published set. Recording a project accurately helps both a person reading the article and an assistant answering a later question.

The result is a collection of connected presentations with distinct responsibilities: structured data for the facts, templates for documents, a website for browsing, and conversation for specific questions. It is still worth reviewing the outputs individually. A correct data file does not guarantee a good page break or a faithful answer.

For an agent-assisted workflow, that separation provides concrete things to review. A proposed edit can be checked against the facts, a generated document can be inspected, and an answer can point back to its source. The automation is most useful when the output remains easy to examine.
