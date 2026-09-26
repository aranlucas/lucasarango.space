import { cn } from "cn";

export function SectionHeading({ className, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("mt-14 mb-4 text-lede font-semibold", className)} {...props}>
      {children}
    </h2>
  );
}
