---
title: "Putting market tools behind an inspectable boundary"
date: 2026-02-05
summary: "A trading monorepo separates an Alpaca client, assistant tools, and a stock-screening API."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/trading-mcp
---

An assistant discussing markets needs a way to distinguish provider data from generated interpretation. The integration also has responsibilities that should not depend on the wording of a prompt: configuration, shared types, and API access.

The goal is to separate market-data access from the interfaces that consume it.

The private `trading-mcp` repository organizes shared configuration and an Alpaca client in a core package, assistant-facing tools in an MCP package, and quotes, screening, and signals in a REST service.

The README documents provider configuration and a paper-mode option, alongside health and API-description routes. The package split makes it possible for more than one interface to use the same provider integration.

This post describes the software boundary. It does not recommend trades or treat generated signals as evidence of an investment strategy's quality.

The repository supplies tools and an API for working with market information. Code structure does not establish returns, signal quality, or safe live trading behavior.

The personal result still needs the purpose of the experiment and the environment in which it was tried. A useful example would show a question, the provider data retrieved, and how the resulting analysis was checked.
