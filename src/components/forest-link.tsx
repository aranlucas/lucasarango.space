import Link from "next/link";

/** A small version of the owl painted in lost/scene/textures.ts, without loading the game. */
export function ForestLink() {
  return (
    <Link
      href="/forest"
      prefetch={false}
      className="forest-link"
      aria-label="Take a wrong turn. Explore the 404 forest and its critters."
    >
      <svg viewBox="0 0 256 256" aria-hidden="true" focusable="false">
        <g fill="currentColor">
          <path d="M0 226h256v14H0z" />
          <ellipse cx="128" cy="150" rx="62" ry="84" />
          <path d="M72 110 82 44 112 84M184 110 174 44 144 84" />
        </g>
        <g className="owl-eyes" fill="var(--background)">
          <circle cx="105" cy="108" r="9" />
          <circle cx="151" cy="108" r="9" />
        </g>
      </svg>
      <span>
        Take a wrong turn.
        <small>There are critters in the woods.</small>
      </span>
    </Link>
  );
}
