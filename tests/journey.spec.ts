import { test, expect } from "@playwright/test";

test("budget to saved plan, including goal exploration and downturn choices", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("#income").fill("9000");
  await expect(page.locator(".budget-total")).toContainText("₹3,500");
  await page.getByRole("button", { name: "Find my starting point" }).click();
  await page.getByRole("button", { name: "Set my goal" }).click();
  await expect(
    page.getByRole("heading", { name: "Watch small steps add up." }),
  ).toBeVisible();
  await page.locator("#chart-year").fill("10");
  const nominal = await page.locator(".chart-readout").textContent();
  await page.getByRole("button", { name: "Today’s buying power" }).click();
  await expect(
    page.getByRole("button", { name: "Today’s buying power" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator(".chart-readout").textContent()).not.toEqual(
    nominal,
  );
  await page.getByRole("button", { name: "Explore my options" }).click();
  await page.getByRole("button", { name: "Explore other options" }).click();
  await expect(
    page.getByRole("heading", { name: "Bonds", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Try a difficult year", exact: true })
    .click();
  await page.getByRole("button", { name: "Pause for 6 months" }).click();
  await expect(
    page.getByRole("button", { name: "Pause for 6 months" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "See my plan" }).click();
  await page.getByRole("button", { name: "Save my plan", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Plan saved on this device" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "This still feels comfortable" })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /Your month/ }).click();
  await expect(page.locator("#income")).toHaveValue("9000");
  await page.getByRole("button", { name: /Your plan/ }).click();
  await expect(page.locator(".checkin-status")).toContainText("Last checked");
  expect(errors).toEqual([]);
});

test("simulation tracks contributions, exposes a decline, and resets independently", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Your plan/ }).click();
  await page.getByRole("button", { name: "Save my plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Explore a month", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Try a market decline" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Simulate next month" }).click();
  await expect(page.locator(".portfolio-value")).toHaveText("₹2,000");
  await page.getByRole("button", { name: "Try a market decline" }).click();
  await expect(page.locator(".monthly-story")).toContainText(
    "reduced the value by ₹214",
  );
  await expect(page.locator(".portfolio-value")).toHaveText("₹3,786");
  await page.getByRole("button", { name: "See simulated holdings" }).click();
  await expect(
    page.locator(".simulated-holdings .allocation-item").first(),
  ).toContainText("₹1,600");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".portfolio-value")).toHaveText("₹0");
  await expect(
    page.getByRole("button", { name: "Plan saved on this device" }),
  ).toBeVisible();
  await expect(page.locator(".simulation-banner")).toContainText("Month 0");
});

test("mobile navigation and simulation remain within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const destination of [/Your someday/, /Your plan/]) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name: destination }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "Explore a month", exact: true })
    .click();
  await page.getByRole("button", { name: "Simulate next month" }).click();
  await page.getByRole("button", { name: "See simulated holdings" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".portfolio-value")).toHaveText("₹2,000");
});

test("unaffordable and unfunded plans explain the next step", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#income").fill("100");
  await expect(
    page.getByRole("button", { name: "Find my starting point" }),
  ).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText("expenses are higher");
  await page.locator("#income").fill("8000");
  await page.getByRole("button", { name: /Your safety net/ }).click();
  await page.locator("#buffer").fill("100");
  await page.getByRole("button", { name: /Your someday/ }).click();
  await expect(
    page.getByText("No money is currently allocated to investing.", {
      exact: false,
    }),
  ).toBeVisible();
});

test("budget presets and exact input update the live breakdown within the available amount", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "₹1,000", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Exact monthly amount to set aside" }),
  ).toHaveValue("1000");
  await expect(page.locator(".budget-breakdown .budget-insight")).toContainText(
    "₹1,500 left",
  );
  await page
    .getByRole("spinbutton", { name: "Exact monthly amount to set aside" })
    .fill("1234");
  await expect(page.locator(".budget-breakdown .budget-insight")).toContainText(
    "₹1,234 a month",
  );
  await expect(page.locator(".breathing")).toContainText("₹1,266");
  await page
    .getByRole("spinbutton", { name: "Exact monthly amount to set aside" })
    .fill("99999");
  await expect(
    page.getByRole("spinbutton", { name: "Exact monthly amount to set aside" }),
  ).toHaveValue("2500");
  await page.locator("#essentials").fill("6000");
  await expect(
    page.getByRole("spinbutton", { name: "Exact monthly amount to set aside" }),
  ).toHaveValue("500");
  await expect(
    page.getByRole("button", { name: "₹1,000", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".budget-breakdown .budget-donut")).toHaveAttribute(
    "aria-label",
    /Your future: ₹500/,
  );
});

test("help contains keyboard focus and returns it to its trigger", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "A little help" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close help", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Start fresh", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close help", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("mobile menu supports escape and dismissing the backdrop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole("button", { name: "Close navigation backdrop" })
    .click({ position: { x: 370, y: 400 } });
  await expect(page.getByRole("navigation")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("annual contribution increases update the comparison without changing the current plan", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Your someday/ }).click();
  const results = page.locator(".income-scenario .comparison strong");
  expect(await results.nth(0).textContent()).not.toEqual(
    await results.nth(1).textContent(),
  );
  await page.locator("#annual-increase").fill("0");
  expect(await results.nth(0).textContent()).toEqual(
    await results.nth(1).textContent(),
  );
  await page.locator("#annual-increase").fill("20");
  await expect(page.locator(".stepup-result")).toContainText(
    "₹1,440 / month in year 2",
  );
  await page.getByRole("button", { name: /Your plan/ }).click();
  await expect(page.locator(".plan-statement")).toContainText("₹2,000");
  await expect(page.locator(".plan-statement")).toContainText("₹1,200");
});

test("plan exports locally and the print layout includes the plan without simulation controls", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Your plan/ }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download summary" }).click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe("my-someday-plan.txt");
  const { readFile } = await import("node:fs/promises");
  const path = await file.path();
  const content = await readFile(path!, "utf8");
  expect(content).toContain("Monthly contribution: ₹2,000");
  expect(content).toContain("Emergency safety net: ₹800");
  expect(content).toContain("Growth-oriented investment: ₹720");
  expect(content).toContain("Goal: ₹10,00,000");
  expect(content).toContain("not part of this exported plan");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".plan-statement")).toBeVisible();
  await expect(page.locator(".plan-allocation")).toBeVisible();
  await expect(page.locator(".print-note")).toBeVisible();
  await expect(page.locator(".print-note")).toContainText(
    "Returns and goal dates are not guaranteed",
  );
  await expect(page.locator(".portfolio-section")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Download summary" }),
  ).toBeHidden();
});

test("options can be filtered and compared without changing the allocation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Your money mix/ }).click();
  const original = await page.locator("#growth").inputValue();
  await page.getByRole("button", { name: "Explore other options" }).click();
  await page
    .getByRole("button", { name: "Compare Savings account", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare Index fund", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Compare Fixed deposit", exact: true }),
  ).toBeDisabled();
  const comparison = page.locator(".option-comparison");
  await expect(
    comparison.getByRole("columnheader", {
      name: "Savings account",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    comparison.getByRole("columnheader", { name: "Index fund", exact: true }),
  ).toBeVisible();
  await expect(
    comparison.getByRole("row", { name: /Fees and costs/ }),
  ).toContainText("expense ratio");
  await page
    .getByRole("button", { name: "Near-term needs", exact: true })
    .click();
  await expect(page.locator(".option-card")).toHaveCount(2);
  await expect(
    comparison.getByRole("columnheader", { name: "Index fund", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Index fund selection", exact: true })
    .click();
  await expect(comparison).toBeHidden();
  await page
    .getByRole("button", { name: "Compare Fixed deposit", exact: true })
    .click();
  await expect(
    comparison.getByRole("columnheader", {
      name: "Fixed deposit",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear comparison", exact: true })
    .click();
  await expect(comparison).toBeHidden();
  const savings = page.locator(".option-card").filter({
    has: page.getByRole("heading", { name: "Savings account", exact: true }),
  });
  await savings.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(
    savings.getByRole("heading", { name: "Look a little closer" }),
  ).toBeVisible();
  await expect(page.locator("#growth")).toHaveValue(original);
});

test("mobile option comparison scrolls within its own container", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: /Your money mix/ }).click();
  await page.getByRole("button", { name: "Explore other options" }).click();
  await page
    .getByRole("button", { name: "Longer-term goals", exact: true })
    .click();
  await expect(page.locator(".option-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Compare Bonds", exact: true })
    .click();
  await page.getByRole("button", { name: "Compare Gold", exact: true }).click();
  await page.getByRole("link", { name: "View comparison" }).click();
  const scrollArea = page.getByRole("region", {
    name: "Scroll to compare investment options",
  });
  await expect(scrollArea).toBeVisible();
  expect(
    await scrollArea.evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("returning users can review and restore a saved plan without overwriting it", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#income").fill("9000");
  await page.getByRole("button", { name: /Your plan/ }).click();
  await page.getByRole("button", { name: "Save my plan", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /Your month/ }).click();
  await expect(page.locator(".plan-state")).toHaveText("Saved on this device");
  await expect(page.getByRole("region", { name: "Saved plan" })).toBeVisible();
  await page.locator("#income").fill("10000");
  await expect(page.locator(".plan-state")).toHaveText("Unsaved changes");
  await page
    .getByRole("button", { name: "Restore saved plan", exact: true })
    .click();
  await expect(page.locator("#income")).toHaveValue("9000");
  await expect(page.locator(".plan-state")).toHaveText("Saved on this device");
  await page
    .getByRole("button", { name: "Review my plan", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Plan saved on this device" }),
  ).toBeVisible();
});

test("reset can be cancelled and confirmed using the in-app dialog", async ({
  page,
}) => {
  let nativeDialogs = 0;
  page.on("dialog", async (dialog) => {
    nativeDialogs++;
    await dialog.dismiss();
  });
  await page.goto("/");
  await page.locator("#income").fill("9000");
  await page.getByRole("button", { name: /Your plan/ }).click();
  await page.getByRole("button", { name: "Save my plan", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "A little help" }).click();
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Keep my plan", exact: true }),
  ).toBeFocused();
  const dialogBox = await page.getByRole("dialog").boundingBox();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(390);

  await page.getByRole("button", { name: "Keep my plan", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start fresh", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start fresh", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("someday-plan")!).income,
    ),
  ).toBe(9000);
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset my plan", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("#income")).toHaveValue("8000");
  await expect(page.locator(".plan-state")).toHaveText("Draft plan");
  expect(
    await page.evaluate(() => localStorage.getItem("someday-plan")),
  ).toBeNull();
  expect(nativeDialogs).toBe(0);
});

test("blocked browser storage reports an inline error and leaves the plan usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Your plan/ }).click();
  await page.getByRole("button", { name: "Save my plan", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "couldn’t save your plan",
  );
  await expect(page.locator(".plan-statement")).toContainText("₹2,000");
  await expect(
    page.getByRole("button", { name: "Download summary" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Dismiss storage message" }).click();
  await expect(page.getByRole("alert")).toBeHidden();
});

test("deep links, refresh and browser history keep the correct screen", async ({
  page,
}) => {
  await page.goto("/?view=goal");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Give your future",
  );
  await page.getByRole("button", { name: /Your money mix/ }).click();
  await expect(page).toHaveURL(/view=mix/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Give your future",
  );
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every rupee",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every rupee",
  );
});

test("blank budgets have a useful path and safety-net focus is explicit", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start blank", exact: true }).click();
  await expect(page.locator("#income")).toHaveValue("0");
  await expect(
    page.getByRole("heading", { name: "There’s no rush to invest." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore the example", exact: true })
    .click();
  await expect(page.locator("#income")).toHaveValue("8000");
  await page.getByRole("button", { name: "Find my starting point" }).click();
  await page.getByRole("button", { name: "Focus on my safety net" }).click();
  await expect(page.locator("#buffer")).toHaveValue("100");
  await page.locator("#saved").fill("12000");
  await expect(
    page.getByText("Your starting buffer is covered.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("progressbar", {
      name: "Existing emergency savings toward starting buffer",
    }),
  ).toHaveAttribute("value", "100");
});

for (const width of [320, 768, 1440]) {
  test(`all six screens fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const view of [
      "month",
      "safety-net",
      "goal",
      "mix",
      "downturn",
      "plan",
    ]) {
      await page.goto(`/?view=${view}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Horizontal overflow on ${view}`,
      ).toBe(true);
    }
  });
}
