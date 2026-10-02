// Critter spotting: you walk a dark forest while pairs of eyes blink open
// ahead of you, and holding the headlamp on them spots them. Pure and
// framework-free so the rules are testable; the scene mutates one game object
// per frame and renders it.

import { createWorld, isClear, MIDDLE_TIER, resolve, type World } from "./world";

export type CritterKind = "deer" | "owl" | "marmot" | "sasquatch";

interface CritterSpec {
  points: number;
  /** Relative spawn chance. */
  weight: number;
  /** Seconds the eyes stay open, [min, max]. */
  lifetime: [number, number];
  /** Eye height above the ground, [min, max]. */
  height: [number, number];
}

export const CRITTERS: Record<CritterKind, CritterSpec> = {
  deer: { points: 1, weight: 46, lifetime: [2, 3], height: [0.8, 1.1] },
  owl: { points: 1, weight: 34, lifetime: [2, 3], height: [1.2, 2.4] },
  marmot: { points: 2, weight: 16, lifetime: [1.2, 1.8], height: [0.15, 0.3] },
  sasquatch: { points: 5, weight: 4, lifetime: [0.9, 1.2], height: [2, 2.3] },
};

export const ROUND_SECONDS = 45;
/** Metres per second. */
export const WALK_SPEED = 3.2;
/** Radians per second. */
export const TURN_SPEED = 1.9;
/** Critters appear this far ahead of the player, [min, max] metres... */
export const SPAWN_DISTANCE: [number, number] = [6, 14];
/** ...and between these many radians either side of where they face: never dead ahead, where the beam rests. */
export const SPAWN_SPREAD = 0.6;
const SPAWN_MIN_ANGLE = 0.12;
/** How long the beam must rest on a pair of eyes to spot it. */
export const SPOT_SECONDS = 0.3;
/** How long a spotted critter's silhouette lingers. */
export const REVEAL_SECONDS = 0.8;
const MAX_CRITTERS = 5;
/** Seconds between spawns, easing from the first value to the second over a round. */
const SPAWN_INTERVAL: [number, number] = [1.1, 0.45];

export interface Critter {
  id: number;
  kind: CritterKind;
  position: [number, number, number];
  bornAt: number;
  diesAt: number;
  /** Continuous seconds in the beam so far. */
  held: number;
  spottedAt: number | null;
}

/** Where the player stands. Heading 0 faces -z; positive turns left. */
export interface Player {
  x: number;
  z: number;
  heading: number;
}

/** Movement input, each axis -1 to 1: forward walks ahead, turn turns left. */
export interface Walk {
  forward: number;
  turn: number;
}

const STILL: Walk = { forward: 0, turn: 0 };

export interface Game {
  phase: "idle" | "playing" | "over";
  world: World;
  player: Player;
  elapsed: number;
  score: number;
  spotted: number;
  critters: Critter[];
  nextId: number;
  nextSpawnAt: number;
  seed: number;
}

export interface SpotEvent {
  critter: Critter;
  points: number;
}

export function createGame(seed = Date.now(), world = createWorld()): Game {
  return {
    phase: "idle",
    world,
    player: { x: 0, z: 0, heading: 0 },
    elapsed: 0,
    score: 0,
    spotted: 0,
    critters: [],
    nextId: 0,
    nextSpawnAt: 0,
    seed,
  };
}

export function startRound(game: Game) {
  Object.assign(game, {
    phase: "playing",
    elapsed: 0,
    score: 0,
    spotted: 0,
    critters: [],
    nextSpawnAt: 0.6,
  });
}

/**
 * Advances the game by `dt` seconds: walks the player, then checks the beam.
 * `isLit` says whether the beam is on a critter's eyes this frame. Returns
 * the critters spotted this frame.
 */
export function tick(
  game: Game,
  dt: number,
  isLit: (critter: Critter) => boolean,
  walk = STILL,
): SpotEvent[] {
  if (game.phase !== "playing") return [];
  move(game, dt, walk);

  game.elapsed += dt;
  const now = game.elapsed;
  if (now >= ROUND_SECONDS) {
    game.phase = "over";
    game.critters = [];
    return [];
  }

  const events: SpotEvent[] = [];
  for (const critter of game.critters) {
    // Expiration wins over a hold completed on the same frame.
    if (critter.spottedAt !== null || now >= critter.diesAt) continue;
    critter.held = isLit(critter) ? critter.held + dt : 0;
    if (critter.held >= SPOT_SECONDS) {
      critter.spottedAt = now;
      const { points } = CRITTERS[critter.kind];
      game.score += points;
      game.spotted += 1;
      events.push({ critter, points });
    }
  }

  game.critters = game.critters.filter((c) =>
    c.spottedAt === null ? now < c.diesAt : now < c.spottedAt + REVEAL_SECONDS,
  );

  if (now >= game.nextSpawnAt) {
    if (game.critters.length < MAX_CRITTERS) game.critters.push(spawn(game));
    const progress = now / ROUND_SECONDS;
    game.nextSpawnAt = now + SPAWN_INTERVAL[0] + (SPAWN_INTERVAL[1] - SPAWN_INTERVAL[0]) * progress;
  }

  return events;
}

function move(game: Game, dt: number, walk: Walk) {
  const { player } = game;
  player.heading += walk.turn * TURN_SPEED * dt;
  const step = walk.forward * WALK_SPEED * dt;
  [player.x, player.z] = resolve(
    game.world,
    player.x - Math.sin(player.heading) * step,
    player.z - Math.cos(player.heading) * step,
  );
}

function spawn(game: Game): Critter {
  const roll = pickKind(random(game));
  // Owls only sit in trees; with none in view, a deer turns up instead.
  const perch = roll === "owl" ? perchInView(game) : null;
  const kind = roll === "owl" && !perch ? "deer" : roll;
  const spec = CRITTERS[kind];
  const position: Critter["position"] = perch ?? onGround(game, between(game, spec.height));
  const lifetime = between(game, spec.lifetime);
  return {
    id: game.nextId++,
    kind,
    position,
    bornAt: game.elapsed,
    diesAt: game.elapsed + lifetime,
    held: 0,
    spottedAt: null,
  };
}

function onGround(game: Game, height: number): Critter["position"] {
  const [x, z] = spawnPoint(game);
  return [x, height, z];
}

/**
 * An owl's seat: the rim of a fir's middle tier, on the side facing the
 * player, for a random tree in view.
 */
function perchInView(game: Game): Critter["position"] | null {
  const { player } = game;
  const trees = game.world.trees.filter((tree) => {
    const dx = tree.x - player.x;
    const dz = tree.z - player.z;
    const distance = Math.hypot(dx, dz);
    const off = Math.atan2(
      Math.sin(Math.atan2(-dx, -dz) - player.heading),
      Math.cos(Math.atan2(-dx, -dz) - player.heading),
    );
    return (
      distance >= SPAWN_DISTANCE[0] &&
      distance <= SPAWN_DISTANCE[1] &&
      Math.abs(off) >= SPAWN_MIN_ANGLE &&
      Math.abs(off) <= SPAWN_SPREAD
    );
  });
  const tree = trees.at(Math.floor(random(game) * trees.length));
  if (tree === undefined) return null;
  const toward = Math.hypot(player.x - tree.x, player.z - tree.z);
  const reach = MIDDLE_TIER.radius * tree.scale * 0.9;
  return [
    tree.x + ((player.x - tree.x) / toward) * reach,
    MIDDLE_TIER.base * tree.scale + 0.28,
    tree.z + ((player.z - tree.z) / toward) * reach,
  ];
}

/** Somewhere in the player's view, preferring spots not inside a trunk. */
function spawnPoint(game: Game): [number, number] {
  const { player } = game;
  let point: [number, number] = [player.x, player.z];
  for (let attempt = 0; attempt < 6; attempt++) {
    const side = random(game) < 0.5 ? -1 : 1;
    const bearing = player.heading + side * between(game, [SPAWN_MIN_ANGLE, SPAWN_SPREAD]);
    const distance = between(game, SPAWN_DISTANCE);
    point = [player.x - Math.sin(bearing) * distance, player.z - Math.cos(bearing) * distance];
    if (isClear(game.world, point[0], point[1], 0.6)) break;
  }
  return point;
}

const KINDS = ["deer", "owl", "marmot", "sasquatch"] as const satisfies readonly CritterKind[];
const TOTAL_WEIGHT = KINDS.reduce((sum, kind) => sum + CRITTERS[kind].weight, 0);

function pickKind(roll: number): CritterKind {
  let remaining = roll * TOTAL_WEIGHT;
  for (const kind of KINDS) {
    remaining -= CRITTERS[kind].weight;
    if (remaining < 0) return kind;
  }
  return "deer";
}

function between(game: Game, [min, max]: [number, number]) {
  return min + (max - min) * random(game);
}

/** mulberry32, stepped through the game's seed so rounds replay for tests. */
function random(game: Game) {
  game.seed = (game.seed + 0x6d2b79f5) >>> 0;
  let t = game.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
}
