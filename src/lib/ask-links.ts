// Which internal links in an Ask answer are real. The agent learns post URLs
// only from its tools, so the pages it may link are the site's sections plus
// any `url` a tool returned earlier in the conversation. Anything else is a
// path the model made up.

import { isToolUIPart, type UIMessage } from "ai";

const SECTIONS = new Map([
  ["/", "About"],
  ["/blog", "Writing"],
  ["/resume", "Résumé"],
]);

type Link = [url: string, title: string];

function linksIn(value: unknown): Link[] {
  if (Array.isArray(value)) return value.flatMap((item) => linksIn(item));
  if (typeof value !== "object" || value === null || !("url" in value)) return [];
  const { url } = value;
  if (typeof url !== "string") return [];
  return [[url, "title" in value && typeof value.title === "string" ? value.title : url]];
}

/** Pages the conversation may link to, each with its title. */
export function knownLinks(messages: readonly UIMessage[]): ReadonlyMap<string, string> {
  const links = new Map(SECTIONS);
  for (const message of messages) {
    for (const part of message.parts) {
      if (isToolUIPart(part) && part.state === "output-available") {
        for (const [url, title] of linksIn(part.output)) links.set(url, title);
      }
    }
  }
  return links;
}
