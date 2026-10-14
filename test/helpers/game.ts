import {
  type createGame,
  type Critter,
  type SpotEvent,
  tick,
  type Walk,
} from "@/components/lost/game";

export const FRAME = 1 / 60;

export const never = () => false;

export const always = () => true;

/** Advances the game by `seconds` in 60fps frames, collecting every spot event. */
export function run(
  game: ReturnType<typeof createGame>,
  seconds: number,
  lit: (c: Critter) => boolean,
  walk?: Walk,
) {
  const events: SpotEvent[] = [];

  for (let t = 0; t < seconds; t += FRAME) {
    events.push(...tick(game, FRAME, lit, walk));
  }

  return events;
}
