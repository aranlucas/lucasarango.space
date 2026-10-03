"use client";

import { type RefObject, useEffect, useState, useSyncExternalStore } from "react";

import type { Walk } from "./game";
import type { Controls } from "./scene/director";

const BEST_KEY = "lost-in-the-fog:best";

/** Physical keys (so WASD works on any layout) and the direction they push. */
const KEYS = {
  KeyW: { forward: 1 },
  ArrowUp: { forward: 1 },
  KeyS: { forward: -1 },
  ArrowDown: { forward: -1 },
  KeyA: { turn: 1 },
  ArrowLeft: { turn: 1 },
  KeyD: { turn: -1 },
  ArrowRight: { turn: -1 },
} satisfies Partial<Record<string, Partial<Walk>>>;

function movement(code: string): Partial<Walk> | undefined {
  return Object.entries(KEYS).find(([key]) => key === code)?.[1];
}

/** Saves the score if it's a new best, and returns the best either way. */
export function recordBest(score: number) {
  try {
    const best = Math.max(Number(localStorage.getItem(BEST_KEY)) || 0, score);
    localStorage.setItem(BEST_KEY, String(best));

    return best;
  } catch {
    // Private mode or blocked storage: the best just won't persist.
    return score;
  }
}

/** WASD and the arrow keys walk and turn while `enabled`. */
export function useMovementKeys(controls: RefObject<Controls>, enabled: boolean) {
  useEffect(() => {
    const held = new Set<string>();

    const update = () => {
      const walk = { forward: 0, turn: 0 };

      for (const code of held) {
        walk.forward += movement(code)?.forward ?? 0;
        walk.turn += movement(code)?.turn ?? 0;
      }

      controls.current.keys = walk;
    };

    const onKey = (event: KeyboardEvent) => {
      if (!movement(event.code) || isTyping(event.target)) return;
      event.preventDefault();

      if (event.type === "keydown") held.add(event.code);
      else held.delete(event.code);
      update();
    };

    // Letting go of the keys in another window must not leave you walking.
    const release = () => {
      held.clear();
      update();
    };

    if (enabled) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("keyup", onKey);
      window.addEventListener("blur", release);
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", release);
      release();
    };
  }, [controls, enabled]);
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement && target.closest("input, textarea, [contenteditable]") !== null
  );
}

/** True while the element is on screen and the tab is visible. */
export function useActive(ref: RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setOnScreen(entry?.isIntersecting ?? true);
    });

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  const visible = useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);

      return () => {
        document.removeEventListener("visibilitychange", onChange);
      };
    },
    () => document.visibilityState === "visible",
    () => true,
  );

  return onScreen && visible;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);

      return () => {
        list.removeEventListener("change", onChange);
      };
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Touch screens, which get a thumbstick instead of a keyboard. */
export function useCoarsePointer() {
  return useMediaQuery("(pointer: coarse)");
}

let webgl: boolean | undefined;

/** Whether this browser can draw the scene at all (assumed yes while server rendering). */
export function useWebGL() {
  return useSyncExternalStore(
    noSubscription,
    () => {
      webgl ??= hasWebGL();

      return webgl;
    },
    () => true,
  );
}

function hasWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

function noSubscription() {
  return () => {};
}

/** Space starts a round, like Chrome's offline dinosaur, unless focus is on a control. */
export function useSpaceToStart(start: () => void, enabled: boolean) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.target !== document.body) return;
      event.preventDefault();
      start();
    };

    if (enabled) window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [start, enabled]);
}
