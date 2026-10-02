import { describe, expect, it } from "vitest";

import {
  CRITTERS,
  type Critter,
  createGame,
  ROUND_SECONDS,
  REVEAL_SECONDS,
  SPOT_SECONDS,
  SPAWN_DISTANCE,
  SPAWN_SPREAD,
  type SpotEvent,
  startRound,
  tick,
  TURN_SPEED,
  WALK_SPEED,
  type Walk,
} from "./game";
import { createWorld, PLAYER_RADIUS, TRUNK_RADIUS } from "./world";

const FRAME = 1 / 60;
const never = () => false;
const always = () => true;

/** Advances the game by `seconds` in 60fps frames, collecting every spot event. */
function run(
  game: ReturnType<typeof createGame>,
  seconds: number,
  lit: (c: Critter) => boolean,
  walk?: Walk,
) {
  const events: SpotEvent[] = [];
  for (let t = 0; t < seconds; t += FRAME) events.push(...tick(game, FRAME, lit, walk));
  return events;
}

describe("a round", () => {
  it("waits in the idle phase until a round starts", () => {
    const game = createGame(1);
    run(game, 5, always);
    expect(game.phase).toBe("idle");
    expect(game.critters).toHaveLength(0);
  });

  it("starts a fresh round", () => {
    const game = createGame(1);
    startRound(game);
    expect(game).toMatchObject({ phase: "playing", elapsed: 0, score: 0, spotted: 0 });
  });
});

describe("critters", () => {
  it("spawns critters at their kind's height, never too many at once", () => {
    const game = createGame(7);
    startRound(game);
    for (let t = 0; t < ROUND_SECONDS - 1; t += FRAME) {
      tick(game, FRAME, never);
      expect(game.critters.length).toBeLessThanOrEqual(5);
      for (const c of game.critters) {
        const [low, high] = CRITTERS[c.kind].height;
        expect(c.position[1]).toBeGreaterThanOrEqual(low);
        expect(c.position[1]).toBeLessThanOrEqual(high);
      }
    }
    expect(game.nextId).toBeGreaterThan(10);
  });

  it("spawns critters ahead of wherever the player faces", () => {
    const game = createGame(4, createWorld([]));
    startRound(game);
    game.player.heading = 2;
    let seen = 0;
    for (let t = 0; t < 20; t += FRAME) {
      tick(game, FRAME, never);
      for (const c of game.critters.filter((born) => born.bornAt === game.elapsed)) {
        seen++;
        const dx = c.position[0] - game.player.x;
        const dz = c.position[2] - game.player.z;
        const distance = Math.hypot(dx, dz);
        expect(distance).toBeGreaterThanOrEqual(SPAWN_DISTANCE[0] - 1e-9);
        expect(distance).toBeLessThanOrEqual(SPAWN_DISTANCE[1] + 1e-9);
        const bearing = Math.atan2(-dx, -dz);
        const off = Math.atan2(Math.sin(bearing - 2), Math.cos(bearing - 2));
        expect(Math.abs(off)).toBeLessThanOrEqual(SPAWN_SPREAD + 1e-9);
        expect(Math.abs(off)).toBeGreaterThan(0.1);
      }
    }
    expect(seen).toBeGreaterThan(5);
  });
});

describe("owls", () => {
  it("perch on the edge of a nearby fir", () => {
    const game = createGame(8);
    startRound(game);
    const owls = new Map<number, Critter>();
    for (let t = 0; t < 40; t += FRAME) {
      if (game.phase !== "playing") startRound(game);
      tick(game, FRAME, never, { forward: 0.4, turn: 0.3 });
      for (const c of game.critters) if (c.kind === "owl") owls.set(c.id, c);
    }
    expect(owls.size).toBeGreaterThan(3);
    for (const owl of owls.values()) {
      const [x, , z] = owl.position;
      const perch = game.world.trees.find(
        (tree) => Math.hypot(tree.x - x, tree.z - z) < 1.1 * tree.scale,
      );
      expect(perch).toBeDefined();
    }
  });

  it("closes a critter's eyes when its lifetime runs out unspotted", () => {
    const game = createGame(3);
    startRound(game);
    run(game, 2, never);
    const [first] = game.critters;
    expect(first).toBeDefined();
    run(game, first.diesAt - game.elapsed + FRAME, never);
    expect(game.critters.map((c) => c.id)).not.toContain(first.id);
    expect(game.score).toBe(0);
  });
});

describe("spot expiration", () => {
  it("does not revive an expired critter when the hold completes on its final frame", () => {
    const game = createGame(3, createWorld([]));
    startRound(game);
    tick(game, 0.6, never);
    const target = game.critters[0];
    const lit = (c: Critter) => c.id === target.id;

    // Start too late to finish the hold before the critter's lifetime ends.
    tick(game, target.diesAt - game.elapsed - 0.25, never);
    expect(tick(game, 0.1, lit)).toHaveLength(0);
    expect(tick(game, 0.1, lit)).toHaveLength(0);
    expect(tick(game, 0.1, lit)).toHaveLength(0);
    expect(game.score).toBe(0);
    expect(game.spotted).toBe(0);
    expect(game.critters.map((c) => c.id)).not.toContain(target.id);
  });

  it("keeps a timely spot visible for its reveal even after the original lifetime ends", () => {
    const game = createGame(3, createWorld([]));
    startRound(game);
    tick(game, 0.6, never);
    const target = game.critters[0];
    const lit = (c: Critter) => c.id === target.id;

    tick(game, target.diesAt - game.elapsed - 0.35, never);
    tick(game, 0.1, lit);
    tick(game, 0.1, lit);
    expect(tick(game, 0.1, lit).map((event) => event.critter.id)).toEqual([target.id]);
    expect(tick(game, 0.1, lit)).toHaveLength(0);
    expect(game.elapsed).toBeGreaterThan(target.diesAt);
    expect(game.critters.map((c) => c.id)).toContain(target.id);
    expect(game.score).toBe(CRITTERS[target.kind].points);
    expect(game.spotted).toBe(1);

    tick(game, REVEAL_SECONDS, never);
    expect(game.critters.map((c) => c.id)).not.toContain(target.id);
  });
});

describe("spotting", () => {
  it("spots a critter held in the beam long enough, once", () => {
    const game = createGame(3);
    startRound(game);
    run(game, 2, never);
    const target = game.critters[0];
    const lit = (c: Critter) => c.id === target.id;

    expect(run(game, SPOT_SECONDS / 2, lit)).toHaveLength(0);
    const events = run(game, SPOT_SECONDS, lit);
    expect(events.map((e) => [e.critter.id, e.points])).toEqual([
      [target.id, CRITTERS[target.kind].points],
    ]);
    expect(game.score).toBe(CRITTERS[target.kind].points);
    expect(game.spotted).toBe(1);

    expect(run(game, 0.5, lit)).toHaveLength(0);
    expect(game.score).toBe(CRITTERS[target.kind].points);
  });

  it("makes a flicker of the beam start the hold over", () => {
    const game = createGame(3);
    startRound(game);
    run(game, 2, never);
    const target = game.critters[0];
    const lit = (c: Critter) => c.id === target.id;

    run(game, SPOT_SECONDS * 0.6, lit);
    run(game, FRAME, never);
    expect(run(game, SPOT_SECONDS * 0.6, lit)).toHaveLength(0);
  });
});

describe("pacing", () => {
  it("ends the round on time and stops scoring", () => {
    const game = createGame(5);
    startRound(game);
    run(game, ROUND_SECONDS + 0.1, never);
    expect(game.phase).toBe("over");
    expect(game.critters).toHaveLength(0);
    expect(run(game, 3, always)).toHaveLength(0);
    expect(game.critters).toHaveLength(0);
  });

  it("speeds up as the clock runs down", () => {
    const game = createGame(11);
    startRound(game);
    const early = run(game, 10, always).length;
    run(game, 10, always);
    const late = run(game, 9.9, always).length;
    expect(late).toBeGreaterThan(early);
  });

  it("keeps Sasquatch rare", () => {
    const game = createGame(42);
    const kinds: string[] = [];
    for (let round = 0; round < 40; round++) {
      startRound(game);
      for (const { critter } of run(game, ROUND_SECONDS, always)) kinds.push(critter.kind);
    }
    const share = kinds.filter((k) => k === "sasquatch").length / kinds.length;
    expect(share).toBeGreaterThan(0.01);
    expect(share).toBeLessThan(0.1);
  });

  it("plays the same round for the same seed", () => {
    const a = createGame(9);
    const b = createGame(9);
    startRound(a);
    startRound(b);
    run(a, 8, never);
    run(b, 8, never);
    expect(a.critters).toEqual(b.critters);
  });
});

describe("walking", () => {
  const forward: Walk = { forward: 1, turn: 0 };

  it("walks the way the player faces", () => {
    const game = createGame(1, createWorld([]));
    startRound(game);
    run(game, 1, never, forward);
    expect(game.player.z).toBeCloseTo(-WALK_SPEED, 1);
    expect(game.player.x).toBeCloseTo(0);
  });

  it("turns left for a positive turn", () => {
    const game = createGame(1, createWorld([]));
    startRound(game);
    run(game, 0.5, never, { forward: 0, turn: 1 });
    expect(game.player.heading).toBeCloseTo(TURN_SPEED * 0.5, 1);
  });

  it("stops at a trunk instead of walking through it", () => {
    const game = createGame(1, createWorld([{ x: 0, z: -2, scale: 1 }]));
    startRound(game);
    run(game, 3, never, forward);
    const gap = Math.hypot(game.player.x, game.player.z + 2);
    expect(gap).toBeGreaterThanOrEqual(TRUNK_RADIUS + PLAYER_RADIUS - 1e-6);
    expect(game.player.z).toBeGreaterThan(-2);
  });

  it("stands still outside a round", () => {
    const game = createGame(1, createWorld([]));
    run(game, 1, never, forward);
    expect(game.player).toMatchObject({ x: 0, z: 0 });
  });
});
