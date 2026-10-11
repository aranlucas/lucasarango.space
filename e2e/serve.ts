// Global setup for the Chrome tests: serves the production build on a free
// port and hands its URL to the tests. Run `pnpm build` first.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import type { TestProject } from "vitest/node";
import { z } from "zod";

declare module "vitest" {
  export interface ProvidedContext {
    baseURL: string;
  }
}

const ListeningAddress = z.object({ port: z.number() });

function freePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, () => {
      const { port } = ListeningAddress.parse(server.address());

      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function responds(url: string) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function waitUntilServing(url: string, server: ChildProcess, deadline: number) {
  if (server.exitCode !== null) throw new Error(`next start exited with ${server.exitCode}`);

  if (await responds(url)) return;

  if (Date.now() > deadline) throw new Error(`${url} didn't respond within 30s`);

  await delay(250);
  await waitUntilServing(url, server, deadline);
}

export default async function serve(project: TestProject) {
  if (!existsSync(join(".next", "BUILD_ID"))) {
    throw new Error("No production build. Run `pnpm build` before `pnpm test:chrome`.");
  }

  const port = await freePort();
  const baseURL = `http://localhost:${port}`;

  const server = spawn(
    process.execPath,
    [join("node_modules", "next", "dist", "bin", "next"), "start", "--port", String(port)],
    { stdio: "ignore" },
  );

  await waitUntilServing(baseURL, server, Date.now() + 30_000);

  project.provide("baseURL", baseURL);

  return () => {
    server.kill();
  };
}
