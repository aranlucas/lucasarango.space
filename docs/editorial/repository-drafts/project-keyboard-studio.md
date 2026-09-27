---
title: "Putting Codex status on a small keyboard"
date: 2026-08-30
summary: "Keyboard Studio combines a native keyboard configurator with an interface to local Codex activity."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/keyboard-studio
---

A coding agent can work for long enough that checking its state becomes a repeated action. A small programmable keyboard offers another place to put status and controls, but it also needs software that understands the device.

The goal is to create a native macOS interface for a SayoDevice O2L and connect it to useful information about Codex activity.

[Keyboard Studio](https://github.com/aranlucas/keyboard-studio) is a SwiftUI configurator with lighting, macros, gesture profiles, backups, and a Codex status interface. Device edits are staged and written when the user chooses Save to keyboard.

The [Codex activity service](https://github.com/aranlucas/keyboard-studio/blob/main/Sources/KeyboardCore/CodexActivityService.swift) reads local summary data and session lifecycle events. It opens the summary database read-only and interprets session events to assemble runtime status.

This gives the project two boundaries: a device protocol for configuration and a local observation path for agent activity. The application also includes read-only device and protocol inspection tools.

The repository implements a physical-interface experiment around the coding workflow. It makes agent observation a separate concern from issuing the next prompt.

That capability is distinct from proving that every control works reliably on hardware or that the deck improves daily work. The next useful result to record is which buttons or indicators actually became part of my routine, along with the device behavior I verified.
