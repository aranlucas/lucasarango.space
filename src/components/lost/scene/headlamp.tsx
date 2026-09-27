"use client";

import { type RootState, useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Object3D,
  Raycaster,
  type SpotLight,
  type Sprite,
  type Texture,
  Vector2,
} from "three";

import type { Beam } from "./beam";
import { LAMP } from "./palette";

const INTENSITY = 70;

/** The ray from the camera through the beam's point on screen, recomputed per frame. */
function useBeamRay(beam: RefObject<Beam>) {
  const raycaster = useMemo(() => new Raycaster(), []);
  const ndc = useMemo(() => new Vector2(), []);
  return ({ camera }: RootState) => {
    raycaster.setFromCamera(ndc.set(beam.current.x, beam.current.y), camera);
    return raycaster.ray;
  };
}

/** A spotlight on your forehead, aimed down the beam. */
export function Headlamp({ beam, on }: { beam: RefObject<Beam>; on: boolean }) {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const rayFor = useBeamRay(beam);

  useFrame((state) => {
    const { origin, direction } = rayFor(state);
    target.position.copy(origin).addScaledVector(direction, 12);
    if (!light.current) return;
    light.current.position.copy(state.camera.position).add({ x: 0.15, y: 0.12, z: 0 });
    light.current.intensity = on ? INTENSITY : 0;
  });

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        target={target}
        color={LAMP}
        angle={0.15}
        penumbra={0.45}
        decay={1}
        distance={32}
      />
    </>
  );
}

/** A soft glow a little way down the beam, where the light scatters in the fog. */
export function FogGlow({ beam, on, glow }: { beam: RefObject<Beam>; on: boolean; glow: Texture }) {
  const halo = useRef<Sprite>(null);
  const rayFor = useBeamRay(beam);

  useFrame((state) => {
    const { origin, direction } = rayFor(state);
    if (!halo.current) return;
    halo.current.position.copy(origin).addScaledVector(direction, 2.4);
    halo.current.visible = on;
  });

  return (
    <sprite ref={halo} scale={1.3}>
      <spriteMaterial
        map={glow}
        blending={AdditiveBlending}
        opacity={0.2}
        depthWrite={false}
        fog={false}
        transparent
      />
    </sprite>
  );
}
