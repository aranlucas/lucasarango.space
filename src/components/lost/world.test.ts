import { describe, expect, it } from "vitest";

import {
  CLEARING_RADIUS,
  createWorld,
  PLAYER_RADIUS,
  plantForest,
  resolve,
  TRUNK_RADIUS,
  WORLD_RADIUS,
} from "./world";

describe("plantForest", () => {
  it("fills the disc but leaves a clearing to start in", () => {
    const trees = plantForest();
    expect(trees.length).toBeGreaterThan(200);

    for (const { x, z } of trees) {
      const r = Math.hypot(x, z);
      expect(r).toBeGreaterThan(CLEARING_RADIUS);
      expect(r).toBeLessThan(WORLD_RADIUS + 3);
    }
  });

  it("grows the same forest every time", () => {
    expect(plantForest()).toEqual(plantForest());
  });
});

describe("resolve", () => {
  const world = createWorld([{ x: 0, z: -3, scale: 1 }]);
  const clearance = TRUNK_RADIUS + PLAYER_RADIUS;

  it("leaves open ground alone", () => {
    expect(resolve(world, 2, 2)).toEqual([2, 2]);
  });

  it("pushes the player out of a trunk", () => {
    const [x, z] = resolve(world, 0.1, -3 + clearance / 2);
    expect(Math.hypot(x, z + 3)).toBeCloseTo(clearance);
  });

  it("keeps the player inside the tree line", () => {
    const [x, z] = resolve(world, WORLD_RADIUS * 2, 0);
    expect(Math.hypot(x, z)).toBeLessThanOrEqual(WORLD_RADIUS);
  });
});
