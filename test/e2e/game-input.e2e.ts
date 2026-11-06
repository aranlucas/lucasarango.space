import { expect, test } from "@playwright/test";

// Retain a short CI recording of the focus/release interaction for PR review.
test.use({ video: "on" });

test("a player can release movement and type in Ask", async ({ page }) => {
  await page.goto("/audit-missing-page");
  await page.getByRole("button", { name: /Switch on your headlamp/u }).click();
  await page.keyboard.down("w");
  await page.getByRole("button", { name: "Ask about my work", exact: true }).click();
  const question = page.getByLabel("Your question");

  await expect(question).toBeFocused();
  await page.keyboard.up("w");
  await question.fill("What does Lucas build?");
  await expect(question).toHaveValue("What does Lucas build?");
  await page.getByRole("button", { name: "Hide conversation", exact: true }).click();
  await expect(question).toBeHidden();
});
