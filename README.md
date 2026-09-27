# lucasarango.space

Lucas Arango's personal site: an about page, a resume and a blog. Next.js 16 (App Router, static pages plus one chat function),
Tailwind CSS v4 and shadcn/ui.

## Writing a post

Add a Markdown file to `_posts/`. The filename is the URL slug.

```md
---
title: Post title
date: 2026-09-25
summary: One sentence shown in lists, the RSS feed and link previews.
draft: true # optional; drafts only show in `pnpm dev`
---
```

## Develop

```sh
pnpm install
pnpm dev     # http://localhost:3000
pnpm check   # typecheck, oxlint (strict, incl. @shadcn/lint + oxlint-tailwindcss), oxfmt, vitest
pnpm build
```

A pre-commit hook runs oxfmt and oxlint on staged files, and CI runs `pnpm check` and
`pnpm build` on every pull request.

Styling uses theme tokens from `src/app/globals.css` (arbitrary Tailwind values are a lint
error). shadcn components live in `src/components/ui` and are left as generated; add more with
`pnpm dlx shadcn@latest add <component>`.

## Updating the portfolio

- `src/lib/site.ts`: site identity and coauthored publications.
- `src/lib/projects.ts`: selected public projects, source links, and related posts.
- `src/lib/resume.ts`: résumé experience, skills, education, and employment dates.
- `_posts/`: personal writing. Keep an existing filename when changing a title
  so published links continue to work.

The résumé page has a print layout for saving as PDF. Verify both screen and print
layouts after changing its content. Page metadata shares RSS discovery and the site
Open Graph image; article routes generate their own share images.

## Resume

`/resume` and the publications on `/blog` come from a
[JSON Resume](https://jsonresume.org/schema) published by the private
[aranlucas/resume](https://github.com/aranlucas/resume) repo at
[resume-api.aranlucas.workers.dev](https://resume-api.aranlucas.workers.dev/resume.json).
`src/lib/resume.ts` fetches it with a 30-day cache tagged `resume`; the resume
repo's deploy calls `POST /api/revalidate` to refresh it right away. Set `RESUME_API_URL` to build
against another copy (a base URL, e.g. a local `_site` server). Edit the resume there, not here.

## Ask about my work

A popup on every page (`src/components/ask/`) answers questions with an AI agent
(`src/lib/ask-agent.ts`, `POST /api/chat`). Its instructions hold the résumé Markdown
from the resume API and `src/lib/projects.ts`; it reads posts through the `listPosts` and
`readPost` tools, which give it each post's link to copy into answers.

| Variable             | Required | Default           | Description                                                |
| -------------------- | -------- | ----------------- | ---------------------------------------------------------- |
| `OPENROUTER_API_KEY` | Yes      |                   | OpenRouter key; without it the popup says it's unavailable |
| `OPENROUTER_MODEL`   | No       | `openrouter/free` | Any OpenRouter model id that supports tools                |

Requests are capped at 24 messages and 1,000 characters per question
(`src/lib/ask-config.ts`).
