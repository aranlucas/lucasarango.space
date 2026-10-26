# Portfolio feature roadmap

Updated 2026-10-26. Proposed visitor-facing work; Digits/MCP features remain the
portfolio priority, and the 404 game is deferred.

## Starting point

At `eaad45bc8e3c5f8ad0671a83cbd2d3ebd2261f2b`, the [site](README.md)
already presents projects, writing, a public resume, an Ask assistant and
read-only WebMCP discovery. The resume repository owns professional facts;
project source and deployment status must be distinguished.

## Ordered releases

1. **Find the project relevant to a visitor's task.** Curate project entries by
   problem solved, intended user and current usable experience, beginning with
   Digits/MCP. Acceptance: each entry has a clear next step and evidence link;
   prototype, available demo and maintained release are not interchangeable
   labels; unmeasured business outcomes are not invented.
2. **Inspect the evidence behind an Ask answer.** Connect claims to the relevant
   published post, project or resume section.
   Acceptance: citations resolve to available public sources, unsupported
   questions are acknowledged, and model-supplied links cannot bypass the
   allowed content boundary. Share source identifiers with the existing tools
   instead of duplicating content in another retrieval store.
3. **Turn a useful visit into an intentional next step.** Offer task-specific
   links to try a product, read a technical case study or use a published
   contact path. Acceptance: the visitor chooses the action; no message is
   sent automatically; a click is not reported as a qualified lead.
4. **Keep human and agent discovery consistent.** Expose the same curated
   project status and source freshness through page content and existing
   WebMCP tools. Acceptance: draft/private material stays excluded, unsupported
   browsers retain normal navigation, and stale data is labeled rather than
   silently described as current.

## First slice and evidence

Start with five Digits/MCP project entries and observe five visitors trying to
find a useful product. Measure whether they understand what works today, reach
the intended next step and return. Use aggregate voluntary observations rather
than collecting chat contents. Establish a baseline before conversion targets.

Reuse existing content schemas and native checks. Content/design changes need
their appropriate rendered review; this document changes no UI or published
professional facts. Follow the repository's [contribution rules](AGENTS.md).
