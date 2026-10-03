// The forest you walk around in: where the trees stand, and how the player
// bumps into them. Pure, so the scene and the tests share one layout.

export interface Tree {
  x: number;
  z: number;
  scale: number;
}

/** You can walk anywhere within this radius; a dense tree line rings it. */
export const WORLD_RADIUS = 32;

/** Open ground around the start, so the first view isn't a trunk. */
export const CLEARING_RADIUS = 4;

export const TRUNK_RADIUS = 0.2;

export const PLAYER_RADIUS = 0.3;

/** The fir's middle tier of branches at scale 1 (see the scene's fir geometry), where owls perch. */
export const MIDDLE_TIER = { base: 1.25, radius: 0.72 };

const SPACING = 2.2;

const CELL = 2;

export interface World {
  trees: Tree[];
  /** Trees bucketed by grid cell, for nearby-trunk lookups. */
  grid: Map<string, Tree[]>;
}

export function createWorld(trees = plantForest()): World {
  const grid = new Map<string, Tree[]>();

  for (const tree of trees) {
    const key = cellKey(tree.x, tree.z);
    grid.set(key, [...(grid.get(key) ?? []), tree]);
  }

  return { trees, grid };
}

/** Scattered firs across the disc, plus a tree line around its edge. */
export function plantForest(): Tree[] {
  let seed = 20_260_927;

  const random = () => {
    seed = (seed * 16_807) % 2_147_483_647;

    return seed / 2_147_483_647;
  };

  const trees: Tree[] = [];

  const crowded = (x: number, z: number) =>
    trees.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < SPACING ** 2);

  for (let attempt = 0; attempt < 4000 && trees.length < 320; attempt++) {
    const r = Math.sqrt(random()) * WORLD_RADIUS;
    const angle = random() * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    if (r > CLEARING_RADIUS && !crowded(x, z)) trees.push({ x, z, scale: 0.75 + random() * 0.7 });
  }

  for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
    const r = WORLD_RADIUS + 1 + random() * 2;
    trees.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, scale: 1 + random() * 0.6 });
  }

  return trees;
}

/** Where the player ends up if they try to stand at (x, z): outside every trunk, inside the tree line. */
export function resolve(world: World, x: number, z: number): [number, number] {
  let px = x;
  let pz = z;
  const clearance = TRUNK_RADIUS + PLAYER_RADIUS;

  for (const tree of nearby(world, px, pz)) {
    const dx = px - tree.x;
    const dz = pz - tree.z;
    const distance = Math.hypot(dx, dz);

    if (distance >= clearance || distance === 0) continue;
    px = tree.x + (dx / distance) * clearance;
    pz = tree.z + (dz / distance) * clearance;
  }

  const r = Math.hypot(px, pz);

  if (r > WORLD_RADIUS) {
    px *= WORLD_RADIUS / r;
    pz *= WORLD_RADIUS / r;
  }

  return [px, pz];
}

/** Whether a point is clear of trunks by at least `margin`. */
export function isClear(world: World, x: number, z: number, margin: number) {
  return nearby(world, x, z).every((t) => Math.hypot(t.x - x, t.z - z) >= margin);
}

function nearby(world: World, x: number, z: number) {
  const cx = Math.floor(x / CELL);
  const cz = Math.floor(z / CELL);
  const found: Tree[] = [];

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) found.push(...(world.grid.get(`${cx + i},${cz + j}`) ?? []));
  }

  return found;
}

function cellKey(x: number, z: number) {
  return `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`;
}
