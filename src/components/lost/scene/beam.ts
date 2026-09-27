/** Where the headlamp points, in normalized device coordinates (-1 to 1, y up). */
export interface Beam {
  x: number;
  y: number;
}

/** How close (in NDC, aspect-corrected) the beam's centre must be to a pair of eyes. */
export const SPOT_RADIUS = 0.14;
