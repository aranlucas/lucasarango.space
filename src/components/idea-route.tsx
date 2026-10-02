"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { PROJECTS } from "@/lib/projects";

// A conceptual map of the workflows described in the published project stories.
// It is a portfolio interaction, not a simulation of the deployed products.
const ROUTES = [
  {
    label: "Groceries",
    title: "The weekly grocery run.",
    stops: ["A real need", "A small tool", "Something useful"],
    notes: [
      "I wanted an AI to help with my own grocery shopping at QFC.",
      "I built MCP tools for finding products and putting them in a cart.",
      "That personal prototype inspired my Ask DoorDash pitch. I still review the cart before checkout.",
    ],
  },
  {
    label: "Whiteboard",
    title: "An idea worth drawing.",
    stops: ["Practice alone", "Share a canvas", "Think together"],
    notes: [
      "System design practice needs a whiteboard, not just a chat window.",
      "A person and an AI agent can work on the same Excalidraw diagram.",
      "The agent reads components and connections. Version history lets me undo an experiment.",
    ],
  },
  {
    label: "Plugins",
    title: "Tools that travel well.",
    stops: ["Scattered setup", "One collection", "Same tools"],
    notes: [
      "Connecting each of my MCP servers to each AI client by hand got old fast.",
      "A plugin packages a server’s connection with instructions for using it.",
      "I keep the source in one repository and bring the same tools to clients that support them.",
    ],
  },
] as const;

export function IdeaRoute() {
  const [selected, setSelected] = useState(0);
  const [stop, setStop] = useState(0);
  const id = useId();
  const route = ROUTES[selected];
  const project = PROJECTS[selected];

  return (
    <section className="idea-route" aria-labelledby={`${id}-title`}>
      <div className="route-topline">
        <h2 id={`${id}-title`}>On my workbench</h2>
      </div>
      <RouteSwitcher
        selected={selected}
        onSelect={(index) => {
          setSelected(index);
          setStop(0);
        }}
      />
      <p className="route-title">{route.title}</p>
      <RouteMap route={route} stop={stop} id={id} onStop={setStop} />
      <div className="route-note" id={`${id}-note`} aria-live="polite" aria-atomic="true">
        <p>{route.notes[stop]}</p>
      </div>
      <div className="route-actions">
        <button
          type="button"
          className="route-next"
          onClick={() => {
            setStop((value) => (value + 1) % 3);
          }}
        >
          {stop === 2 ? "Start again" : "Follow the path"}
          {stop === 2 ? (
            <RotateCcw aria-hidden="true" size={17} />
          ) : (
            <ArrowRight aria-hidden="true" size={18} />
          )}
        </button>
        <Link href={project.story}>
          Read the story <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <p className="route-caption">Small tools, from things I wanted to use myself.</p>
    </section>
  );
}

function RouteSwitcher({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="route-switcher" role="group" aria-label="Choose a project route">
      {ROUTES.map((item, index) => (
        <button
          type="button"
          key={item.label}
          aria-pressed={selected === index}
          onClick={() => {
            onSelect(index);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function RouteMap({
  route,
  stop,
  id,
  onStop,
}: {
  route: (typeof ROUTES)[number];
  stop: number;
  id: string;
  onStop: (index: number) => void;
}) {
  return (
    <div className="route-map">
      <svg aria-hidden="true" viewBox="0 0 440 160" preserveAspectRatio="none">
        <path className="route-track" d="M24 28 H190 Q218 28 218 56 V100 Q218 132 250 132 H416" />
        <path
          className="route-trace"
          pathLength="1"
          d="M24 28 H190 Q218 28 218 56 V100 Q218 132 250 132 H416"
          style={{ strokeDasharray: 1, strokeDashoffset: stop === 0 ? 1 : stop === 1 ? 0.5 : 0 }}
        />
      </svg>
      <ol className="route-stops">
        {route.stops.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              aria-pressed={stop === index}
              aria-controls={`${id}-note`}
              className={index <= stop ? "route-stop reached" : "route-stop"}
              onClick={() => {
                onStop(index);
              }}
            >
              <span className="route-dot" aria-hidden="true" />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
