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

## Updating the portfolio

- `src/lib/site.ts`: site identity, work overview, and coauthored publications.
- `src/lib/projects.ts`: selected public projects, source links, and related posts.
- `src/lib/resume.ts`: résumé experience, skills, and education. Keep employment dates
  aligned with the work overview in `site.ts`.
- `content/posts/`: personal writing. Keep an existing filename when changing a title
  so published links continue to work.

The résumé page has a print layout for saving as PDF. Verify both screen and print
layouts after changing its content. Page metadata shares RSS discovery and the site
Open Graph image; article routes generate their own share images.
