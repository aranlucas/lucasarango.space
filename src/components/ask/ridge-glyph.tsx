import { cn } from "cn";

import { CONTOURS } from "@/components/ridgeline";

/**
 * The homepage ridgeline in miniature: the launcher's mark, and the loading
 * state, where the top contour keeps redrawing until the answer arrives.
 */
export function RidgeGlyph({
  drawing = false,
  className,
}: {
  drawing?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={cn("block overflow-visible", className)}
      viewBox="0 30 600 110"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {CONTOURS.slice(0, 2).map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          strokeWidth={i === 0 ? 1.75 : 1.25}
          className={cn(
            "fill-none",
            // The lower contour holds still, so the glyph never blanks mid-loop.
            drawing && i === 0 ? "contour-loop" : undefined,
            i === 0 ? "stroke-current" : "stroke-ridge",
          )}
        />
      ))}
    </svg>
  );
}
