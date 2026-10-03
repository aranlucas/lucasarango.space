"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh, MeshBasicMaterial, Sprite, SpriteMaterial } from "three";

import { type Critter, CRITTERS, type Game, REVEAL_SECONDS, SPOT_SECONDS } from "../game";
import { SILHOUETTES, type Textures } from "./textures";

const SLOTS = 5;

/** Eyes blink open and shut over these many seconds. */
const OPENING = 0.15;

const CLOSING = 0.2;

/** Silhouette opacity in the dark, and at the end of a hold just before it's spotted. */
const DIM = 0.16;

const HELD = 0.6;

interface SlotProps {
  game: Game;
  index: number;
}

/**
 * A fixed pool of critters. Each slot renders whichever critter sits at its
 * index this frame, so spawning never re-renders React.
 */
export function Critters({
  game,
  textures,
  reducedMotion,
}: {
  game: Game;
  textures: Textures;
  reducedMotion: boolean;
}) {
  return Array.from({ length: SLOTS }, (_, index) => (
    <CritterSlot key={index} game={game} index={index}>
      <Eye game={game} index={index} side={-1} />
      <Eye game={game} index={index} side={1} />
      <Silhouette game={game} index={index} textures={textures} />
      <PointsLabel game={game} index={index} textures={textures} reducedMotion={reducedMotion} />
    </CritterSlot>
  ));
}

function CritterSlot({ game, index, children }: SlotProps & { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const critter = game.critters.at(index);

    if (!group.current) return;
    group.current.visible = critter !== undefined;

    if (critter) group.current.position.set(...critter.position);
  });

  return (
    <group ref={group} visible={false}>
      {children}
    </group>
  );
}

/** One glowing eye: faint in the dark, bright while the beam is on it. */
function Eye({ game, index, side }: SlotProps & { side: -1 | 1 }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const critter = game.critters.at(index);

    if (!critter || !mesh.current || !material.current) return;
    const silhouette = SILHOUETTES[critter.kind];
    const open = openness(critter, game.elapsed);
    mesh.current.position.x = (side * (silhouette.eyeGap / 256) * silhouette.width) / 2;
    mesh.current.scale.set(
      silhouette.eyeRadius,
      silhouette.eyeRadius * Math.max(open, 0.05),
      silhouette.eyeRadius,
    );
    material.current.color.set(silhouette.eyeColor);
    const lit = critter.held > 0 || critter.spottedAt !== null;
    material.current.opacity = open * (lit ? 1 : 0.4);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial ref={material} fog={false} toneMapped={false} transparent />
    </mesh>
  );
}

function openness(critter: Critter, now: number) {
  if (critter.spottedAt !== null) return 1;

  return clamp01((now - critter.bornAt) / OPENING) * clamp01((critter.diesAt - now) / CLOSING);
}

/**
 * Runs `update` each frame with the slot's critter and how far through its
 * reveal it is (0–1), or with no critter when there's nothing to reveal.
 */
function useReveal(
  game: Game,
  index: number,
  update: (critter: Critter | undefined, reveal: number) => void,
) {
  useFrame(() => {
    const critter = game.critters.at(index);
    const spottedAt = critter?.spottedAt ?? null;

    if (spottedAt === null) update(undefined, 0);
    else update(critter, (game.elapsed - spottedAt) / REVEAL_SECONDS);
  });
}

/**
 * The critter's body behind its eyes: a faint silhouette in the dark that firms up
 * while the beam holds on it, then shows in full once spotted.
 */
function Silhouette({ game, index, textures }: SlotProps & { textures: Textures }) {
  const sprite = useRef<Sprite>(null);
  const material = useRef<SpriteMaterial>(null);

  useFrame(() => {
    const critter = game.critters.at(index);

    if (!sprite.current || !material.current) return;
    sprite.current.visible = critter !== undefined;

    if (!critter) return;
    const silhouette = SILHOUETTES[critter.kind];
    material.current.map = textures.silhouettes[critter.kind];
    material.current.opacity = presence(critter, game.elapsed);
    sprite.current.scale.set(silhouette.width, spriteHeight(critter), 1);
    sprite.current.center.set(0.5, 1 - silhouette.eyeY / silhouette.height);
  });

  return (
    <sprite ref={sprite} position-z={-0.02}>
      <spriteMaterial
        ref={material}
        map={textures.silhouettes.deer}
        depthWrite={false}
        transparent
      />
    </sprite>
  );
}

/** How solid a critter's silhouette is right now, 0 to 1. */
function presence(critter: Critter, now: number) {
  if (critter.spottedAt === null) {
    const hold = Math.min(1, critter.held / SPOT_SECONDS);

    return openness(critter, now) * (DIM + (HELD - DIM) * hold);
  }

  const reveal = (now - critter.spottedAt) / REVEAL_SECONDS;

  return reveal < 0.2 ? HELD + (1 - HELD) * (reveal / 0.2) : 1 - (reveal - 0.2) / 0.8;
}

/** "+N" floating up from a spotted critter's head. */
function PointsLabel({
  game,
  index,
  textures,
  reducedMotion,
}: SlotProps & { textures: Textures; reducedMotion: boolean }) {
  const sprite = useRef<Sprite>(null);
  const material = useRef<SpriteMaterial>(null);

  useReveal(game, index, (critter, reveal) => {
    if (!sprite.current || !material.current) return;
    sprite.current.visible = critter !== undefined;
    const map = critter && textures.points.get(CRITTERS[critter.kind].points);

    if (!critter || !map) return;
    const silhouette = SILHOUETTES[critter.kind];
    material.current.map = map;
    material.current.opacity = 1 - reveal;
    const rise = reducedMotion ? 0 : reveal * 0.35;
    sprite.current.position.y =
      (silhouette.eyeY / silhouette.height) * spriteHeight(critter) + 0.2 + rise;
  });

  return (
    <sprite ref={sprite} scale={[0.5, 0.25, 1]}>
      <spriteMaterial
        ref={material}
        map={textures.points.get(1)}
        fog={false}
        depthWrite={false}
        transparent
      />
    </sprite>
  );
}

function spriteHeight(critter: Critter) {
  const silhouette = SILHOUETTES[critter.kind];

  return (silhouette.width * silhouette.height) / 256;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
