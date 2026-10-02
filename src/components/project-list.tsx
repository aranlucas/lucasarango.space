import { ArrowRight, ArrowUpRight, GitBranch, ShoppingBasket, Workflow } from "lucide-react";
import Link from "next/link";

import { TextLink } from "@/components/site-header";
import { PROJECTS } from "@/lib/projects";

const NOTES = [
  {
    className: "project-exhibit project-grocery",
    question: "What if the weekly shop started with a conversation?",
    terms: ["Your pantry", "Find products", "A cart you review"],
    icon: ShoppingBasket,
    diagramClass: "project-diagram diagram-chain",
  },
  {
    className: "project-exhibit project-whiteboard",
    question: "What if your thinking partner could draw alongside you?",
    terms: ["You", "Shared canvas", "AI agent"],
    icon: Workflow,
    diagramClass: "project-diagram diagram-shared",
  },
  {
    className: "project-exhibit project-plugins",
    question: "What if your tools followed you from one client to the next?",
    terms: ["One collection", "Claude Code", "Cursor"],
    icon: GitBranch,
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
                  <ArrowUpRight aria-hidden="true" size={25} />
                </TextLink>
              </h3>
              <p className="project-question">{note.question}</p>
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
  const Icon = note.icon;
  return (
    <figure className={note.diagramClass}>
      <Icon aria-hidden="true" size={36} strokeWidth={1.5} />
      <ul>
        {note.terms.map((term) => (
          <li key={term}>
            <span className="diagram-node" aria-hidden="true" />
            {term}
          </li>
        ))}
      </ul>
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
