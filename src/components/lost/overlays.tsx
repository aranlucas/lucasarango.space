import Link from "next/link";

import { CRITTERS, type CritterKind } from "./game";
import type { Hud } from "./game-types";

type StartCardProps = {
  canPlay: boolean;
  touch: boolean;
  onPlay: () => void;
  children: React.ReactNode;
};

type ScoreboardProps = { hud: Hud };

type RoundOverProps = {
  score: number;
  best: number;
  onPlay: () => void;
};

const CRITTER_NAMES = new Map<CritterKind, string>([
  ["deer", "deer"],
  ["owl", "owls"],
  ["marmot", "marmots"],
  ["sasquatch", "Sasquatch"],
]);

const scoring = [...Map.groupBy(CRITTER_NAMES, ([kind]) => CRITTERS[kind].points)]
  .map(
    ([points, kinds], index) =>
      `${new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(kinds.map(([, name]) => name))}${index === 0 ? " are worth" : ""} ${points}`,
  )
  .join(", ");

export function StartCard({ canPlay, touch, onPlay, children }: StartCardProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-radial from-night/70 to-transparent px-6 text-center">
      {children}
      {canPlay && (
        <div className="flex max-w-md flex-col items-center gap-3 text-sm text-night-muted">
          <p>
            Or look around while you’re lost. Keep your headlamp on glowing eyes before they blink
            shut: {scoring}.{" "}
            {touch
              ? "The stick walks and turns; tap to aim."
              : "W A S D walks and turns; your mouse aims."}
          </p>
          <PanelButton onClick={onPlay}>
            Switch on your headlamp
            {!touch && <kbd className="ms-2 font-mono text-xs opacity-70">Space</kbd>}
          </PanelButton>
        </div>
      )}
    </div>
  );
}

export function Scoreboard({ hud }: ScoreboardProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 inset-bs-0 flex justify-between px-4 py-3 font-mono text-sm tabular-nums"
    >
      <span>Score {hud.score}</span>
      <span>0:{String(hud.secondsLeft).padStart(2, "0")}</span>
    </div>
  );
}

export function RoundOver({ score, best, onPlay }: RoundOverProps) {
  return (
    <div className="absolute inset-x-0 inset-be-0 flex flex-wrap items-center justify-between gap-3 bg-linear-to-t from-night to-transparent px-4 pbs-8 pbe-3 text-sm">
      <p>
        You scored <strong className="font-semibold">{score}</strong>
        <span className="text-night-muted"> · best {best}</span>. Follow the sign to the{" "}
        <Link href="/" className="underline underline-offset-3">
          front page
        </Link>{" "}
        or{" "}
        <Link href="/blog" className="underline underline-offset-3">
          writing
        </Link>
        .
      </p>
      <PanelButton onClick={onPlay}>Play again</PanelButton>
    </div>
  );
}

function PanelButton(props: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="rounded-md bg-lamp px-4 py-2 text-sm font-semibold text-lamp-foreground hover:brightness-105 focus-visible:ring-2 focus-visible:ring-lamp focus-visible:ring-offset-2 focus-visible:ring-offset-night focus-visible:outline-none"
      {...props}
    />
  );
}
