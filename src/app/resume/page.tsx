import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { TextLink } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RESUME_BASICS,
  RESUME_EDUCATION,
  RESUME_PROJECTS,
  RESUME_ROLES,
  RESUME_SKILLS,
  type ResumeRole,
} from "@/lib/resume";
import { FEED_ALTERNATE, SITE_OPEN_GRAPH } from "@/lib/site";

import { PrintButton } from "./print-button";

export const metadata = {
  title: "Resume",
  description:
    "Lucas Arango’s experience at DoorDash, AWS, and Amazon: AI products, agent platforms, cloud services, and production reliability.",
  alternates: { canonical: "/resume", types: FEED_ALTERNATE },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/resume" },
};

export default function ResumePage() {
  return (
    <PageTransition>
      <article data-resume="" aria-label="Résumé">
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
          <Link
            href="/#projects"
            className="mt-4 inline-block text-sm text-primary underline underline-offset-3 print:hidden"
          >
            Explore selected projects and source code
          </Link>
        </section>

        <Skills />
        <Education />
      </article>
    </PageTransition>
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
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>{RESUME_BASICS.location}</span>
        <TextLink href={RESUME_BASICS.linkedin}>linkedin.com/in/lucasarango</TextLink>
        <TextLink href={RESUME_BASICS.github}>github.com/aranlucas</TextLink>
      </div>
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
          <dt className="font-semibold">AI & agents</dt>
          <dd>{RESUME_SKILLS.agents}</dd>
        </div>
        <div>
          <dt className="font-semibold">Platforms & infrastructure</dt>
          <dd>{RESUME_SKILLS.platforms}</dd>
        </div>
        <div>
          <dt className="font-semibold">Web & mobile</dt>
          <dd>{RESUME_SKILLS.web}</dd>
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
