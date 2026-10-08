# Anti-slop provenance

Source: https://github.com/dmmulroy/anti-slop
Commit: c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b
Installed source: src/ copied to tools/oxlint/anti-slop/.
Local source deviation: no-shape-in-symbol-names exempts the externally owned standard SVG shapeRendering JSX attribute only on explicit intrinsic SVG elements. Locally owned identifiers and custom-component attributes remain rejected; src/lib/anti-slop-policy.test.ts verifies both. A local package.json declares this vendored tooling scope as ESM; tsconfig.anti-slop.json checks it separately from application code.
Keep the upstream LICENSE and nested vendor licenses/provenance with the source.

Local source deviation: removed the unused `effect/` plugin and its rules/helpers. The application registers only the generic plugin in `index.ts`; no configuration or source imported the Effect plugin.
