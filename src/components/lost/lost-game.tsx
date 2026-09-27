"use client";

import { cn } from "cn";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { createGame, ROUND_SECONDS, startRound, type Walk } from "./game";
import {
  recordBest,
  useActive,
  useCoarsePointer,
  useMovementKeys,
  useSpaceToStart,
  useWebGL,
} from "./hooks";
import { RoundOver, Scoreboard, StartCard } from "./overlays";
import type { Beam } from "./scene/beam";
import type { Controls, Hud } from "./scene/director";
import { Thumbstick } from "./thumbstick";

// Three.js only downloads on this page, and never renders on the server.
const LostScene = dynamic(() => import("./scene/lost-scene"), { ssr: false });

const IDLE_HUD: Hud = { phase: "idle", score: 0, secondsLeft: ROUND_SECONDS };

/**
 * The 404 page as a game, like Chrome's offline dinosaur: the message and
 * links (`children`) sit on a dark forest, and Space or the button switches
 * on a headlamp for a round of critter spotting. The message is server
 * rendered; only the scene waits for the browser.
 */
export function LostGame({ children }: { children: React.ReactNode }) {
  const round = useRound();
  const { hud } = round;
  const { aim, aimAt } = useAim();
  const { controls, onStick } = useControls();
  const panel = useRef<HTMLDivElement>(null);
  const active = useActive(panel);
  const touch = useCoarsePointer();
  const canPlay = useWebGL();
  const playing = hud.phase === "playing";
  useMovementKeys(controls, playing);
  useSpaceToStart(round.play, canPlay && hud.phase === "idle");

  return (
    <div
      ref={panel}
      className={cn(
        "relative breakout aspect-4/5 max-h-game overflow-hidden rounded-xl bg-night text-base text-night-foreground sm:aspect-video",
        playing && "cursor-crosshair touch-none select-none",
      )}
      onPointerMove={aimAt}
      onPointerDown={aimAt}
    >
      {canPlay && (
        <div aria-hidden="true" className="absolute inset-0">
          <LostScene {...round} aim={aim} controls={controls} phase={hud.phase} active={active} />
        </div>
      )}
      {hud.phase === "idle" && (
        <StartCard canPlay={canPlay} touch={touch} onPlay={round.play}>
          {children}
        </StartCard>
      )}
      {playing && <Scoreboard hud={hud} />}
      {playing && touch && <Thumbstick onWalk={onStick} />}
      {hud.phase === "over" && (
        <RoundOver score={hud.score} best={round.best} onPlay={round.play} />
      )}
      <p className="sr-only" aria-live="polite">
        {hud.phase === "over" ? `Round over. You scored ${hud.score}.` : ""}
      </p>
    </div>
  );
}

/** The game, what the HUD shows, and the best score so far. */
function useRound() {
  const router = useRouter();
  const [game] = useState(() => createGame());
  const [hud, setHud] = useState(IDLE_HUD);
  const [best, setBest] = useState(0);

  const onHud = useCallback((next: Hud) => {
    setHud(next);
    if (next.phase === "over") setBest(recordBest(next.score));
  }, []);

  const play = useCallback(() => {
    startRound(game);
    setHud({ ...IDLE_HUD, phase: "playing" });
  }, [game]);

  const onNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  return { game, hud, best, onHud, play, onNavigate };
}

/** Walking input from the keyboard and the touch thumbstick. */
function useControls() {
  const controls = useRef<Controls>({
    keys: { forward: 0, turn: 0 },
    stick: { forward: 0, turn: 0 },
  });
  const onStick = (walk: Walk) => {
    controls.current.stick = walk;
  };
  return { controls, onStick };
}

/** Where the player points the headlamp: the pointer's spot on the panel, in NDC. */
function useAim() {
  const aim = useRef<Beam>({ x: 0, y: -0.1 });
  const aimAt = (event: React.PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    aim.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    aim.current.y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
  };
  return { aim, aimAt };
}
