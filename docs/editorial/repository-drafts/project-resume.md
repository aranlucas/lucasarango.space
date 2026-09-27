---
title: "Keeping my résumé in one place"
date: 2026-09-26
summary: "A private résumé source feeds generated documents and the public-facing ways people read about my work."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/resume
---

My résumé appears in more than one form: a document, a page on my site, and context for conversational questions. Those surfaces can disagree if each owns a separate copy of the facts.

The goal is to keep the underlying career information in a source that the other presentations can consume.

The private `resume` repository is the source used by my site's résumé integration. The site's [documentation](https://github.com/aranlucas/lucasarango.space#resume) describes a published JSON Resume representation and a refresh hook that updates the site after a résumé deployment.

[Resume Chat](https://github.com/aranlucas/resume-chat) documents consuming that same source, and [Resume Template](https://github.com/aranlucas/resume-template) provides the shared document renderer. Together these establish a distinction between editing the information and presenting it.

The résumé repository's root README still focuses on installing LaTeX, so the cross-repository consumers currently explain the workflow more clearly than that entry point.

The result is a résumé source connected to several presentations, with a documented path to refresh the personal site. An agent can help edit structured content, but the facts and claims about my work still need my review.

The next useful example is one résumé change followed all the way through to the PDF, website, and chat context.
