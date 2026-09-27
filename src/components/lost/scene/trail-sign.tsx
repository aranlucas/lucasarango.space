"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group, Texture } from "three";

import type { Game } from "../game";
import { resolve } from "../world";
import { WOOD } from "./palette";
import type { Textures } from "./textures";

const ARM: [number, number, number] = [1.45, 0.34, 0.06];
const RISE_SECONDS = 0.5;
/** The sign rises this far in front of wherever the round ends. */
const AHEAD = 3.5;

/** The trailhead post that appears in front of you when a round ends. Its arms are links. */
export function TrailSign({
  game,
  textures,
  reducedMotion,
  onNavigate,
}: {
  game: Game;
  textures: Textures;
  reducedMotion: boolean;
  onNavigate: (href: string) => void;
}) {
  const [pose] = useState(() => signPose(game));
  const group = useRef<Group>(null);
  const age = useRef(reducedMotion ? RISE_SECONDS : 0);

  useFrame((_, delta) => {
    age.current = Math.min(RISE_SECONDS, age.current + delta);
    const t = age.current / RISE_SECONDS;
    group.current?.scale.setScalar(1 - (1 - t) ** 3);
  });

  return (
    <group ref={group} position={pose.position} rotation-y={pose.heading} scale={0}>
      <mesh position-y={0.95}>
        <cylinderGeometry args={[0.07, 0.08, 1.9, 6]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
      </mesh>
      <SignArm
        texture={textures.home}
        x={-0.62}
        y={1.55}
        onClick={() => {
          onNavigate("/");
        }}
      />
      <SignArm
        texture={textures.writing}
        x={0.62}
        y={1.12}
        onClick={() => {
          onNavigate("/blog");
        }}
      />
    </group>
  );
}

/** A few steps ahead of where the player stands, facing them. */
function signPose({ player, world }: Game) {
  const [x, z] = resolve(
    world,
    player.x - Math.sin(player.heading) * AHEAD,
    player.z - Math.cos(player.heading) * AHEAD,
  );
  return { position: [x, 0, z] as const, heading: player.heading };
}

function SignArm({
  texture,
  x,
  y,
  onClick,
}: {
  texture: Texture;
  x: number;
  y: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  return (
    <group
      position={[x, y, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
    >
      <mesh>
        <boxGeometry args={ARM} />
        <meshStandardMaterial
          color={WOOD}
          roughness={0.85}
          emissive={WOOD}
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh position-z={ARM[2] / 2 + 0.002}>
        <planeGeometry args={[ARM[0], ARM[1]]} />
        <meshStandardMaterial map={texture} transparent roughness={0.8} />
      </mesh>
    </group>
  );
}
