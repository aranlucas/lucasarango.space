---
title: "A résumé small enough to put in the prompt"
date: 2026-09-26
summary: "Resume Chat answers questions from a supplied résumé without a separate retrieval index."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/resume-chat
---

A résumé is organized for scanning, but a visitor may arrive with a specific question about experience or a project. A conversational interface can offer another way into the same material.

The goal is to answer questions from the actual résumé while keeping the information path understandable.

[Resume Chat](https://github.com/aranlucas/resume-chat) is a Next.js application that supplies the résumé directly in the model's system prompt. The current README describes fetching the published résumé source and using the Vercel AI SDK with OpenRouter.

For this bounded source, the application does not need a separate vector database or embedding pipeline. The interesting decision is the size and shape of the knowledge source: a résumé is short enough to supply directly.

The repository predates the December 2025 start of my agentic coding chapter. Its current implementation can be documented, but the history of how I revisited it needs to be recorded separately.

The current result is a conversational view over a supplied résumé, with a simpler information path than a full retrieval system. Its existence does not establish answer accuracy or whether a recruiter found it useful.

A useful follow-up would compare a real visitor question with the source passage and the answer, then describe how the project changed from its earlier version.
