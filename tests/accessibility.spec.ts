import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const view of ["month", "safety-net", "goal", "mix", "downturn", "plan"]) {
  test(`accessible ${view} screen`, async ({ page }) => {
    await page.goto(`/?view=${view}`, { waitUntil: "networkidle" });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
test("accessible expanded comparisons and holdings", async ({ page }) => {
  await page.goto("/?view=mix", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Explore other options" }).click();
  await page
    .getByRole("button", { name: "Compare Savings account", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare Index fund", exact: true })
    .click();
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: /Your plan/ }).click();
  await page
    .getByRole("button", { name: "Explore a month", exact: true })
    .click();
  await page.getByRole("button", { name: "Simulate next month" }).click();
  await page.getByRole("button", { name: "Try a market decline" }).click();
  await page.getByRole("button", { name: "See simulated holdings" }).click();
  result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("accessible mobile help and reset confirmation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "A little help" }).click();
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
