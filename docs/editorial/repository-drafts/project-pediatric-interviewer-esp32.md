---
title: "An oral-boards practice session on a small device"
date: 2026-08-13
summary: "A touchscreen ESP32 and a Worker turn a prepared case into a bounded six-question interview."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/pediatric-interviewer-esp32
---

Oral-board preparation involves answering aloud and responding to a sequence of questions. A page of reference material serves a different purpose from an interface that runs the session.

The goal is to give a practice interview a dedicated device interface, with a clear start, a bounded sequence, and a review at the end.

The [pediatric interviewer](https://github.com/aranlucas/pediatric-interviewer-esp32) combines firmware for a Waveshare ESP32-S3 touchscreen, a web setup client, and a Cloudflare Worker. The web client prepares the case; the device runs a six-question interview and displays a bounded review.

Separating setup from the interview is the distinctive design choice. The larger interface can handle configuration, while the device presents the session itself.

This is an educational prototype. Its documentation directs users to authoritative pediatric dentistry references to review clinical answers; neither the device nor this article establishes medical validity.

The result is a hardware-and-web workflow for structured interview practice. It explores how an agent-assisted product can take a form other than a browser chat window.

The personal story still needs the hardware session: who tried it, which interactions worked, and whether the dedicated device was more useful than opening a laptop. Exam performance is not established by the repository.
