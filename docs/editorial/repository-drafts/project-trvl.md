---
title: "Giving travel search a reusable interface"
date: 2026-04-27
summary: "trvl exposes travel discovery through both a CLI and MCP so search can be part of more than one planning surface."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/trvl
---

My travel websites are references I use during adventures. Before the itinerary exists, there is a different task: researching places and transport choices. That search capability can be useful from a terminal, an assistant, or a larger planning workflow.

The goal is to expose travel discovery through interfaces that can be reused across clients.

The private `trvl` repository provides a Go CLI and MCP server for flights, hotels, ground transport, rental cars, destinations, and trip plans. The README documents direct command-line use and installation into a supported MCP client.

This places provider-backed search behind a reusable tool boundary. The client can decide how to ask for or present the information, while the server owns the integration surface. Available searches depend on provider configuration.

The [travel plugin](https://github.com/aranlucas/lucas-plugins/tree/main/plugins/travel) is one way to package access to that capability for an agent client.

The repository provides a reusable travel-search interface. My confirmed outcome is the broader habit of building and using travel websites; I have not yet documented which trips relied on `trvl` specifically.

A useful next account would follow one search into a planning decision and then into the itinerary. That would connect the tool architecture to the adventure it helped organize.
