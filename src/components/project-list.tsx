import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { TextLink } from "@/components/site-header";
import { PROJECTS } from "@/lib/projects";

/** Projects as receipt lines: each line opens its story; the note links the source. */
export function ProjectsSection() {
  return (
    <section aria-labelledby="projects">
      <SectionHeading id="projects" aside={<span className="tally">Qty {PROJECTS.length}</span>}>
        Things I’m building
      </SectionHeading>
      <ul className="line-items">
        {PROJECTS.map((project) => (
          <li key={project.name}>
            <Link href={project.story} className="line-item line-link">
              <span className="line-title line-caps">{project.name}</span>
              <span className="line-leader" aria-hidden="true" />
              <span className="line-qty">
                Story <ArrowRight aria-hidden="true" size={14} />
              </span>
            </Link>
            <p className="line-note">
              {project.description}{" "}
              <TextLink href={project.source} className="whitespace-nowrap">
                Source
                <ArrowUpRight aria-hidden="true" className="inline" size={13} />
                <span className="sr-only"> for {project.name}</span>
              </TextLink>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
