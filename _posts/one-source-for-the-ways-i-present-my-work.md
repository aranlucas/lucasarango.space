---
title: One source for the ways I present my work
date: 2026-09-24
summary: A résumé, a CV, a website, and a chat interface need different presentations. Shared structured content keeps their maintenance connected.
draft: true
---

My work shows up in several forms: a résumé document, a page on this site, project descriptions, and answers to questions about my experience. Each has a different job, but the facts behind them should agree.

Keeping résumés up to date for other people has a similar kind of repetition. Their content has to stay separate, but the same formatting and generation problems keep coming back. A fix to the renderer can be shared even when no personal information should move between documents.

The projects around my résumé try out both kinds of reuse: one person's information feeding several presentations, and several documents sharing the same rendering code.

## Separate the facts from the layout

[Resume Template](https://github.com/aranlucas/resume-template) takes JSON Resume data and renders it with LaTeX. It has a compact résumé template and a longer CV template, sections that disappear when they're empty, and titles you can rename.

The repository also has a CLI and a reusable GitHub Actions workflow. Another repository can keep its own information and use the shared tooling to generate TeX and PDF output that someone can review.

That way content changes and presentation changes happen in different places. Adding a publication shouldn't mean relearning the layout rules, and fixing a template shouldn't mean copying someone's career history into another project.

The private `resume-yani` repository uses that workflow for a CV. Its JSON content drives the generated documents, which a pre-commit hook and CI can both build. The longer document keeps its research and leadership sections and still gets the shared renderer.

`resume-carlos` is part of the same effort, but the repository I looked at still has the older LaTeX source. It belongs to the same family of work, and it hasn't finished the migration yet.

## Let each reader use a different interface

My private résumé repository is the structured source behind this site's résumé page. A documented refresh hook updates the public page after the résumé deploys, so the source and the places that use it stay in step.

[Resume Chat](https://github.com/aranlucas/resume-chat) is another way in. A visitor can ask a question instead of reading the document top to bottom. It currently puts the whole résumé in the model's context, with no separate embedding and retrieval pipeline.

That fits the size of the material. A résumé is short, and passing it in directly makes it easy to see how an answer came from the information. The answer is only as good as its faithfulness to that source, though.

[This site](https://github.com/aranlucas/lucasarango.space) adds context a résumé usually can't hold. A project link shows where the code lives, and a post can explain why I started the work and what happened while I built or used it. The site's assistant can list and read published posts, and it links back to the writing behind an answer.

So the writing becomes part of what's available about my work, while unfinished drafts stay out of the published set. Describing a project accurately helps both the person reading the post and an assistant answering a question about it later.

I end up with several connected presentations, each with its own job: structured data for the facts, templates for documents, a website for browsing, and chat for specific questions. I still check each output on its own, because a correct data file doesn't guarantee a good page break or a faithful answer.

When an agent helps with this, the separation gives me concrete things to check. I can compare a proposed edit against the facts, look over a generated document, and follow an answer back to its source. Automation helps most when its output stays easy to check.
