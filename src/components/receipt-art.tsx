import { cn } from "cn";

// One-bit fills, the way a thermal printer shades a logo: ordered dither
// patterns in ink on the paper, no greys.
const DITHER = [
  { id: "dither-12", size: 4, dots: [[0, 0]] },
  {
    id: "dither-25",
    size: 4,
    dots: [
      [0, 0],
      [2, 2],
    ],
  },
  {
    id: "dither-50",
    size: 2,
    dots: [
      [0, 0],
      [1, 1],
    ],
  },
] as const;

const FIRS = [
  [14, 30, 22],
  [34, 54, 32],
  [58, 70, 18],
  [240, 260, 30],
  [262, 278, 22],
  [282, 306, 36],
  [304, 316, 16],
] as const;

/** A dithered Cascades peak above a line of firs, printed like a receipt header. */
export function ReceiptArt({ className }: { className?: string }) {
  return (
    <svg
      className={cn("receipt-art", className)}
      viewBox="0 0 320 120"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <defs>
        {DITHER.map(({ id, size, dots }) => (
          <pattern key={id} id={id} width={size} height={size} patternUnits="userSpaceOnUse">
            {dots.map(([x, y]) => (
              <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
            ))}
          </pattern>
        ))}
        <pattern id="dither-75" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="currentColor" />
          <rect x="1" y="1" width="1" height="1" fill="var(--background)" />
        </pattern>
      </defs>
      <path
        d="M0 120V96L40 78 70 86 104 60 128 70 160 18 184 44 198 40 232 72 262 62 296 80 320 74V120Z"
        fill="url(#dither-25)"
        stroke="currentColor"
        strokeWidth="1.5"
        shapeRendering="geometricPrecision"
      />
      <path
        d="M160 18 184 44 176 46 170 40 162 50 154 42 146 48 140 44Z"
        fill="var(--background)"
        stroke="currentColor"
        strokeWidth="1.5"
        shapeRendering="geometricPrecision"
      />
      <path d="M0 120V104L60 92 120 100 200 84 260 96 320 90V120Z" fill="url(#dither-50)" />
      <g fill="url(#dither-75)">
        {FIRS.map(([left, right, height]) => (
          <path key={left} d={`M${left} 120 ${(left + right) / 2} ${120 - height} ${right} 120Z`} />
        ))}
      </g>
      <rect y="118" width="320" height="2" fill="currentColor" />
    </svg>
  );
}

// Bar widths spell nothing; they only need to read as a barcode.
const BARS = [
  3, 1, 2, 1, 1, 2, 3, 1, 1, 3, 2, 1, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3,
];
const BAR_RUNS = BARS.reduce<{ x: number; width: number }[]>((runs, width) => {
  const last = runs.at(-1);
  runs.push({ x: last ? last.x + last.width : 0, width });
  return runs;
}, []);
const BARCODE_WIDTH = BARS.reduce((sum, width) => sum + width, 0);

/** The footer's barcode: decorative, like the end of every receipt. */
export function Barcode({ className }: { className?: string }) {
  return (
    <svg
      className={cn("barcode", className)}
      viewBox={`0 0 ${BARCODE_WIDTH} 24`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {BAR_RUNS.map(({ x, width }, i) =>
        i % 2 === 0 ? <rect key={x} x={x} width={width} height="24" fill="currentColor" /> : null,
      )}
    </svg>
  );
}
