# lucasarango.space

Lucas Arango's personal site: an about page, a resume and a blog. Next.js 16 (App Router, fully static),
Tailwind CSS v4 and shadcn/ui.

## Writing a post

Add a Markdown file to `content/posts/`. The filename is the URL slug.

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
