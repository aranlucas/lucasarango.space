# lucasarango.space

[![CI](https://img.shields.io/github/actions/workflow/status/aranlucas/lucasarango.space/ci.yml?branch=main&label=CI)](https://github.com/aranlucas/lucasarango.space/actions/workflows/ci.yml)

[lucasarango.space](https://lucasarango.space) is Lucas Arango’s portfolio, résumé, and blog. The Ask popup answers questions about his work; browser agents can discover the same public content through WebMCP and Markdown routes.

## Local development

Use the Node.js version in [`.node-version`](.node-version) and the pnpm version in [`package.json`](package.json).

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Development runs through [Portless](https://github.com/vercel-labs/portless); open the URL printed by the command. Draft posts are visible only in development.

`pnpm check` runs type checking, lint, formatting, and unit/component tests. CI also runs `pnpm build` and `pnpm test:e2e`; the latter requires the production build and installed Chrome. See [`playwright.config.ts`](playwright.config.ts) for its server and browser configuration.

## Ask and résumé configuration

The site builds without AI credentials. To enable Ask locally, create `.env.local`:

```dotenv
FREELLMAPI_BASE_URL=https://your-freellmapi-host.example/v1
FREELLMAPI_API_KEY=...
# Optional; defaults to auto
FREELLMAPI_MODEL=auto
```

The base URL must expose FreeLLMAPI's OpenAI-compatible Chat Completions API. Keep credentials server-side. Missing configuration leaves Ask unavailable; the rest of the site remains usable.

Professional facts are maintained in the separate `aranlucas/resume` repository. This site fetches its public JSON and Markdown from `https://resume-api.aranlucas.workers.dev`, including during builds. Set `RESUME_API_URL` to another base URL for a local or alternate résumé service. The résumé repository calls `POST /api/revalidate` after deployment to mark the cached résumé stale; this endpoint intentionally needs no authentication because it only refreshes public data.

## Browser-agent access

WebMCP exposes four read-only tools: `list_posts`, `read_post`, `get_resume`, and `list_projects`. Unsupported browsers retain normal navigation. Search accepts questions or keywords and matches words rather than synonyms; for example, `/blog/sitemap.md?query=grocery%20MCP&sort=relevance&limit=3`. See [`src/lib/site-agent-inputs.ts`](src/lib/site-agent-inputs.ts) for input contracts.

For manual local testing, enable `chrome://flags/#enable-webmcp-testing`. `pnpm build` followed by `pnpm test:e2e` exercises Chrome's native API with that feature enabled by the test configuration.

The public [origin-trial registration](https://developer.chrome.com/origintrials/#/registration/442038858738040833) is for `https://lucasarango.space` and expires **March 29, 2027**. Renew before expiry, replace the default token in [`next.config.ts`](next.config.ts) or set `WEBMCP_ORIGIN_TRIAL_TOKEN` in the hosting build environment, then redeploy. An empty value omits the header. The token is public and enables only its registered origin, so localhost and preview deployments need their own testing setup.

## Writing

Add Markdown to `_posts/`; the filename becomes the URL slug. Keep published filenames stable when changing titles.

```md
---
title: Post title
date: 2026-09-25
summary: One sentence used in lists, the RSS feed, and link previews.
draft: true
---
```

Metadata is validated during the build: titles and summaries must be nonblank, dates must be real `YYYY-MM-DD` dates, and `draft` must be a boolean rather than a quoted string. Omitted `draft` means published. [Pages CMS](.pages.yml) edits posts and the separate editorial-draft collection; drafts in `docs/editorial/repository-drafts/` are outside the blog's content directory.

See [PRODUCT.md](PRODUCT.md) for editorial boundaries, [DESIGN.md](DESIGN.md) for visual rationale, and [ROADMAP.md](ROADMAP.md) for proposed visitor-facing work. [Font provenance](src/app/fonts/README.md) includes the license and reproduction commands; [performance measurements](docs/performance.md) record the local loading baseline and its limits.
