import { AskAbout } from "@/components/ask/ask-about";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ResumeRole } from "@/lib/resume";

export function Role({ role }: { role: ResumeRole }) {
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
      <div className="mt-3">
        <AskAbout
          question={`What did Lucas work on at ${role.company}, and what was the impact?`}
        />
      </div>
      <Separator className="mt-8 print:hidden" />
    </li>
  );
}

export function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 ps-5 text-base/relaxed marker:text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
