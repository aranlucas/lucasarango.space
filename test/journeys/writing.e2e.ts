import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("a reader searches, reads an article, and recovers from an empty search", async ({
  app,
  screen,
  browser,
}) => {
  await app.open("/blog");
  const search = screen.getByLabel("Search writing");
  await search.fill("adventure");
  await expect(screen.getByRole("heading", "Search results")).toBeVisible();
  const article = browser.locator('a[href="/blog/a-website-for-every-adventure"]');
  await expect(article).toContainText("A website for every adventure");
  await article.tap();
  await expect(browser).toHaveURL("/blog/a-website-for-every-adventure");
  await expect(screen.getByRole("heading", "A website for every adventure")).toBeVisible();
  await expect(browser.locator("main")).toContainText("I now make a website for every adventure");
  await screen.getByRole("link", { name: "Writing", exact: true }).tap();
  await expect(browser).toHaveURL("/blog");
  await search.fill("zzzxqnomatch");
  await expect(screen.getByText("No posts matched", { exact: false })).toBeVisible();
  await screen.getByRole("button", "browse all writing").tap();
  await expect(search).toHaveValue("");
  await expect(article).toBeVisible();
});
