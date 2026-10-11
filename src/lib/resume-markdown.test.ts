import { expect, test } from "vitest";

import { LOOKING_FOR, type Resume } from "./resume";
import { resumeToMarkdown } from "./resume-markdown";

const resume: Resume = {
  name: "Lucas Arango",
  title: "Software Engineer",
  location: "Seattle, WA",
  profiles: [{ label: "github.com/aranlucas", href: "https://github.com/aranlucas" }],
  summary: "Builds agent platforms.",
  roles: [
    {
      company: "DoorDash",
      title: "Software Engineer",
      location: "Seattle, WA",
      dates: "Oct 2023 – Present",
      bullets: ["Shipped Ask.", "Kept it up."],
    },
  ],
  projects: [
    { name: "Site", url: "https://lucasarango.space", kind: "web", bullets: ["This site."] },
    { name: "Offline", kind: "cli", bullets: ["No link."] },
  ],
  publications: [
    {
      title: "A post",
      href: "https://example.com/post",
      publisher: "Example",
      date: "2024-03",
      summary: "About things.",
    },
  ],
  skills: [{ category: "Languages", items: ["TypeScript", "Go"] }],
  education: [
    {
      school: "State University",
      degree: "B.S., Computer Science, 3.9",
      location: "Somewhere",
      dates: "May 2016",
    },
  ],
};

const EXPECTED = `---
title: "Lucas Arango résumé"
author: "Lucas Arango"
url: /resume
canonical_url: https://lucasarango.space/resume
---

# Lucas Arango

Software Engineer · Seattle, WA

[github.com/aranlucas](https://github.com/aranlucas)

## Summary

Builds agent platforms.

${LOOKING_FOR}

## Experience

### DoorDash

Software Engineer, Seattle, WA · Oct 2023 – Present

- Shipped Ask.
- Kept it up.

## Personal projects

### [Site](https://lucasarango.space)

- This site.

### Offline

- No link.

## Writing

- [A post](https://example.com/post) · Example, Mar 2024

## Skills

- **Languages:** TypeScript, Go

## Education

### State University

B.S., Computer Science, 3.9, Somewhere · May 2016
`;

test("resumeToMarkdown renders every section of the résumé page", () => {
  expect(resumeToMarkdown(resume)).toBe(EXPECTED);
});
