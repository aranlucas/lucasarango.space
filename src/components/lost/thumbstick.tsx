"use client";

import { useState } from "react";

import type { Walk } from "./game";

/** How far the knob travels from centre, in px. */
const REACH = 40;

/** An on-screen stick for touch screens: push up to walk, sideways to turn. */
export function Thumbstick({ onWalk }: { onWalk: (walk: Walk) => void }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const push = (event: React.PointerEvent<HTMLDivElement>) => {
    // Keep the drag from also aiming the headlamp.
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const scale = Math.min(1, REACH / (Math.hypot(dx, dy) || 1));
    setKnob({ x: dx * scale, y: dy * scale });
    onWalk({ forward: (-dy * scale) / REACH, turn: (-dx * scale) / REACH });
  };

  const letGo = () => {
    setKnob({ x: 0, y: 0 });
    onWalk({ forward: 0, turn: 0 });
  };

  return (
    <div
      aria-hidden="true"
      className="absolute inset-s-5 bottom-5 size-28 touch-none rounded-full border border-night-foreground/30 bg-night/40"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        push(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) push(event);
      }}
      onPointerUp={letGo}
      onPointerCancel={letGo}
    >
      <div
        className="absolute size-12 -translate-1/2 rounded-full bg-night-foreground/50"
        style={{ insetInlineStart: `calc(50% + ${knob.x}px)`, top: `calc(50% + ${knob.y}px)` }}
      />
    </div>
  );
}
