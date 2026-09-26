import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { TextLink } from "@/components/site-header";
import { PROJECTS } from "@/lib/projects";

export function ProjectList() {
  return (
    <ul className="flex flex-col gap-8">
      {PROJECTS.map((project) => (
        <li key={project.name} className="reveal">
          <h3 className="mb-2 text-lg font-semibold">
            <TextLink
              href={project.source}
              className="inline-flex items-center gap-1.5 no-underline hover:underline"
            >
              {project.name}
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </TextLink>
          </h3>
          <p className="text-base/relaxed">{project.description}</p>
          <Link
            href={project.story}
            className="mt-3 inline-block text-sm text-primary underline underline-offset-3 hover:decoration-2"
          >
            Read the story<span className="sr-only"> behind {project.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
