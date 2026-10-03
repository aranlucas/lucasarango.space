export { cn } from "cn";

export function formatDate(date: string, style: "long" | "short" = "long"): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  };

  if (style === "long") options.year = "numeric";

  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", options);
}
