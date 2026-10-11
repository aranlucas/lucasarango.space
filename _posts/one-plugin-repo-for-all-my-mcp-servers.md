---
title: One plugin repo for all my MCP servers
date: 2026-09-25
summary: Five hosted MCP connections share portable plugin definitions and
  generated client manifests. Keeping the instructions aligned with the live
  tools is the next maintenance problem.
draft: false
---

I run a handful of MCP servers now. One does my grocery shopping at Kroger, one plans and logs workouts, one reviews GitHub repos for maintenance work, one searches flights and hotels, and one is the System Design Companion whiteboard. Connecting each of them to each AI client by hand got old fast. Every client has its own config format, and when a server moved to a new URL I had to go fix it everywhere.

[lucas-plugins](https://github.com/aranlucas/lucas-plugins) is how I handle that now. It packages each server's connection together with instructions for using it, so I can install and update the same tools in every client that supports them. The [repository](https://github.com/aranlucas/lucas-plugins#available-plugins) currently packages five hosted connections: groceries, workset, travel, Shipshape, and System Design Companion. Portable plugin definitions carry the connection and optional skills; generated manifests adapt them to clients.

## What's in a plugin

Each plugin is a directory. `plugin.json` has the name, version and description, and `mcp.json` points at the hosted server, which for groceries is a single streamable HTTP URL. Most plugins also ship a skill that tells the agent how to use the tools well. A grocery skill needs to explain how the agent gets household context, searches products, chooses exact UPCs, creates a list, and handles the cart result. Those instructions are part of the integration, because a reachable tool is only useful if the agent knows its contract.

Claude Code and Cursor each want their own marketplace catalog and manifest files, so the portable files are the source of truth and a [sync script](https://github.com/aranlucas/lucas-plugins/blob/ad878d3de66db166afa644aebff94c231fe398cd/scripts/sync.py) generates the rest. CI checks generated-file parity along with versions, paths, schemas, MCP URLs, and skill frontmatter.

Client-specific presentation can still be intentional. A plugin's optional `cursor.json` supplies a display name; regeneration preserves that customization. I can delete and recreate generated files without losing the name I chose.

## Installing

In Claude Code it's two commands:

```text
/plugin marketplace add aranlucas/lucas-plugins
/plugin install groceries@lucas-plugins
```

In Cursor, you import the repo as a marketplace from the plugin settings and turn on the plugins you want. Grok Build needs no setup of its own, because it [reads Claude Code's marketplaces, plugins and MCP servers](https://docs.x.ai/build/features/skills-plugins-marketplaces) automatically. Plugins backed by OAuth ask you to sign in the first time you use them.

## The instructions can drift even when the manifests pass

The grocery plugin gives me a concrete example. Its [skill](https://github.com/aranlucas/lucas-plugins/blob/ad878d3de66db166afa644aebff94c231fe398cd/plugins/groceries/skills/shopping-assistant/SKILL.md) still describes `shop_for_items` as a search-and-list operation returning a `listId`. The [current server contract](https://github.com/aranlucas/ai-shopping-mcp#kroger-product-search) returns product candidates and leaves selection and list creation to the caller. The skill also names tools that have since been consolidated.

The marketplace's schema and generated-file checks cannot establish that the prose matches a remote server. The next useful check is a contract review: which tools exist, what each returns, and what the agent should do after an unresolved result. That is one more reason to keep the skill near the connection definition: I have a definite place to update the workflow when the server changes.

For groceries, the intended sequence is search, choose products, save a list, add the reviewed items, then inspect the cart result. An unknown cart outcome calls for checking Kroger before another write. I describe that change in [the grocery server post](/blog/the-first-ask-doordash-prototype-was-an-mcp-server).

## Keeping everything current

When a server changes, I edit its plugin in this repo and bump the plugin's `version`. Claude Code only [pulls a new copy of a plugin](https://code.claude.com/docs/en/plugins/host-marketplace#keep-users-up-to-date) when its version string changes, so the bump is what ships the update. Moving the travel plugin to a hosted server on Railway was a new URL in its `mcp.json` and a version change from 1.1.0 to 1.1.1.

Each client picks up the change a little differently. Claude Code leaves auto-update off for marketplaces you add yourself, so either turn it on for the marketplace under `/plugin` or run `/plugin marketplace update lucas-plugins` now and then. Cursor can [refresh a marketplace imported from a repo](https://cursor.com/docs/plugins) on every push once its GitHub app is installed, and Grok follows whatever Claude Code has installed.

_Updated October 10, 2026. Implementation links reference the reviewed source revisions._
