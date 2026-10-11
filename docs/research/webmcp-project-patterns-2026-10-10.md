# Ideas from GitHub WebMCP projects

Initially checked 2026-10-10 (local date); updated 2026-10-11 with pdfcn. The recommendations below are inferences for lucasarango.space from source code and first-party project documentation, not claims that these dependencies should be installed. Question-friendly ranking, sorting, result limits/counts, and execution validation for `list_posts` are now implemented in this branch. Other capabilities remain proposals.

## 1. Current-page context and section-oriented reading

[astro-webmcp client, pinned source](https://github.com/fabricioctelles/astro-webmcp/blob/b2145ac7a177439ead76323437629dfb12ca5144/src/client.ts#L319-L350) implements `get_page_info`: title, description, headings (including IDs where present), path, language, canonical URL, and word count. Its content search also accepts a collection and result limit.

**Site idea:** add a compact `get_page_context` returning page kind, title, canonical URL, and section headings across About, Writing, Resume, and posts. Extend `read_post` with an optional heading/section argument so an agent can inspect the outline, then read the relevant evidence. Section reading is our proposal; it is not implemented by the cited metadata tool. The current no-argument `read_post` already reads the open post, so the new capability should add an outline and cover non-post pages rather than duplicate that behavior.

Borrow the concept, not all of this integration: its source/docs contain compatibility paths for older `provideContext` APIs and character truncation. A fixed 1,500-character limit is this library's choice, not a universal WebMCP limit. Avoid silently truncating a full article.

## 2. Ranked search with explicit pagination

[MCP webcomic base tools, pinned source](https://github.com/nearestnabors/mcp-webcomic-site-server/blob/f05893c10002ef37041f12a32653de713e339d6d/src/_includes/webmcp-base.njk#L96-L193) implements `search_comics` using Pagefind. Inputs include `query`, `limit`, `offset`, and `sort` (`relevance`, `newest`, `oldest`). The result carries `results`, `total`, `offset`, and `returned`. Each result has a URL, title, excerpt, and date; Pagefind highlight markup is stripped. It includes both text content and a `structuredContent` payload.

[The comic-page tools](https://github.com/nearestnabors/mcp-webcomic-site-server/blob/f05893c10002ef37041f12a32653de713e339d6d/src/_includes/webmcp-comic.njk#L34-L94) separately return current-page metadata and an accessibility transcript.

**Site idea:** extend `list_posts` with `limit` and `sort`; default unfiltered listing to newest and queried search to relevance. Return a total count and continuation information. Rank title/summary matches ahead of passing body mentions. With ten posts, a lightweight scoring function may suffice; Pagefind is a reference for the shape, not an immediate dependency recommendation. Keep Markdown links available even if structured fields are added, and verify consumer support for `structuredContent` instead of assuming it.

## 3. One command catalog for people and browser agents

[agentk README, pinned](https://github.com/stevysmith/agentk/blob/81a81d7dc5991f1a5eb19d49851bf3bbd8d6c631/README.md) defines one tool catalog used by a command palette and registered with WebMCP. Its [registration implementation](https://github.com/stevysmith/agentk/blob/81a81d7dc5991f1a5eb19d49851bf3bbd8d6c631/src/index.tsx#L2935-L3037) maps the same names, descriptions, labels, schemas, and callbacks to native registration and uses an abort controller for cleanup. It defers catalog changes while executions are in flight. It also carries older API compatibility paths and swallows registration failures, so it is a product-pattern reference rather than a wholesale implementation recommendation.

**Site idea:** a small command palette lets visitors find writing, open the resume, or inspect projects using the same domain operations as browser agents. Existing site chat tools in `src/lib/ask-tools.ts` and browser tools in `src/components/site-agent-tools.tsx` already overlap on list/read behavior; shared data and input validation could keep their answers aligned. Runtime adapters still need to differ: server chat reads source data, browser tools fetch Markdown routes, and human UI uses links. Navigation actions change UI state and should not inherit read-only annotations from retrieval tools.

## 4. Validate before executing

[josharsh/webmcp-tools boundary implementation, pinned](https://github.com/josharsh/webmcp-tools/blob/8eac9b5c8c756d2707351e173c092a9081ac0208/packages/core/src/tool.ts#L190-L231) validates Standard Schema or raw JSON Schema inputs before invoking the operation. Input errors become explicit `isError` results, and execution errors include the tool name.

**Site idea:** use the existing Zod schemas to validate unknown execution input and return a field-specific recovery message. This directly addresses the numeric-query failure observed in the live audit. No new SDK is needed to borrow this pattern. The library's bridges, ponyfill, and confirmation gates are separate capabilities, not requirements for the site's four read tools.

## 5. Test agent journeys, not just individual calls

[GoogleChromeLabs WebMCP Evals README](https://github.com/GoogleChromeLabs/webmcp-tools/blob/main/webmcp-evals/README.md) documents `smoke` (concrete calls, no model/API key), `browser` (live tool-call evaluation), and `simulate` (a user goal, agent conversation, final DOM assertions and/or a model judge). Simulation complements deterministic smoke checks. The README distinguishes backend support; do not assume every adapter supports live browser execution.

**Site idea:** retain existing native Chrome contract tests and add a few prompt-driven cases: find the grocery prototype story and cite it; explain the current article; identify relevant work experience; recover from an unknown post. Score the final canonical citation and factual evidence, not only tool-name selection. This is a proposed test suite, not an evaluation run performed in this research.

## 6. Response budgets depend on the consuming agent

[GoogleChromeLabs example extension](https://github.com/GoogleChromeLabs/webmcp-extension#trust-boundary) caps tool results at 8,000 characters and warns about truncation. Its [README](https://github.com/GoogleChromeLabs/webmcp-extension#what-it-does) describes per-tab conversations and dynamic discovery after navigation. These are behaviors of that example consumer, not requirements imposed by WebMCP itself.

**Site idea:** support explicit limits or sections with continuation metadata rather than choosing an undocumented global ceiling. The live audit returned about 7,100 characters for one post intact through T3's native API; that does not guarantee every consuming agent sees the whole result. A tool should be honest about partial output.

## 7. Make agent actions visible, complete, and reversible

[Cadence tool scoping](https://github.com/AshrafAhmed9/cadence/blob/4ed747f5bf57166b234561af19c1945fb9871fdc/src/lib/useCadenceTools.ts) changes registered tools with issue selection, active filters, and agent grants. [Its store](https://github.com/AshrafAhmed9/cadence/blob/4ed747f5bf57166b234561af19c1945fb9871fdc/src/lib/store.ts) and [reducer](https://github.com/AshrafAhmed9/cadence/blob/4ed747f5bf57166b234561af19c1945fb9871fdc/src/shared/reducer.ts) route human and agent mutations through the same operations and undo stack.

[Relay's parity checker](https://github.com/AshrafAhmed9/relay/blob/24e17e00bfac7b38934a353bf99300a00e507d8a/scripts/check-tool-parity.ts) asserts that mutating tools match declared UI actions. [Its simulation tool](https://github.com/AshrafAhmed9/relay/blob/24e17e00bfac7b38934a353bf99300a00e507d8a/src/tools/higher-order.ts) runs the real reducer without committing the new state, returning the before/after changes.

[Google's flight demo bridge](https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/demos/react-flightsearch/src/webmcp.ts) waits for request-specific completion events from UI components before reporting success. [FlightResults](https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/demos/react-flightsearch/src/components/FlightResults.tsx) applies filtering and emits completion.

**Site idea:** if `open_post` is added, use the normal client router, wait until the requested article is rendered, and return the visible title and canonical URL. Register it as an action that changes UI state, not read-only retrieval. The user's browser Back behavior should remain available. A shared undo stack and write permissions are unnecessary for the current read-only website, but would matter for any future editable interactive project.

## 8. Return the next useful action with search results

[pdfcn's search tool, pinned source](https://github.com/shadcn-labs/pdfcn/blob/75587813e47658736160a7138bc4d6b51eb7b312/apps/web/components/web-mcp/search-tool.tsx) registers a read-only component search with `query` and an optional `type` enum (`all`, `block`, `lib`, `theme`, `ui`). It fetches and caches the site's registry, searches component names, titles, and descriptions, and returns named fields including an `installCommand` for each match. The useful pattern is that discovery includes the next action needed to use the result.

Despite describing the query as fuzzy, this implementation performs case-insensitive substring matching on the entire query. It does not implement typo tolerance or relevance ranking. Our question-friendly word matching and title/summary weighting should remain; the result design is the part to borrow.

**Site idea:** offer explicit `slug`, `title`, `summary`, `page_url`, and `markdown_url` fields alongside readable links, subject to verification of the consuming agent's structured-result support. An agent could cite the public page and fetch the full article without inferring URL conventions. For project discovery, include live-demo or install links only when the project data actually provides them. Add topic or project filters once the content model has reliable categories; pdfcn's enum works because its registry already defines component types. These result fields and filters are documented proposals, not part of this branch's search implementation.

## Recommended sequence

1. Repair execution validation and local-post identity from the prior live audit.
2. Improve queried search relevance and expose total counts/limits.
3. Add a current-page outline and section reading if real prompts show that full-text retrieval is wasteful.
4. Consider a human command palette if it improves the visitor experience.
5. Add prompt-driven evaluation cases before broadening the tool catalog.

The original research pass changed documentation only. The subsequent search implementation covers the ranking, sorting, limits/counts, and `list_posts` validation described above without adding dependencies. Local-post identity, section reading, structured result fields, and broader agent evaluations remain follow-up ideas. Sources include experimental implementations; product ideas are more portable than their API compatibility shims.
