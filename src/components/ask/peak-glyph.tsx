import { cn } from "cn";

// A 9×6 one-bit peak. While an answer is on its way it prints row by row, then
// feeds again; reduced motion holds the finished sprite.
const ROWS = ["....#....", "...###...", "..##.##..", ".##...##.", "##.....##", "#########"];
const PIXELS = ROWS.flatMap((row, y) =>
  row.split("").flatMap((cell, x) => (cell === "#" ? [{ x, y, id: `${x}-${y}` }] : [])),
);

export function PeakGlyph({
  printing = false,
  className,
}: {
  printing?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={cn("block", printing && "glyph-printing", className)}
      viewBox="0 0 9 6"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {PIXELS.map(({ x, y, id }) => (
        <rect key={id} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}
