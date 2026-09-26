import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

import { SectionHeading } from "@/components/section-heading";
import { TextLink } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RESUME_ABOUT,
  RESUME_BASICS,
  RESUME_EDUCATION,
  RESUME_PROJECTS,
  RESUME_ROLES,
  RESUME_SKILLS,
  type ResumeRole,
} from "@/lib/resume";

import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume for Lucas Arango, a senior software engineer who builds conversational AI and agentic products.",
};

export default function ResumePage() {
  return (
    <>
      <ResumeHeader />

      <section aria-labelledby="summary">
        <SectionHeading id="summary">Summary</SectionHeading>
        <p className="mb-4 text-pretty">{RESUME_BASICS.summary}</p>
        <p className="border-s-2 border-primary ps-4 text-sm/relaxed text-muted-foreground">
          {RESUME_BASICS.lookingFor}
        </p>
      </section>

      <section aria-labelledby="experience">
        <SectionHeading id="experience">Experience</SectionHeading>
        <ol className="flex flex-col gap-8">
          {RESUME_ROLES.map((role) => (
            <Role key={`${role.company}-${role.dates}`} role={role} />
          ))}
        </ol>
      </section>

      <section aria-labelledby="projects">
        <SectionHeading id="projects">{RESUME_PROJECTS.heading}</SectionHeading>
        <p className="mb-3">{RESUME_PROJECTS.intro}</p>
        <Bullets items={RESUME_PROJECTS.bullets} />
      </section>

      <Skills />
      <Education />

      <section aria-labelledby="about">
        <SectionHeading id="about">About</SectionHeading>
        <Bullets items={RESUME_ABOUT} />
      </section>
    </>
  );
}

function Role({ role }: { role: ResumeRole }) {
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-semibold">{role.company}</h3>
        <Badge variant="secondary" className="tabular-nums">
          {role.dates}
        </Badge>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {role.title}, {role.location}
      </p>
      <Bullets items={role.bullets} />
      {role.projects !== undefined && (
        <dl className="mt-4 flex flex-col gap-2 text-sm/relaxed">
          {role.projects.map((project) => (
            <div key={project.name}>
              <dt className="inline font-semibold">{project.name}: </dt>
              <dd className="inline text-muted-foreground">{project.description}</dd>
            </div>
          ))}
        </dl>
      )}
      {role.links !== undefined && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm print:hidden">
          {role.links.map((link) => (
            <li key={link.href}>
              <TextLink href={link.href} className="inline-flex items-center gap-1">
                {link.label}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </TextLink>
            </li>
          ))}
        </ul>
      )}
      <Separator className="mt-8 print:hidden" />
    </li>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 ps-5 text-base/relaxed marker:text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ResumeHeader() {
  return (
    <header>
      <h1 className="mb-2 text-display font-semibold tracking-tight">{RESUME_BASICS.name}</h1>
      <p className="mb-4 text-lede text-muted-foreground">{RESUME_BASICS.title}</p>
      <p className="text-sm text-muted-foreground">
        {RESUME_BASICS.location},{" "}
        <TextLink href={RESUME_BASICS.linkedin}>linkedin.com/in/lucasarango</TextLink>,{" "}
        <TextLink href={RESUME_BASICS.github}>github.com/aranlucas</TextLink>
      </p>
      <div className="mt-6 print:hidden">
        <PrintButton />
      </div>
    </header>
  );
}

function Skills() {
  return (
    <section aria-labelledby="skills">
      <SectionHeading id="skills">Skills</SectionHeading>
      <dl className="flex flex-col gap-3 text-sm/relaxed">
        <div>
          <dt className="font-semibold">Technologies</dt>
          <dd>{RESUME_SKILLS.technologies}</dd>
        </div>
        <div>
          <dt className="font-semibold">Languages</dt>
          <dd>{RESUME_SKILLS.languages}</dd>
        </div>
      </dl>
    </section>
  );
}

function Education() {
  return (
    <section aria-labelledby="education">
      <SectionHeading id="education">Education</SectionHeading>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-semibold">{RESUME_EDUCATION.school}</h3>
        <Badge variant="secondary" className="tabular-nums">
          {RESUME_EDUCATION.dates}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {RESUME_EDUCATION.degree}, {RESUME_EDUCATION.location}. {RESUME_EDUCATION.details}
      </p>
    </section>
  );
}
