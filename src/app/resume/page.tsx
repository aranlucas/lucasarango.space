import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { PageTransition } from "@/components/page-transition";
import { SectionHeading } from "@/components/section-heading";
import { TextLink } from "@/components/site-header";
import { formatMonth, getResume, LOOKING_FOR, type Resume, type ResumeProject } from "@/lib/resume";
import { markdownAlternate, SITE_OPEN_GRAPH } from "@/lib/site";

import { PrintButton } from "./print-button";
import { Bullets, Role } from "./role";

export const metadata = {
  title: "Resume",
  description:
    "Lucas Arango’s experience at DoorDash, AWS, and Amazon: AI products, agent platforms, cloud services, and production reliability.",
  alternates: { canonical: "/resume", types: markdownAlternate("/resume.md") },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/resume" },
};

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <PageTransition>
      <article className="resume-article" data-resume="" aria-label="Résumé">
        <ResumeHeader resume={resume} />

        <section aria-labelledby="summary">
          <SectionHeading id="summary">Summary</SectionHeading>
          <p className="mb-4 text-pretty">{resume.summary}</p>
          <p className="border-y border-dashed border-foreground py-3 text-sm/relaxed text-muted-foreground">
            {LOOKING_FOR}
          </p>
        </section>

        <section aria-labelledby="experience">
          <SectionHeading id="experience">Experience</SectionHeading>
          <ol className="flex flex-col gap-8">
            {resume.roles.map((role) => (
              <Role key={`${role.company}-${role.dates}`} role={role} />
            ))}
          </ol>
        </section>

        <section aria-labelledby="projects">
          <SectionHeading id="projects">Personal projects</SectionHeading>
          <div className="flex flex-col gap-6">
            {resume.projects.map((project) => (
              <Project key={project.name} project={project} />
            ))}
          </div>
          <Link
            href="/#projects"
            className="mt-4 inline-block text-sm text-primary underline underline-offset-3 print:hidden"
          >
            Explore selected projects and source code
          </Link>
        </section>

        <Writing publications={resume.publications} />
        <Skills skills={resume.skills} />
        <Education education={resume.education} />
      </article>
    </PageTransition>
  );
}

function Project({ project }: { project: ResumeProject }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">
        {project.url === undefined ? (
          project.name
        ) : (
          <TextLink href={project.url}>{project.name}</TextLink>
        )}
      </h3>
      <Bullets items={project.bullets} />
    </div>
  );
}

function ResumeHeader({ resume }: { resume: Resume }) {
  return (
    <header>
      <h1 className="page-title mb-2">
        <span className="print:hidden">Résumé</span>
        <span className="hidden print:inline">{resume.name}</span>
      </h1>
      <p className="mb-4 text-center text-muted-foreground">{resume.title}</p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>{resume.location}</span>
        {resume.profiles.map((profile) => (
          <TextLink key={profile.href} href={profile.href}>
            {profile.label}
          </TextLink>
        ))}
      </div>
      <div className="mt-6 flex justify-center print:hidden">
        <PrintButton />
      </div>
    </header>
  );
}

function Writing({ publications }: { publications: Resume["publications"] }) {
  return (
    <section aria-labelledby="writing">
      <SectionHeading id="writing">Writing</SectionHeading>
      <ul className="flex flex-col gap-2 text-sm/relaxed">
        {publications.map((post) => (
          <li key={post.href}>
            <TextLink href={post.href} className="inline-flex items-center gap-1">
              {post.title}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </TextLink>
            <span className="text-muted-foreground">
              {" "}
              · {post.publisher}, {formatMonth(post.date)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Skills({ skills }: { skills: Resume["skills"] }) {
  return (
    <section aria-labelledby="skills">
      <SectionHeading id="skills">Skills</SectionHeading>
      <dl className="flex flex-col gap-3 text-sm/relaxed">
        {skills.map((skill) => (
          <div key={skill.category}>
            <dt className="font-semibold">{skill.category}</dt>
            <dd>{skill.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Education({ education }: { education: Resume["education"] }) {
  return (
    <section aria-labelledby="education">
      <SectionHeading id="education">Education</SectionHeading>
      {education.map((school) => (
        <div key={school.school}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-semibold">{school.school}</h3>
            <span className="tally">{school.dates}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {school.degree}, {school.location}
          </p>
        </div>
      ))}
    </section>
  );
}
