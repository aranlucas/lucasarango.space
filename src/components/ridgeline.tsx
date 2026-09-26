import { cn } from "cn";

// Three stacked contour lines of a Cascades-style ridge, drawn once on load.
// Reduced-motion users get the finished drawing. Dark mode adds a few stars.
export const CONTOURS = [
  "M0 118 L60 104 L96 110 L148 78 L176 88 L214 52 L238 60 L262 34 L284 46 L318 70 L352 64 L392 92 L436 82 L486 104 L540 96 L600 112",
  "M0 132 L54 122 L104 126 L150 100 L182 106 L220 80 L250 86 L270 66 L296 76 L330 94 L362 90 L400 110 L444 102 L494 120 L548 114 L600 126",
  "M0 146 L70 138 L118 142 L162 124 L196 128 L232 110 L262 114 L282 100 L310 108 L342 120 L378 118 L414 132 L462 126 L512 138 L560 134 L600 142",
];

// Night sky for dark mode, kept clear of the peak. Zero-length round-capped
// strokes stay circular under the stretched, non-uniform viewBox.
const STARS = [
  [34, 58],
  [96, 36],
  [150, 62],
  [196, 30],
  [338, 34],
  [372, 56],
  [430, 28],
  [486, 50],
  [552, 32],
  [584, 66],
];

export function Ridgeline({ className }: { className?: string }) {
  return (
    <svg
      className={cn("block h-ridge w-full overflow-visible", className)}
      viewBox="0 20 600 132"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="hidden dark:block">
        {STARS.map(([x, y], i) => (
          <path
            key={`${x}-${y}`}
            d={`M${x} ${y}h0`}
            vectorEffect="non-scaling-stroke"
            strokeWidth={i % 3 === 0 ? 2.5 : 1.75}
            className="star stroke-foreground"
            style={{ animationDelay: `${1.6 + ((i * 0.7) % 3)}s` }}
          />
        ))}
      </g>
      {CONTOURS.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          strokeWidth={i === 0 ? 1.75 : 1.25}
          className={cn("contour", i === 0 ? "stroke-primary" : "stroke-ridge")}
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </svg>
  );
}
