import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { TextLink } from "@/components/site-header";
import { PROJECTS } from "@/lib/projects";

const NOTES = [
  {
    className: "project-exhibit project-grocery",
    terms: ["Your pantry", "Find products", "A cart you review"],
    diagramClass: "project-diagram diagram-chain",
  },
  {
    className: "project-exhibit project-whiteboard",
    terms: ["You", "Shared canvas", "AI agent"],
    diagramClass: "project-diagram diagram-shared",
  },
  {
    className: "project-exhibit project-plugins",
    terms: ["One collection", "Claude Code", "Cursor"],
    diagramClass: "project-diagram diagram-fork",
  },
] as const;

export function ProjectList() {
  return (
    <div className="project-exhibits">
      {PROJECTS.map((project, index) => {
        const note = NOTES[index];
        return (
          <article key={project.name} className={note.className}>
            <div className="project-copy">
              <h3>
                <TextLink href={project.source}>
                  {project.name}
                  <ArrowUpRight aria-hidden="true" size={15} />
                </TextLink>
              </h3>
              <p className="project-description">{project.description}</p>
              <div className="project-links">
                <Link href={project.story}>
                  Read the story <ArrowRight aria-hidden="true" size={18} />
                  <span className="sr-only"> behind {project.name}</span>
                </Link>
                <TextLink href={project.source}>
                  View source <ArrowUpRight aria-hidden="true" size={16} />
                  <span className="sr-only"> for {project.name}</span>
                </TextLink>
              </div>
            </div>
            <ProjectDiagram index={index} />
          </article>
        );
      })}
    </div>
  );
}

function ProjectDiagram({ index }: { index: number }) {
  const note = NOTES[index];
  return (
    <figure className={note.diagramClass}>
      <svg
        className="project-flow"
        viewBox="0 0 280 104"
        role="img"
        aria-label={
          index === 2
            ? "One collection connects to Claude Code and Cursor."
            : index === 1
              ? "You and an AI agent share one canvas."
              : "Your pantry, finding products, and a cart you review."
        }
      >
        <path
          className="project-flow-line"
          d={index === 2 ? "M12 16 V80 H40 M12 48 H40" : "M12 16 V80"}
        />
        {note.terms.map((term, termIndex) => {
          const x = index === 2 && termIndex > 0 ? 40 : 12;
          const y = 16 + termIndex * 32;
          return (
            <g key={term}>
              {index === 1 && termIndex === 1 ? (
                <rect className="project-flow-joint" x={x - 4} y={y - 4} width={8} height={8} />
              ) : (
                <circle className="project-flow-node" cx={x} cy={y} r={4} />
              )}
              <text x={x + 20} y={y} dominantBaseline="middle">
                {term}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        {index === 1
          ? "A shared whiteboard, with version history."
          : index === 2
            ? "Shared connections. Different clients."
            : "The agent builds the cart. You make the call."}
      </figcaption>
    </figure>
  );
}
