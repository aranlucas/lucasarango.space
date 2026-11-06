import { fireEvent, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";

import { useMovementKeys } from "@/components/lost/hooks";
import type { Controls } from "@/components/lost/game-types";

type ControlRef = { current: Controls };

function controls() {
  return {
    current: { keys: { forward: 0, turn: 0 }, stick: { forward: 0, turn: 0 } },
  } satisfies ControlRef;
}

test("releasing a held key inside Ask stops walking without blocking typing", () => {
  const input = document.createElement("textarea");
  document.body.append(input);
  const state = controls();

  const { unmount } = renderHook(() => {
    useMovementKeys(state, true);
  });

  try {
    fireEvent.keyDown(window, { code: "KeyW" });
    expect(state.current.keys.forward).toBe(1);
    input.focus();
    expect(fireEvent.keyUp(input, { code: "KeyW" })).toBe(true);
    expect(state.current.keys.forward).toBe(0);
    expect(state.current.keys.turn).toBe(0);
    fireEvent.keyDown(input, { code: "KeyW" });
    expect(state.current.keys).toEqual({ forward: 0, turn: 0 });
  } finally {
    unmount();
    input.remove();
  }
});

test("blur and disabling controls release movement", () => {
  const state = controls();

  const { rerender, unmount } = renderHook(
    ({ enabled }) => {
      useMovementKeys(state, enabled);
    },
    {
      initialProps: { enabled: true },
    },
  );

  fireEvent.keyDown(window, { code: "ArrowLeft" });
  expect(state.current.keys.turn).toBe(1);
  fireEvent.blur(window);
  expect(state.current.keys).toEqual({ forward: 0, turn: 0 });
  fireEvent.keyDown(window, { code: "KeyW" });
  rerender({ enabled: false });
  expect(state.current.keys).toEqual({ forward: 0, turn: 0 });
  fireEvent.keyDown(window, { code: "KeyW" });
  expect(state.current.keys).toEqual({ forward: 0, turn: 0 });
  unmount();
});
