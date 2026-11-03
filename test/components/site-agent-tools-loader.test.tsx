import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { SiteAgentToolsLoader } from "@/components/site-agent-tools-loader";

const registered = new Set<string>();

type Tool = { name: string };

type RegisterOptions = { signal: AbortSignal };

function supportWebMCP() {
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool: (tool: Tool, { signal }: RegisterOptions) => {
        registered.add(tool.name);
        signal.addEventListener("abort", () => {
          registered.delete(tool.name);
        });
      },
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  Reflect.deleteProperty(document, "modelContext");
});

afterEach(() => {
  cleanup();
  registered.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
  Reflect.deleteProperty(document, "modelContext");
});

test("loads tools immediately when the browser supports WebMCP without polling", async () => {
  const intervals = vi.spyOn(globalThis, "setInterval");
  supportWebMCP();
  render(<SiteAgentToolsLoader />);

  await vi.waitFor(() => {
    expect(registered.size).toBe(4);
  });
  expect(intervals).not.toHaveBeenCalled();
});

test("does not load tools without support and stops checking after ten seconds", () => {
  render(<SiteAgentToolsLoader />);

  expect(registered.size).toBe(0);
  expect(vi.getTimerCount()).toBe(1);
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(vi.getTimerCount()).toBe(0);
  expect(registered.size).toBe(0);
});

test("loads tools when an extension injects WebMCP after mounting", async () => {
  render(<SiteAgentToolsLoader />);
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  expect(registered.size).toBe(0);

  supportWebMCP();
  act(() => {
    vi.advanceTimersByTime(500);
  });

  await vi.waitFor(() => {
    expect(registered.size).toBe(4);
  });
  expect(vi.getTimerCount()).toBe(0);
});

test("cleans up detection when unmounted before support arrives", () => {
  const { unmount } = render(<SiteAgentToolsLoader />);

  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
