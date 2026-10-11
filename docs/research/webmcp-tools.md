# WebMCP tool design for lucasarango.space

As of **2026-10-10**. These are primary-source notes for adding `use-webmcp-tool` (v0.3.0) to the site. Sources were pinned when read:

- spec draft `index.bs` at [`d0e4e0e`][spec-src] (2026-10-09)
- explainer README at [`14ae813`][readme]
- hook repo at [`9f0dc6e`][hook-repo] (its `useWebMCP.js` is byte-identical to the npm 0.3.0 tarball)
- Chrome's `build-webmcp-tools` skill in GoogleChromeLabs/webmcp-tools at [`aca4e0b`][skill]
- the developer.chrome.com pages, with the "last updated" date given for each

## Summary: what to build

| Tool                     | Mount                                                | Annotations                                                  | Purpose                                                    |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `list_posts`             | site-wide (client component in `src/app/layout.tsx`) | `readOnlyHint: true`                                         | Index of posts, from `GET /blog/sitemap.md`                |
| `read_post`              | site-wide                                            | `readOnlyHint: true`                                         | One post as Markdown, from `GET /blog/<slug>.md`, in pages |
| `open_post` _(optional)_ | site-wide                                            | none (navigation is a mutation, but not a consequential one) | Client-side navigate to a post so the user sees it         |

- **Leave out `untrustedContentHint`.** The spec defines "untrusted" from the point of view of the author registering the tool, and the site owner writes every post. See §3.
- **Don't add a separate page-scoped `read_current_post`.** It would overlap `read_post`, and both the explainer and Chrome advise against overlapping tools. Instead, make `read_post`'s `post` argument optional and resolve "the post open in this tab" from `location.pathname` when the tool runs (§4).
- **Name tools in `snake_case`.** The spec only restricts the character set. snake_case is what Chrome's docs, skill, and most demos use (§2).
- **Keep each result near Chrome's ~1.5K-character budget.** Posts are 5–8.5K characters, so `read_post` returns them in parts (§6).
- **The hook has known gaps.** Account for them when implementing (§8): it does not await `registerTool()`'s promise, it starts one polling interval per instance, and it does not forward `title`.

---

## 1. Spec state, API shape, and where it ships

**Imperative API.** You register a tool with `document.modelContext.registerTool(tool, { signal, exposedTo })`, which returns `Promise<undefined>`. Aborting the `signal` unregisters it. The interface also has `getTools()`, `executeTool()`, and the events `toolchange`, `toolactivated`, and `toolcancel` ([spec IDL][spec-modelcontext]). `document.modelContext` is `[SecureContext]` only.

A tool is `{ name, title?, description, inputSchema?, execute(input, { signal }), annotations? }` ([spec `ModelContextTool`][spec-tool-dict]). The same shape appears in [`webmcp-types` 0.1.10 `index.d.ts`](https://github.com/webmachinelearning/webmcp-types) (read from the npm tarball).

**What changed and when** (from the spec's git history):

- `provideContext()` and `clearContext()` were **removed** on 2026-03-05 ([#132][pr132]).
- `unregisterTool()` was replaced by an `AbortSignal` on 2026-03-26 ([#147][pr147]).
- `modelContext` moved from `navigator` to `Document` on 2026-05-27 ([#184][pr184]).
- `ModelContextClient` and its `requestUserInteraction()` were **removed** on 2026-06-11 ([#205][pr205]).
- **Contested:** Chrome's [secure-tools page][chrome-secure] (updated 2026-09-01) still says "the spec draft includes `requestUserInteraction()`". That sentence is stale.

**Declarative API.** You annotate a `<form>` with `toolname`, `tooldescription`, `toolparamdescription`, and `toolautosubmit`. It is described only in a [separate explainer][decl], and the README says it "is not part of the specification at this time" ([README §Declarative][readme]). Chrome's [overview][chrome-overview] (updated 2026-10-07) still presents it as an available API. The site has no forms that agents need, so it is irrelevant here.

**Where it ships:**

- **Chrome:** an origin trial from Chrome 149 ([implementation-status.md][impl], [OT blog, 2026-06-09][chrome-ot]). For local work, turn on `chrome://flags/#enable-webmcp-testing` ([Chrome overview][chrome-overview]).
- **Chrome Status** ([feature 5117755740913664][chromestatus], fetched 2026-10-10 through its API) lists:
  - a dev trial from desktop M146
  - an OT for M149–156, extended to M162
  - an overall status of "Proposed", with no Firefox or Safari signals
- **Edge:** an OT in Edge 150.
- **Brave:** experimental support in Leo.
- **ChatGPT Desktop:** "supported" ([impl][impl]).
- **Takeaway:** without an OT token, only users who turn on the flag (or run a polyfill or extension) see the tools. That's fine for a personal site, but decide whether to add the OT `<meta http-equiv="origin-trial">` token.

**Permissions policy.** The feature is `tools`, with a default allowlist of `'self'` ([spec §permissions-policy][spec-pp]). If it is disabled, `registerTool()` returns a promise **rejected** with `NotAllowedError`. Cross-origin iframes need `allow="tools"` ([README][readme]).

Chrome's skill adds that WebMCP needs an origin-keyed agent cluster: `Origin-Agent-Cluster: ?0` disables it ([vanilla-patterns.md][skill-vanilla]). Chrome documents this, but the spec does not mention it. The site sends neither header, so nothing needs to change.

## 2. Names, descriptions, and schemas

**Name rules (normative).**

- Names are 1–128 characters, using only ASCII alphanumerics, `_`, `-`, and `.`. Anything else rejects with `InvalidStateError` ([spec `tool definition/name`][spec-name], added in [#152][pr152] on 2026-04-09 to mirror [MCP's tool-name SHOULDs][mcp-tools]).
- Names are unique per Document: registering a name that already exists **rejects with `InvalidStateError`** ([spec `registerTool` steps][spec-register]).
- If a tool is unregistered and re-registered quickly under the same name, an in-flight call can hit the new schema ([spec note][spec-execute]).

**Case style is not specified anywhere normative**, and the sources disagree:

- The explainer README uses kebab-case (`add-todo`, `filter-templates`).
- Chrome's [imperative-API page][chrome-imperative] (2026-09-21) mixes `book_flight` and `addTodo`.
- Chrome's skill and nearly all [webmcp-tools demos][demos] use snake_case (`search_catalog`, `get_order_status`).
- The [MCP spec][mcp-tools] gives `getUser`, `DATA_EXPORT_v2`, and `admin.tools.list` as examples.
- **Recommendation:** snake_case, to match Chrome's current tooling.

**Description and schema guidance** (from the [README best practices][readme-bp], [Chrome best practices][chrome-bp] updated 2026-05-18, and [skill `tool-design.md`][skill-design]):

- Write **"What + When"**: what the tool does and when to choose it, phrased positively. Don't repeat parameter names, types, or enums from the schema, and leave out implementation jargon.
- Use verbs that say exactly what happens. For example, `create_event` acts immediately, while `start_event_creation` or `initiate_*` only navigates to a form.
- Give each tool a single responsibility and don't let tools overlap. Mind the "tool budget", since every tool costs context tokens.
- Accept raw user input and normalize it in code, rather than making the model convert values. Use self-explanatory enum strings, put a `description` on every property, and list `required` fields.
- **"Validate strictly in code, loosely in schema"**, and return actionable errors so the agent can retry.
- **Character budgets** ([Chrome secure-tools][chrome-secure]):
  - name ≤ 30
  - description ≤ 500
  - parameter description ≤ 150
  - output ≤ 1.5K per call
  - These are "subject to change", and "variation across agents" is expected.
- **JSON Schema subset:** the spec only stringifies `inputSchema` and cites JSON Schema. It does not define a subset and does not validate inputs; native validation is still open as [issue #92][i92]. Your `execute` therefore has to validate its own arguments.

## 3. Annotations

These come from the [spec `ToolAnnotations`][spec-annotations] and `webmcp-types`. All of them default to `false`.

| Hint                   | Spec meaning                                                                                                                     | Added                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `readOnlyHint`         | "does not modify any state and only reads data"                                                                                  | original                  |
| `untrustedContentHint` | "the tool's output contains data that is untrusted, **from the perspective of the author registering the tool**"                 | [#169][pr169], 2026-04-23 |
| `consequentialHint`    | "significant, real-world, or non-reversible" actions (booking a flight, transferring money); lets the agent force a confirmation | [#217][pr217], 2026-09-03 |
| `debugging`            | for developer tooling, not end users (Chrome 156+, per the [imperative-API page][chrome-imperative])                             | [#253][pr253], 2026-09-17 |

There is no MCP-style `destructiveHint`, `idempotentHint`, or `openWorldHint`. Like MCP, these hints are advisory. MCP says clients "MUST consider tool annotations to be untrusted unless they come from trusted servers" ([MCP tools][mcp-tools]).

**Is the blog untrusted? No.**

- **The spec's own definition.** Trust is judged from the tool author's point of view ([spec][spec-annotations]). The mitigation section frames the hint as defending against **output injection** from "malicious actors influencing website content (e.g., untrusted user-generated content…)" ([spec §security][spec-sec]).
- **The issue that created the hint.** In [#136][i136], it was described as "more of a protection for trusted sites" against third-party content such as reviews and comments. In that model, "the site owner (writing the WebMCP tools) is then aligned with the agent."
- **Chrome's guidance.** Chrome says to set it for "user-generated content (UGC) or externally sourced data" ([secure-tools][chrome-secure]). The skill extends it to anything "created or edited by users or third parties… even from your own database" ([annotations.md][skill-annot]).
- **Why that rules out the posts.** Every post is a file in `_posts/` that the owner commits, and the site has no comments or visitor input. So `untrustedContentHint` should be omitted.
- **Caveat:** set it if posts ever include pulled-in third-party text (guest posts, embedded comments, or quotes fetched at runtime).

Chrome's skill also says to **set hints only when they are true** (never write `: false`). Navigation and view-switching tools **must not** claim `readOnlyHint` and do not need `consequentialHint` ([annotations.md][skill-annot]). The spec doesn't say this; it is Chrome's guidance.

## 4. Scoping: site-wide vs. page-scoped tools

The guidance:

- "Dynamically registering and unregistering them based on the active page state is a recommended pattern" for apps with many tools.
- But "**for simpler web applications with a handful of tools, static registration on page load is recommended**" ([README §Detailed Design / Tool Strategy][readme-bp]).
- Chrome agrees: "For most applications, static registration should be the default approach" ([best practices][chrome-bp]).
- The hook's "in lockstep with what is on screen" line ([README][hook-readme]) describes what the hook does, not a rule that every tool must be page-scoped.

What this means for the site:

- **Site-wide `list_posts` and `read_post` fit.** They are a handful of tools, valid on every route, and their metadata never changes. Mount them once in a `"use client"` component inside the root layout. The tool map belongs to the `Document`, so client-side navigations keep them registered.
- **A page-scoped "read the current post" adds little.** The spec notes that the browser agent already gets a page **observation**, which "often includes screenshots… not just a DOM serialization" ([spec §observations][spec-obs]). A second read tool would also overlap `read_post` (single responsibility). Instead, let `read_post` take an optional `post`. When it is omitted, resolve the slug from `location.pathname` inside `execute`. The README says to check current state at execution time: "the tool's `execute` callback should still validate current inputs… and preconditions" ([README][readme-bp]). This keeps the description static, so the tool is never re-registered on navigation.
- **Changing a tool's description per route is costly.** Name, description, and schema are "loaded into the model's context statically", so changing them means unregistering and re-registering, which fires `toolchange` ([README][readme-bp]). In-place updates and tool groups are not in the spec ([#167][i167], [#255][i255]). The WG deferred tool collections on 2026-09-03 ([#255 resolution][i255]).

## 5. Security and privacy

From the [spec §Security and Privacy][spec-sec], which is non-normative:

- **Prompt injection comes in three forms.** Tool metadata can be poisoned, tool output can carry injected instructions, and tools themselves are attack targets. "Tool descriptions and return values could be treated as trusted context by agents." For this site:
  - keep descriptions free of instructions to the agent
  - don't echo visitor input back into results
- **Misrepresentation of intent.** A description must match what the tool actually does, side effects included; the spec's `finalizeCart` example is the anti-pattern.
- **Over-parameterization.** Don't ask for parameters the tool doesn't need, because agents will fill them from the user's personal context (age, location, …). The proposed tools take only a slug and an offset.
- **Same-origin.** Tools are exposed only to the registering document, same-origin documents in the same tree, and the built-in agent. Cross-origin exposure needs `exposedTo` plus the `tools` policy ([README][readme], [spec `tool is exposed to an origin`][spec-exposed]). Don't pass `exposedTo`.
- **Opting out.** `Permissions-Policy: tools=()` disables WebMCP on pages that shouldn't have it, and protects against compromised dependencies ([spec mitigations][spec-sec]).
- **Confirmation.** Today, `consequentialHint` is the only confirmation mechanism. `requestUserInteraction()` was removed in [#205][pr205], and elicitation is still open ([#165][i165], [#50][i50]). For risky flows, Chrome's skill recommends a human-in-the-loop hand-off: an `initiate_*` tool navigates to a UI where the user confirms ([SKILL.md][skill]). None of the proposed tools are consequential.
- **User-visible actions.** "Ensure the web page's visual UI updates immediately to reflect actions taken by tools" ([README][readme-bp]). This matters only for `open_post`.

## 6. Return values

- **The spec does not prescribe a result format.** The resolved value is JSON-serialized and handed to the agent as a string. An unserializable value or a rejected promise becomes an `OperationError` ([spec "invoke the execute callback"][spec-execute]). Browsers "are free to distill and expose tools via Model Context Protocol, other proprietary 'function calling' methods, or any other way" ([spec §observations][spec-obs]).
- **The hook converts results to the MCP shape:**
  - a string becomes `{content:[{type:"text",text}]}`
  - an object becomes a JSON-stringified text block
  - `{content:[…]}` passes through unchanged
  - a thrown or returned `Error` becomes `{…, isError:true}` ([hook README][hook-readme])
- **Throw to report errors; don't return error objects.** In the hook, a returned plain object counts as success ([skill react-patterns.md][skill-react]). This also follows MCP's convention that tool-execution errors go in the result with `isError: true` so the model can self-correct ([MCP tools][mcp-tools]).
- **`outputSchema` and `structuredContent` are not in WebMCP** (open as [issue #9][i9]). Return text.
- **Size.** Aim for ~1.5K characters per call ([Chrome][chrome-secure]). For long single items, the skill says: "don't silently cut them… page with a continuation signal… return the total length plus `truncated: true` and where to continue". Don't split one capability into size variants ([tool-design.md §1–2][skill-design]).
  - **Current sizes:** posts range from 5,194 to 8,441 bytes (`wc -c _posts/*.md`), and the 10-post index is about 1.4K characters of title, date, and summary.
  - **Contested:** 1.5K is Chrome's recommendation, not a spec limit. The cost of following it is 4–6 calls per post. Raise the chunk size if testing in Chrome's inspector shows agents handle it well.

## 7. Official examples

- **[GoogleChromeLabs/webmcp-tools/demos][demos]** covers React (`react-flightsearch`, `smart-home`), Angular, and declarative forms. It includes read-only queries (`get_order_history`, `check_return_policy`, `lookup_amenity`), navigation tools (`view_hotel`, `view_leather_product`), and a `query_content` tool.
- **Chrome's [build-webmcp-tools skill][skill]** spells out the patterns. React tools go through `useWebMCP` in `"use client"` components, with a Vitest test that mocks `registerTool` and calls the captured `execute` ([react-patterns.md][skill-react]). A navigation tool omits all annotations and protects unsaved state ([annotations.md][skill-annot]).
- **Navigation has spec-level caveats:**
  - A tool that triggers a **document** navigation loses its result. Continuations are only a proposal ([continuations explainer][cont], [#135][i135]), and `executeTool()` "returns… null when a navigation is triggered" ([imperative-API page][chrome-imperative]). Next.js client-side navigation keeps the same document, so this doesn't apply.
  - Hook [issue #11][h11] reports that in **Chrome 152** a result is lost (`UnknownError`) if the tool unregisters before its result is posted back, for example when `execute` routes away and unmounts its own component. Chrome's imperative-API page says that "as of Chrome 153, you can unregister a tool without cancelling and breaking in-flight executions", and the spec agrees ([unregister note][spec-src]).
  - **Not verified here:** whether Chrome 153+ really fixes this. Mounting `open_post` in the root layout, which persists across routes, avoids the question entirely.
- **Testing tools:**
  - the DevTools **Application → WebMCP** pane
  - Lighthouse's "Agentic browsing" category (Chrome 150+, which also audits `llms.txt`)
  - the [Model Context Tool Inspector][inspector] extension
  - `chrome-devtools-mcp --categoryExperimentalWebmcp` ([testing-and-debugging.md][skill-test])

## 8. Proposal for this site

Mount one `"use client"` component (for example `src/components/site-agent-tools.tsx`) inside `<AskProvider>` in `src/app/layout.tsx`, rendering `null`. Fetch from the routes PR #30 added, same-origin, passing `signal` through. These tools mirror `askTools` in `src/lib/ask-tools.ts`, but in snake_case and with relative fetches. Hoist the schemas to module scope: the hook compares them with `JSON.stringify`, which is key-order sensitive ([hook source][hook-src]).

```ts
const LIST_POSTS = {
  name: "list_posts",
  description:
    "Lists every post on Lucas Arango's blog, newest first, with title, date, one-sentence summary, and link. Use to find posts on a topic before reading, quoting, or linking one.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  // execute: fetch("/blog/sitemap.md", { signal }) → return the Markdown text.
};

const READ_POST = {
  name: "read_post",
  description:
    "Reads one blog post as Markdown with its title, date, and canonical URL. Use before quoting, summarizing, or answering details from a post. Long posts arrive in parts.",
  inputSchema: {
    type: "object",
    properties: {
      post: {
        type: "string",
        description:
          "Post slug, path, or URL from list_posts. Omit to read the post open in this tab.",
      },
      offset: {
        type: "integer",
        description: "Where to continue a long post; use next_offset from the previous part.",
      },
    },
  },
  annotations: { readOnlyHint: true },
  // execute: accept slug, /blog/x, /blog/x.md, or a full URL; else use location.pathname.
  // Validate /^[\w-]+$/; fetch(`/blog/${slug}.md`, { signal }); 404 → throw
  // Error("No post 'x'. Call list_posts for valid posts."). Slice ~1,500 chars on a
  // paragraph boundary; return { content: [{type:"text", text: chunk},
  //   {type:"text", text: JSON.stringify({ total_chars, next_offset })}] }.
};

// Optional. No annotations: navigation changes UI state but is not consequential.
const OPEN_POST = {
  name: "open_post",
  description:
    "Opens a blog post in this tab so the reader can see it. Use when the user asks to go to, show, or open a post.",
  // inputSchema: { post } as above, required. execute: router.push(`/blog/${slug}`),
  // wait for the route to commit, then return "Opened <title>.". Check the Next 16
  // router API in node_modules/next/dist/docs first (per AGENTS.md).
};
```

**Notes for the implementer:**

- **The hook doesn't await `registerTool()`'s promise** ([`useWebMCP.js`][hook-src]). Per spec, failures are promise **rejections**: `NotAllowedError` for the policy, and `InvalidStateError` for a duplicate or invalid name or an empty description ([spec][spec-register]). As a result:
  - `error` stays `null` and `registered` reports `true` even when registration failed
  - the rejection is unhandled
  - the hook's tests only cover a fake that throws synchronously ([`useWebMCP.test.jsx`][hook-repo])
  - **inferred, not runtime-tested:** under StrictMode, the dev-only abort before the promise resolves should reject it with `AbortError`, which would show up as an unhandled rejection in the dev console
- **When `document.modelContext` is missing, each hook instance polls every 500 ms for 10 s** ([issue #12][h12]). That means three intervals for every visitor without WebMCP, which is cheap but not free. The `enabled` flag does not stop it.
- **PR [#6][pr6] (open):** forwards an optional `title` and re-registers when it changes. Until it merges, `title` cannot be set through the hook. That's acceptable, because the spec lets the user agent pick a display value when `title` is missing ([spec name/title][spec-name]).
- **PR [#7][pr7] (open):** adds `useWebMCPTools([...])`, which registers several tools atomically and rolls them back on failure. The maintainer is waiting on spec [#255][i255] before accepting it. Until then, use three `useWebMCP` calls; nothing in the proposal depends on #7.

## Open questions

1. **Read size.** Should `read_post` follow Chrome's 1.5K budget (4–6 calls per post) or return larger parts, or whole posts as the Ask agent does? The budget is guidance, not a spec limit. Measure in the Tool Inspector or DevTools pane.
2. **Origin-trial token.** Should the site register for the OT so Chrome 149–162 users without the flag get the tools?
3. **`open_post`.** Is it worth shipping? It is the only tool with UI side effects, and its value depends on whether browser agents prefer it to clicking links.
4. **Result-loss bug.** Does Chrome 153+ actually fix the self-unmount result loss ([#11][h11])? This only matters if a tool is ever mounted below the layout.
5. **Promise handling.** Should the site wrap or patch the hook to observe `registerTool()`'s promise (§8) or wait for an upstream fix? No upstream issue was found for this gap. It could be filed.

[spec-src]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/index.bs
[spec-name]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/index.bs#L171-L186
[spec-modelcontext]: https://webmachinelearning.github.io/webmcp/#model-context-container
[spec-register]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/index.bs#L722-L760
[spec-execute]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/index.bs#L470-L590
[spec-exposed]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/index.bs#L454-L466
[spec-tool-dict]: https://webmachinelearning.github.io/webmcp/#model-context-tool
[spec-annotations]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/index.bs#L1200-L1216
[spec-pp]: https://webmachinelearning.github.io/webmcp/#permissions-policy
[spec-obs]: https://webmachinelearning.github.io/webmcp/#observations
[spec-sec]: https://webmachinelearning.github.io/webmcp/#security-privacy
[readme]: https://github.com/webmachinelearning/webmcp/blob/14ae813cc4e9fe0d39313f4b1ee5b231746731ad/README.md
[readme-bp]: https://github.com/webmachinelearning/webmcp/blob/14ae813cc4e9fe0d39313f4b1ee5b231746731ad/README.md#best-practices
[decl]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/declarative-api-explainer.md
[cont]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/continuations-explainer.md
[impl]: https://github.com/webmachinelearning/webmcp/blob/d0e4e0e0f039358cc9d93f90074116622bfebd53/implementation-status.md
[pr132]: https://github.com/webmachinelearning/webmcp/pull/132
[pr147]: https://github.com/webmachinelearning/webmcp/pull/147
[pr152]: https://github.com/webmachinelearning/webmcp/pull/152
[pr169]: https://github.com/webmachinelearning/webmcp/pull/169
[pr184]: https://github.com/webmachinelearning/webmcp/pull/184
[pr205]: https://github.com/webmachinelearning/webmcp/pull/205
[pr217]: https://github.com/webmachinelearning/webmcp/pull/217
[pr253]: https://github.com/webmachinelearning/webmcp/pull/253
[i9]: https://github.com/webmachinelearning/webmcp/issues/9
[i50]: https://github.com/webmachinelearning/webmcp/issues/50
[i92]: https://github.com/webmachinelearning/webmcp/issues/92
[i135]: https://github.com/webmachinelearning/webmcp/issues/135
[i136]: https://github.com/webmachinelearning/webmcp/issues/136
[i165]: https://github.com/webmachinelearning/webmcp/issues/165
[i167]: https://github.com/webmachinelearning/webmcp/issues/167
[i255]: https://github.com/webmachinelearning/webmcp/issues/255
[chrome-overview]: https://developer.chrome.com/docs/ai/webmcp
[chrome-imperative]: https://developer.chrome.com/docs/ai/webmcp/imperative-api
[chrome-bp]: https://developer.chrome.com/docs/ai/webmcp/best-practices
[chrome-secure]: https://developer.chrome.com/docs/ai/webmcp/secure-tools
[chrome-ot]: https://developer.chrome.com/blog/ai-webmcp-origin-trial
[chromestatus]: https://chromestatus.com/feature/5117755740913664
[inspector]: https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd
[mcp-tools]: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
[hook-repo]: https://github.com/GoogleChromeLabs/use-webmcp-tool/tree/9f0dc6eddf88cff65ebe877f199d4547e74ab31e
[hook-readme]: https://github.com/GoogleChromeLabs/use-webmcp-tool/blob/9f0dc6eddf88cff65ebe877f199d4547e74ab31e/README.md
[hook-src]: https://github.com/GoogleChromeLabs/use-webmcp-tool/blob/9f0dc6eddf88cff65ebe877f199d4547e74ab31e/useWebMCP.js
[h11]: https://github.com/GoogleChromeLabs/use-webmcp-tool/issues/11
[h12]: https://github.com/GoogleChromeLabs/use-webmcp-tool/issues/12
[pr6]: https://github.com/GoogleChromeLabs/use-webmcp-tool/pull/6
[pr7]: https://github.com/GoogleChromeLabs/use-webmcp-tool/pull/7
[demos]: https://github.com/GoogleChromeLabs/webmcp-tools/tree/aca4e0b875b37391ced3be6d452f5e1b312944e1/demos
[skill]: https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/webmcp-skills/skills/build-webmcp-tools/SKILL.md
[skill-design]: https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/webmcp-skills/skills/build-webmcp-tools/references/tool-design.md
[skill-annot]: https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/webmcp-skills/skills/build-webmcp-tools/references/annotations.md
[skill-react]: https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/webmcp-skills/skills/build-webmcp-tools/references/react-patterns.md
[skill-vanilla]: https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/webmcp-skills/skills/build-webmcp-tools/references/vanilla-patterns.md
[skill-test]: https://github.com/GoogleChromeLabs/webmcp-tools/blob/aca4e0b875b37391ced3be6d452f5e1b312944e1/webmcp-skills/skills/build-webmcp-tools/references/testing-and-debugging.md
