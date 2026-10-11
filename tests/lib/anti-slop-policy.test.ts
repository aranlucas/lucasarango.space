import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { it as test } from "vitest";

test("SVG presentation attributes remain valid while owned shape symbols fail", () => {
  const directory = mkdtempSync(resolve(".anti-slop-smoke-"));
  const file = join(directory, "fixture.tsx");

  const lint = () =>
    spawnSync(resolve("node_modules/.bin/oxlint"), ["-c", ".oxlintrc.json", file], {
      encoding: "utf8",
      stdio: "pipe",
    });

  try {
    writeFileSync(
      file,
      'export const art = <svg shapeRendering="crispEdges"><path shapeRendering="geometricPrecision" /></svg>;\n',
    );
    assert.equal(lint().status, 0);

    for (const code of [
      "export const shape = 1;\n",
      'declare const Custom: React.ComponentType<{shapeRendering: string}>;\n\nexport const art = <Custom shapeRendering="test" />;\n',
    ]) {
      writeFileSync(file, code);
      const result = lint();

      assert.equal(result.status, 1);
      assert.match(result.stdout, /no-shape-in-symbol-names/u);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
