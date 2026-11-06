export const PEAK_PATH =
  "M0 120V96L40 78 70 86 104 60 128 70 160 18 184 44 198 40 232 72 262 62 296 80 320 74V120Z";

export const SNOW_PATH = "M160 18 184 44 176 46 170 40 162 50 154 42 146 48 140 44Z";

export const FOREGROUND_PATH = "M0 120V104L60 92 120 100 200 84 260 96 320 90V120Z";

const FIRS = [
  [14, 30, 22],
  [34, 54, 32],
  [58, 70, 18],
  [240, 260, 30],
  [262, 278, 22],
  [282, 306, 36],
  [304, 316, 16],
] as const;

export const FIR_PATHS = FIRS.map(
  ([left, right, height]) => `M${left} 120 ${(left + right) / 2} ${120 - height} ${right} 120Z`,
);
