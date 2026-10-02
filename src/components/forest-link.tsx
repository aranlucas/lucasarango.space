import { ArrowRight } from "lucide-react";
import Link from "next/link";

/** The game's owl as a one-bit sprite: the receipt's return policy is a wrong turn. */
export function ForestLink() {
  return (
    <Link
      href="/forest"
      prefetch={false}
      className="forest-link"
      aria-label="Take a wrong turn. Explore the 404 forest and its critters."
    >
      <svg viewBox="0 0 9 10" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
        <path d="M1 0h1v1h1v1h3V1h1V0h1v8H1zM0 9h9v1H0z" fill="currentColor" />
        <g className="owl-eyes" fill="var(--background)">
          <rect x="2" y="3" width="1" height="1" />
          <rect x="6" y="3" width="1" height="1" />
        </g>
      </svg>
      <span>Returns: take a wrong turn</span>
      <ArrowRight aria-hidden="true" size={14} />
    </Link>
  );
}
