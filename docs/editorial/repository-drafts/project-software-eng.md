---
title: "Revisiting a Raspberry Pi project years later"
date: 2026-08-31
summary: "A legacy sensor dashboard preserves an early device-to-web system to inspect and modernize."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/software-eng
---

Returning to old repositories has become part of my agentic experience. The private `software-eng` repository dates to a 2014 software-engineering project and spans both a Raspberry Pi and a web application.

The goal is to recover how sensor information moves through the system before deciding which parts to modernize.

The repository describes a legacy Raspberry Pi sensor dashboard and HTTP API. Its tree includes Python temperature-reading code, website components, and versioned database-schema directories.

That makes the project different from a standalone frontend exercise. A change may affect device collection, server behavior, or the representation of historical readings. The first useful artifact is an accurate account of those connections.

The current README is deliberately brief and no longer includes old credentials or personal contact information. It points back to the source and configuration for understanding the system.

There is a concrete recent maintenance change: the [September workflow update](https://github.com/aranlucas/software-eng/commit/6e2d420ca78983e6036c5c98ade6c2557a353b27) adds automatic validation of GitHub Actions files when workflows or dependency configuration change. That gives future maintenance edits a check of their own, even in a repository whose application code is much older.

The preserved repository provides a concrete old device-and-web project to revisit. My broader motivation is modernization, but the available evidence does not establish that the original hardware and service have been restored together.

The strongest next addition is one traced reading—from the device code to the dashboard—and a description of what changed during the revisit.
