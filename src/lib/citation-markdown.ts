import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { citationUrl } from "@/lib/citations";

type Node = {
  type: string;
  url?: string;
  children?: Node[];
  position?: { start: { offset?: number }; end: { offset?: number } };
};

type Edit = { start: number; end: number; replacement: string };

/** Keep Markdown formatting when copying, but remove destinations outside the source catalog. */
export function safeCitationMarkdown(markdown: string, postSources: readonly string[]) {
  const root: Node = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const edits: Edit[] = [];

  function visit(node: Node) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;

    if (
      (node.type === "link" || node.type === "definition" || node.type === "image") &&
      citationUrl(node.url, postSources) === undefined &&
      start !== undefined &&
      end !== undefined
    ) {
      const first = node.children?.[0]?.position?.start.offset;
      const last = node.children?.at(-1)?.position?.end.offset;
      const label = first === undefined || last === undefined ? "" : markdown.slice(first, last);
      edits.push({
        start,
        end,
        replacement: label === node.url ? "[Unverified link]" : label,
      });

      return;
    }

    for (const child of node.children ?? []) {
      visit(child);
    }
  }

  visit(root);

  return edits
    .toReversed()
    .reduce(
      (text, { start, end, replacement }) =>
        `${text.slice(0, start)}${replacement}${text.slice(end)}`,
      markdown,
    );
}
