"use client";

import { type RootState, useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import { type Texture, Vector3 } from "three";

import { type Critter, type Game, ROUND_SECONDS, tick, type Walk } from "../game";
import { type Beam, SPOT_RADIUS } from "./beam";
import { FogGlow, Headlamp } from "./headlamp";

export interface Hud {
  phase: Game["phase"];
  score: number;
  secondsLeft: number;
}

/** Movement input from each source; the director sums them. */
export interface Controls {
  keys: Walk;
  stick: Walk;
}

const EYE_HEIGHT = 1.6;
const scratch = new Vector3();

/**
 * Runs the game each frame: eases the beam toward where the player aims,
 * walks them, checks which eyes the beam lights, and reports the HUD.
 */
export function Director({
  game,
  aim,
  controls,
  lampOn,
  glow,
  onHud,
}: {
  game: Game;
  aim: RefObject<Beam>;
  controls: RefObject<Controls>;
  lampOn: boolean;
  glow: Texture;
  onHud: (hud: Hud) => void;
}) {
  const beam = useRef<Beam>({ x: 0, y: 0 });
  const last = useRef("");

  useFrame((state, delta) => {
    // A resumed tab reports one huge frame; don't let it eat the round.
    const dt = Math.min(delta, 0.1);
    const follow = 1 - Math.exp(-dt * 16);
    beam.current.x += (aim.current.x - beam.current.x) * follow;
    beam.current.y += (aim.current.y - beam.current.y) * follow;

    const { keys, stick } = controls.current;
    const walk = {
      forward: clamp(keys.forward + stick.forward),
      turn: clamp(keys.turn + stick.turn),
    };
    tick(game, dt, (critter) => isLit(critter, state, beam.current), walk);

    const secondsLeft = Math.max(0, Math.ceil(ROUND_SECONDS - game.elapsed));
    const key = `${game.phase}:${game.score}:${secondsLeft}`;
    if (key === last.current) return;
    last.current = key;
    onHud({ phase: game.phase, score: game.score, secondsLeft });
  });

  return (
    <>
      <Headlamp beam={beam} on={lampOn} />
      <FogGlow beam={beam} on={lampOn} glow={glow} />
    </>
  );
}

/** Whether the beam's centre is on a critter's eyes, measured on screen. */
function isLit(critter: Critter, { camera, size }: RootState, beam: Beam) {
  scratch.set(...critter.position).project(camera);
  const dx = (scratch.x - beam.x) * (size.width / size.height);
  const dy = scratch.y - beam.y;
  return scratch.z < 1 && dx * dx + dy * dy < SPOT_RADIUS * SPOT_RADIUS;
}

/** Puts the camera at the player's eyes, with a little head-bob while walking. */
export function CameraRig({ game, reducedMotion }: { game: Game; reducedMotion: boolean }) {
  const stride = useRef(0);
  const previous = useRef({ x: game.player.x, z: game.player.z });

  useFrame(({ camera }) => {
    const { player } = game;
    stride.current += Math.hypot(player.x - previous.current.x, player.z - previous.current.z);
    previous.current = { x: player.x, z: player.z };
    const bob = reducedMotion ? 0 : Math.sin(stride.current * 3.2) * 0.04;
    camera.position.set(player.x, EYE_HEIGHT + bob, player.z);
    camera.rotation.set(-0.06, player.heading, 0, "YXZ");
  });

  return null;
}

function clamp(value: number) {
  return Math.min(1, Math.max(-1, value));
}
