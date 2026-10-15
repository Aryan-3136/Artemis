import { test } from "node:test";
import assert from "node:assert/strict";
import { project, yearsToGoal } from "./finance.ts";
test("zero-return projection preserves contributions and savings", () =>
  assert.equal(project(2000, 0, 3, 1000), 73000));
test("monthly compounding uses month-end contributions", () =>
  assert.ok(Math.abs(project(100, 0.12, 2 / 12, 1000) - 1221.1) < 0.0001));
test("unfunded goal has no timeline", () =>
  assert.equal(yearsToGoal(0, 0.09, 1000000), null));
test("zero-return timeline follows contributions", () =>
  assert.equal(yearsToGoal(1000, 0, 12000), 1));
test("larger contributions shorten timeline", () =>
  assert.ok(
    yearsToGoal(2000, 0.07, 1000000) < yearsToGoal(1000, 0.07, 1000000),
  ));

test("portfolio adds new contributions at month-end without applying the shock to them", async () => {
  const { advancePortfolio, emptyPortfolio } = await import("./finance.ts");
  const allocation = { safety: 800, growth: 720, predictable: 480 };
  const first = advancePortfolio(emptyPortfolio, allocation, true);
  assert.equal(first.safety + first.growth + first.predictable, 2000);
  assert.equal(first.lastChange, 0);
  const second = advancePortfolio(first, allocation, true);
  assert.equal(second.safety, 1600);
  assert.ok(Math.abs(second.growth - 1224) < 0.000001);
  assert.ok(Math.abs(second.predictable - 961.6) < 0.000001);
  assert.equal(second.contributed, 4000);
});
test("portfolio totals reconcile with contributions and monthly movements", async () => {
  const { advancePortfolio, emptyPortfolio } = await import("./finance.ts");
  const allocation = { safety: 100, growth: 700, predictable: 200 };
  let portfolio = emptyPortfolio;
  let movement = 0;
  for (let i = 0; i < 36; i++) {
    portfolio = advancePortfolio(portfolio, allocation, i === 12);
    movement += portfolio.lastChange;
  }
  assert.equal(portfolio.month, 36);
  assert.equal(portfolio.contributed, 36000);
  assert.ok(
    Math.abs(
      portfolio.safety +
        portfolio.growth +
        portfolio.predictable -
        portfolio.contributed -
        movement,
    ) < 0.000001,
  );
});
test("a portfolio with no growth holdings is unaffected by the equity shock", async () => {
  const { advancePortfolio, emptyPortfolio } = await import("./finance.ts");
  const allocation = { safety: 500, growth: 0, predictable: 500 };
  const initial = advancePortfolio(emptyPortfolio, allocation);
  const ordinary = advancePortfolio(initial, allocation);
  const shocked = advancePortfolio(initial, allocation, true);
  assert.equal(ordinary.safety, shocked.safety);
  assert.equal(ordinary.growth, shocked.growth);
  assert.equal(ordinary.predictable, shocked.predictable);
});

test("zero annual contribution increase preserves the original goal timeline", () => {
  assert.equal(
    yearsToGoal(1500, 0.07, 1000000, 0),
    yearsToGoal(1500, 0.07, 1000000),
  );
});
test("annual increase starts after twelve contributions and shortens the timeline", () => {
  assert.equal(yearsToGoal(1000, 0, 12000, 1), 1);
  assert.equal(yearsToGoal(1000, 0, 14000, 1), 13 / 12);
  assert.ok(
    yearsToGoal(1500, 0.07, 1000000, 0.1) < yearsToGoal(1500, 0.07, 1000000),
  );
  assert.equal(yearsToGoal(0, 0.07, 1000000, 0.1), null);
});

test("saved plans round-trip with only known numeric budget fields", async () => {
  const { defaultPlan, parseSavedPlan, samePlan } =
    await import("./planStorage.ts");
  const parsed = parseSavedPlan(
    JSON.stringify({ ...defaultPlan, unexpected: "ignored" }),
  );
  assert.deepEqual(parsed, defaultPlan);
  assert.equal(samePlan(parsed, defaultPlan), true);
  assert.equal(samePlan({ ...defaultPlan, income: 9000 }, defaultPlan), false);
});
test("unusable saved plans are rejected instead of breaking the interface", async () => {
  const { defaultPlan, parseSavedPlan } = await import("./planStorage.ts");
  for (const raw of [
    null,
    "bad json",
    "null",
    "[]",
    JSON.stringify({ ...defaultPlan, growth: 101 }),
    JSON.stringify({ ...defaultPlan, contribution: 9000 }),
    JSON.stringify({ ...defaultPlan, income: -1 }),
    JSON.stringify({ ...defaultPlan, goal: 0 }),
    JSON.stringify({ ...defaultPlan, essentials: "4000" }),
  ])
    assert.equal(parseSavedPlan(raw), null);
});

test("remaining timeline accounts for the current balance and a market loss", () => {
  assert.equal(yearsToGoal(1000, 0, 12000, 0, 6000), 0.5);
  assert.equal(yearsToGoal(0, 0.07, 12000, 0, 12000), 0);
  assert.ok(
    yearsToGoal(1200, 0.07, 1000000, 0, 30000) >
      yearsToGoal(1200, 0.07, 1000000, 0, 50000),
  );
});
test("view URLs preserve unrelated parameters and discard stale anchor links", async () => {
  const { stepFromSearch, stepUrl } = await import("./navigation.ts");
  assert.equal(stepFromSearch("?view=goal"), 2);
  assert.equal(stepFromSearch("?view=unknown"), 0);
  assert.equal(
    stepUrl(5, "https://example.test/?theme=light#option-comparison"),
    "/?theme=light&view=plan",
  );
});
