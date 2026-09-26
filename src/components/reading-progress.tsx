import { CONTOURS } from "@/components/ridgeline";

/** The top ridge contour, revealed across the top of the viewport as you read. */
export function ReadingProgress() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 reading-progress h-5 bg-linear-to-b from-background from-40% to-transparent print:hidden"
    >
      <svg
        className="block size-full"
        viewBox="0 26 600 98"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d={CONTOURS[0]}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth={2.25}
          strokeLinejoin="round"
          className="stroke-primary"
        />
      </svg>
    </div>
  );
}
