"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ConeGeometry, CylinderGeometry, type InstancedMesh, Object3D } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import type { Tree } from "../world";
import { FIR, GROUND, NIGHT, TRUNK } from "./palette";

/** A low-poly fir: three stacked seven-sided cones on a short trunk, 3.4 units tall. */
function firGeometry() {
  const trunk = new CylinderGeometry(0.09, 0.12, 0.6, 5).translate(0, 0.3, 0);
  const tiers = [
    new ConeGeometry(0.95, 1.4, 7).translate(0, 1.1, 0),
    new ConeGeometry(0.72, 1.2, 7).translate(0, 1.85, 0),
    new ConeGeometry(0.46, 1.1, 7).translate(0, 2.6, 0),
  ];
  const needles = mergeGeometries(tiers);
  for (const g of tiers) g.dispose();
  return { trunk, needles };
}

/** Night, fog, and a little skylight: everything the headlamp isn't lighting. */
export function Night() {
  return (
    <>
      <color attach="background" args={[NIGHT]} />
      <fogExp2 attach="fog" args={[NIGHT, 0.07]} />
      <hemisphereLight args={["#5d7a8c", "#2a3a33", 1.1]} />
    </>
  );
}

export function Forest({ trees }: { trees: Tree[] }) {
  const { trunk, needles } = useMemo(() => firGeometry(), []);
  const needleRef = useRef<InstancedMesh>(null);
  const trunkRef = useRef<InstancedMesh>(null);

  // Built outside JSX, so R3F won't dispose them on unmount.
  useEffect(() => {
    return () => {
      trunk.dispose();
      needles.dispose();
    };
  }, [trunk, needles]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (const [i, { x, z, scale }] of trees.entries()) {
      dummy.position.set(x, 0, z);
      dummy.scale.setScalar(scale);
      dummy.rotation.y = i * 1.7;
      dummy.updateMatrix();
      needleRef.current?.setMatrixAt(i, dummy.matrix);
      trunkRef.current?.setMatrixAt(i, dummy.matrix);
    }
    for (const mesh of [needleRef.current, trunkRef.current]) {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    }
  }, [trees]);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color={GROUND} roughness={1} />
      </mesh>
      <instancedMesh ref={needleRef} args={[needles, undefined, trees.length]}>
        <meshStandardMaterial color={FIR} flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={trunkRef} args={[trunk, undefined, trees.length]}>
        <meshStandardMaterial color={TRUNK} roughness={1} />
      </instancedMesh>
    </>
  );
}
