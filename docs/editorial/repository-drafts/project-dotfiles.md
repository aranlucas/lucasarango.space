---
title: "Making my development setup repeatable"
date: 2026-09-06
summary: "A Stow-managed configuration and a small CLI give bootstrap, updates, and diagnosis named operations."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/.dotfiles
---

A development environment accumulates choices: shell behavior, editor settings, command-line tools, and agent configuration. Reconstructing those choices by memory makes a new machine or a broken setup harder to reason about.

The goal is to put the repeatable parts under version control and make installation and diagnosis explicit.

The private `.dotfiles` repository combines GNU Stow, Homebrew package lists, and a `dot` CLI. Its operations cover initialization, updates, symlinking, package management, and a doctor check.

The documented structure separates common packages from work-specific ones and managed files from local secrets. Agent and editor integrations are part of the managed environment. Bootstrap installs missing packages without turning every initial setup into a full upgrade.

For an agent-assisted workflow, this creates an inspectable target: the desired setup is represented in files and commands rather than only in instructions remembered from previous sessions.

The repository provides a repeatable configuration workflow and checks for common setup problems. It does not by itself prove that a fresh machine can be restored without intervention.

The strongest result to add would be a real bootstrap or repair: what the CLI handled, what still needed manual work, and which pieces of the agent environment became easier to maintain.
