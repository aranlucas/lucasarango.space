/** Prefer negotiated Markdown; convert HTML for pages such as the résumé. */
export async function readPageMarkdown(path: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(path, { signal, headers: { Accept: "text/markdown" } });

  if (!response.ok) {
    throw new Error(`Could not read ${path} (HTTP ${response.status}). Retry later.`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();

  if (contentType === "text/markdown") return response.text();

  const page = new DOMParser().parseFromString(await response.text(), "text/html");
  const article = page.querySelector<HTMLElement>("article.reading-article, article[data-resume]");

  if (!article) throw new Error(`The article is unavailable at ${path}. Retry later.`);

  // Exclude navigation, interactive controls, and framework data from agent content.
  for (const node of article.querySelectorAll("nav, button, script, style, svg, .rule-double")) {
    node.remove();
  }

  // CSS gaps don't exist in parsed HTML; keep adjacent résumé header fields readable.
  for (const field of article.querySelectorAll("header h1 > span, header .flex > *")) {
    field.after(page.createTextNode(" "));
  }

  const source = new URL(path, window.location.origin);

  for (const link of article.querySelectorAll("a[href]")) {
    link.setAttribute("href", new URL(link.getAttribute("href") ?? "", source).href);
  }

  for (const image of article.querySelectorAll("img[src]")) {
    image.setAttribute("src", new URL(image.getAttribute("src") ?? "", source).href);
  }

  const [{ default: TurndownService }, { gfm }] = await Promise.all([
    import("turndown"),
    import("turndown-plugin-gfm"),
  ]);

  const converter = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  converter.use(gfm);

  return `Source: ${source.href}\n\n${converter.turndown(article)}`;
}
