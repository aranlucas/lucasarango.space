---
title: One plugin repo for all my MCP servers
date: 2026-09-25
summary: lucas-plugins packages every MCP server I run, so Claude Code, Cursor
  and Grok get the same tools and I update them in one place.
draft: false
---
I run a handful of MCP servers now. One does my grocery shopping at Kroger, one plans and logs workouts, one reviews GitHub repos for maintenance work, one searches flights and hotels, and one is the System Design Companion whiteboard. Connecting each of them to each AI client by hand got old fast. Every client has its own config format, and when a server moved to a new URL I had to go fix it everywhere.

[lucas-plugins](https://github.com/aranlucas/lucas-plugins) is how I handle that now. It packages each server's connection together with instructions for using it, so I can install and update the same tools in every client that supports them. It's a small marketplace of [Agent Plugins](https://agent-plugins.org), an open packaging format for skills and MCP servers, with one plugin per server.

## What's in a plugin

Each plugin is a directory. `plugin.json` has the name, version and description, and `mcp.json` points at the hosted server, which for groceries is a single streamable HTTP URL. Most plugins also ship a skill that tells the agent how to use the tools well. The groceries skill spells out the usual path: call `shop_for_items`, add the resulting list to the cart, then check the cart.

Claude Code and Cursor each want their own marketplace catalog and manifest files, so the portable files are the source of truth and a sync script generates the rest. CI fails if the generated files are out of date.

## Installing

In Claude Code it's two commands:

```text
/plugin marketplace add aranlucas/lucas-plugins
/plugin install groceries@lucas-plugins
```

In Cursor, you import the repo as a marketplace from the plugin settings and turn on the plugins you want. Grok Build needs no setup of its own, because it [reads Claude Code's marketplaces, plugins and MCP servers](https://docs.x.ai/build/features/skills-plugins-marketplaces) automatically. Plugins backed by OAuth ask you to sign in the first time you use them.

## Keeping everything current

When a server changes, I edit its plugin in this repo and bump the plugin's `version`. Claude Code only [pulls a new copy of a plugin](https://code.claude.com/docs/en/plugins/host-marketplace#keep-users-up-to-date) when its version string changes, so the bump is what ships the update. Moving the travel plugin to a hosted server on Railway was a new URL in its `mcp.json` and a version change from 1.1.0 to 1.1.1.

Each client picks up the change a little differently. Claude Code leaves auto-update off for marketplaces you add yourself, so either turn it on for the marketplace under `/plugin` or run `/plugin marketplace update lucas-plugins` now and then. Cursor can [refresh a marketplace imported from a repo](https://cursor.com/docs/plugins) on every push once its GitHub app is installed, and Grok follows whatever Claude Code has installed.