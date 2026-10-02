import { cn } from "cn";

/** A receipt section: a bitmap heading, with an optional tally or link printed flush right. */
export function SectionHeading({
  className,
  aside,
  children,
  ...props
}: React.ComponentProps<"h2"> & { aside?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <h2 className={cn(className)} {...props}>
        {children}
      </h2>
      {aside}
    </div>
  );
}
