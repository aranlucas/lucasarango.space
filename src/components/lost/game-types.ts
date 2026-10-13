import type { World } from "./world";

export type CritterKind = "deer" | "owl" | "marmot" | "sasquatch";

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
