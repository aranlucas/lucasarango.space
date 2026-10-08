"use client";

import { Canvas } from "@react-three/fiber";
import { type RefObject, useEffect, useState } from "react";

import type { Game } from "../game";
import { useReducedMotion } from "../hooks";
import type { Beam } from "./beam";
import { Critters } from "./critters";
import { CameraRig, type Controls, Director, type Hud } from "./director";
import { Forest, Night } from "./forest";
import { createTextures, disposeTextures } from "./textures";
import { TrailSign } from "./trail-sign";

interface Props {
  game: Game;
  /** Where the player is pointing; the beam eases toward it. */
  aim: RefObject<Beam>;
  controls: RefObject<Controls>;
  phase: Game["phase"];
  /** False while off-screen or in a background tab: rendering and the clock stop. */
  active: boolean;
  onHud: (hud: Hud) => void;
  onNavigate: (href: string) => void;
}

export default function LostScene(props: Props) {
  const { game, phase, active, onNavigate } = props;
  const reducedMotion = useReducedMotion();
  const [textures] = useState(createTextures);
  useEffect(() => {
    return () => {
      disposeTextures(textures);
    };
  }, [textures]);

  return (
    <Canvas
      frameloop={active ? (phase === "idle" ? "demand" : "always") : "never"}
      dpr={[1, 2]}
      camera={{ fov: 60, near: 0.1, far: 60 }}
    >
      <Director
        game={game}
        aim={props.aim}
        controls={props.controls}
        lampOn={phase !== "idle"}
        glow={textures.glow}
        onHud={props.onHud}
      />
      <CameraRig game={game} reducedMotion={reducedMotion} />
      <Night />
      <Forest trees={game.world.trees} />
      <Critters game={game} textures={textures} reducedMotion={reducedMotion} />
      {phase === "over" && (
        <TrailSign
          game={game}
          textures={textures}
          reducedMotion={reducedMotion}
          onNavigate={onNavigate}
        />
      )}
    </Canvas>
  );
}
