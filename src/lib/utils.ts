import { ChatbotError, errorResponseSchema } from "@/lib/errors";

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

/**
 * fetch for the chat transport: a failed request throws the route's
 * ChatbotError, so useChat's error carries the reader-facing message.
 */
export async function fetchWithErrorHandlers(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  if (response.ok) return response;

  const body = errorResponseSchema.safeParse(await response.json().catch(() => null));

  // Anything other than the route's own error, such as a platform timeout, reads as offline.
  throw body.success
    ? new ChatbotError(body.data.code, body.data.message)
    : new ChatbotError("offline:chat");
}
