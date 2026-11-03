import { AskAbout } from "@/components/chat/ask-about";
import type { ResumeRole } from "@/lib/resume";

type RoleProps = { role: ResumeRole; askable: boolean };

type EarlierRolesProps = { roles: readonly ResumeRole[] };

type BulletsProps = { items: readonly string[] };

/** A role heads like a receipt line: company, a dotted leader, and its dates. */
export function Role({ role, askable }: RoleProps) {
  return (
    <li>
      <div className="role-line">
        <h3 className="line-caps font-semibold">{role.company}</h3>
        <span className="line-leader" aria-hidden="true" />
        <span className="tally">{role.dates}</span>
      </div>
      <p className="mbe-2.5 text-sm text-muted-foreground">
        {role.title}, {role.location}
      </p>
      <Bullets items={role.bullets} />
      {askable && (
        <div className="mbs-2.5">
          <AskAbout
            question={`What did Lucas work on at ${role.company}, and what was the impact?`}
          />
        </div>
      )}
    </li>
  );
}

export function Bullets({ items }: BulletsProps) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm/relaxed marker:text-muted-foreground print:text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Internships print as compact receipt lines: company and year, the title and highlight beneath. */
export function EarlierRoles({ roles }: EarlierRolesProps) {
  if (roles.length === 0) {
    return null;
  }

  return (
    <div className="mbs-8">
      <h3 className="tally mbe-2">Earlier</h3>
      <ul className="line-items">
        {roles.map((role) => (
          <li key={`${role.company}-${role.dates}`}>
            <div className="role-line">
              <span className="line-caps">{role.company}</span>
              <span className="line-leader" aria-hidden="true" />
              <span className="tally">{role.dates.slice(-4)}</span>
            </div>
            <p className="line-note">
              {role.title}. {role.bullets.join(" ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
