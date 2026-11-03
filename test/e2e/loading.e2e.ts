import { expect, test } from "@playwright/test";

test("ordinary browsers keep the initial bundle small and can still open Ask", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "modelContext", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const scriptBytes = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter(
        (entry): entry is PerformanceResourceTiming => entry instanceof PerformanceResourceTiming,
      )
      .filter((entry) => entry.initiatorType === "script")
      .reduce((sum, entry) => sum + entry.encodedBodySize, 0),
  );

  // Compressed production JS, including prefetched routes; baseline was 204 KB.
  expect(scriptBytes).toBeGreaterThan(0);
  expect(scriptBytes).toBeLessThan(185_000);
  const font = await page.locator("body").evaluate((body) => getComputedStyle(body).fontFamily);
  await page.getByRole("button", { name: "Ask about my work", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("textbox")).toBeVisible();
  expect(await page.locator("body").evaluate((body) => getComputedStyle(body).fontFamily)).toBe(
    font,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "Ask about my work", exact: true })).toBeFocused();
});

test("the compact writing index still finds words in article bodies", async ({ page }) => {
  await page.goto("/blog");
  await page.getByRole("searchbox", { name: "Search writing" }).fill("Kroger");
  await expect(page.getByRole("heading", { name: "Search results" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Search results" }).getByRole("link").first(),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("zzzznonexistentkeyword");
  await expect(page.getByText(/No posts matched/u)).toBeVisible();
  await page.getByRole("button", { name: "browse all writing" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
});

test.describe("static articles", () => {
  test.use({ javaScriptEnabled: false });

  test("article text is readable before JavaScript runs", async ({ page }) => {
    await page.goto("/blog/practicing-system-design-with-an-ai-on-the-whiteboard");
    await expect(page.getByRole("heading", { name: "How I practiced with it" })).toBeVisible();
    await expect(page.getByText("Loading post…")).toHaveCount(0);
    const screenshot = page.getByRole("img", { name: /System Design Companion entry screen/u });
    await expect(screenshot).toHaveAttribute("width", "1280");
    await expect(screenshot).toHaveAttribute("height", "720");
    await expect(screenshot).toHaveAttribute("loading", "lazy");
  });
});

test("unknown articles still return a useful 404", async ({ page }) => {
  const response = await page.goto("/blog/this-post-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Nothing at this address" })).toBeVisible();
});

test("lazy chat styles include the theme values needed to render an answer", async ({ page }) => {
  const chunks = [
    { type: "start", messageId: "style-check" },
    { type: "text-start", id: "answer" },
    { type: "text-delta", id: "answer", delta: "# Rendered answer\n\nA **bold** answer." },
    { type: "text-end", id: "answer" },
    { type: "finish" },
  ];

  await page.route("**/api/chat", (route) =>
    route.fulfill({
      headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
      body: `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`,
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Ask about my work", exact: true }).click();
  await page.getByRole("textbox", { name: "Your question" }).fill("Show an answer");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  const heading = page.getByRole("heading", { name: "Rendered answer" });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("font-size", "30px");
  await expect(heading).toHaveCSS("font-weight", "600");
});
