---
title: One source for the ways I present my work
date: 2026-09-24
summary: A résumé, a CV, a website, and a chat interface need different
  presentations. A private JSON source, redacted public API, and shared
  renderer keep the facts connected without exposing every field.
draft: false
---

My work shows up in several forms: a résumé document, a page on this site, project descriptions, and answers to questions about my experience. Each has a different job, but the facts behind them should agree.

Keeping résumés up to date for other people has a similar kind of repetition. Their content has to stay separate, but the same formatting and generation problems keep coming back. A fix to the renderer can be shared even when no personal information should move between documents.

The projects around my résumé try out both kinds of reuse: one person's information feeding several presentations, and several documents sharing the same rendering code.

## Separate the facts from the layout

[Resume Template](https://github.com/aranlucas/resume-template) takes JSON Resume data and renders it with LaTeX. It has a compact résumé template and a longer CV template, sections that disappear when they're empty, and titles you can rename.

The repository also has a CLI and a reusable GitHub Actions workflow. Another repository can keep its own information and use the shared tooling to generate TeX and PDF output that someone can review.

That way content changes and presentation changes happen in different places. Adding a publication shouldn't mean relearning the layout rules, and fixing a template shouldn't mean copying someone's career history into another project.

The private `resume-yani` repository uses that workflow for a CV. Its JSON content drives the generated documents, which a pre-commit hook and CI can both build. The longer document keeps its research and leadership sections and still gets the shared renderer.

`resume-carlos` is part of the same effort, but its inspected repository still keeps the older LaTeX source. I can describe the shared maintenance work without claiming every document already uses the JSON renderer.

## Let each reader use a different interface

My private résumé repository keeps the full JSON source and builds an application PDF alongside public Markdown and JSON. The [public API](https://resume-api.aranlucas.workers.dev/resume.json) removes phone and email fields. Its build also checks the generated output for contact information before publishing it.

This site's résumé page consumes that public projection. A refresh hook can invalidate the cached copy after a résumé deployment. The application document and the website share facts while using different rules for what a reader should see.

[Resume Chat](https://github.com/aranlucas/resume-chat) is another way in. A visitor can ask a question instead of reading the document top to bottom. It currently puts the whole résumé in the model's context, with no separate embedding and retrieval pipeline.

That fits the size of the material. A résumé is short, and passing it in directly keeps the source of an answer inspectable. The same service publishes JSON for the experience timeline and Markdown for the assistant; the chat app does not maintain a second biography. The answer is only as good as its faithfulness to that source, though.

[This site](https://github.com/aranlucas/lucasarango.space) adds context a résumé usually can't hold. A project link shows where the code lives, and a post can explain why I started the work and what happened while I built or used it. The site's assistant can list and read published posts, and it links back to the writing behind an answer.

So the writing becomes part of what's available about my work, while unfinished drafts stay out of the published set. A question such as “How does the grocery server avoid adding items twice?” needs the implementation story in a post, not just the project name in a résumé. Describing a project accurately helps both the person reading the post and an assistant answering a question about it later.

[Repository Reels](https://github.com/aranlucas/repository-reels) explores another presentation: short, locally rendered films about repository work. Its production notes pin the source snapshot and keep rendered media separate from later changes. That is a useful constraint for a portfolio artifact. A film can show what was present at a particular revision without pretending to prove today's runtime behavior.

I end up with several connected presentations, each with its own job: structured data for the facts, templates for documents, a website for browsing, and chat for specific questions. I still check each output on its own, because a correct data file doesn't guarantee a good page break or a faithful answer.

When an agent helps with this, the separation gives me concrete things to check. I can compare a proposed edit against the facts, look over a generated document, and follow an answer back to its source. Automation helps most when its output stays easy to check.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
