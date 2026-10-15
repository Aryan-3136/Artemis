import { money, yearsToGoal } from "./finance";
export type ExportablePlan = {
  income: number;
  essentials: number;
  lifestyle: number;
  other: number;
  contribution: number;
  buffer: number;
  saved: number;
  goal: number;
  growth: number;
};
export function planSummary(plan: ExportablePlan): string {
  const safety = (plan.contribution * plan.buffer) / 100;
  const investment = plan.contribution - safety;
  const growth = (investment * plan.growth) / 100;
  const rate = 0.04 * (1 - plan.growth / 100) + (0.09 * plan.growth) / 100;
  const timeline = (r: number) => {
    const years = yearsToGoal(investment, r, plan.goal);
    return investment <= 0
      ? "Not funded"
      : years === null
        ? "More than 100 years"
        : `${Math.ceil(years)} years`;
  };
  return [
    "SOMEDAY — MY MONEY PLAN",
    "Educational planning · No real money invested",
    "",
    "MY MONTH",
    `Income: ${money(plan.income)}`,
    `Essentials: ${money(plan.essentials)}`,
    `Personal spending: ${money(plan.lifestyle)}`,
    `Other expenses and repayments: ${money(plan.other)}`,
    `Monthly contribution: ${money(plan.contribution)}`,
    `Breathing room: ${money(Math.max(0, plan.income - plan.essentials - plan.lifestyle - plan.other - plan.contribution))}`,
    "",
    "MONTHLY ALLOCATION",
    `Emergency safety net: ${money(safety)}`,
    `Growth-oriented investment: ${money(growth)}`,
    `More predictable investment: ${money(investment - growth)}`,
    `Existing emergency savings entered: ${money(plan.saved)}`,
    `Starting emergency buffer target: ${money(plan.essentials * 3)}`,
    "",
    "MY LONG-TERM GOAL",
    `Goal: ${money(plan.goal)} in future rupees`,
    `Illustrative timeline at ${(rate * 100).toFixed(1)}% annual return: ${timeline(rate)}`,
    `Illustrative timeline at 3% annual return: ${timeline(0.03)}`,
    "",
    "WHAT I UNDERSTAND",
    "Growth investments can fall in value. My emergency savings are separate from my long-term goal.",
    "The projections use monthly compounding and month-end contributions, with a fixed allocation throughout. They exclude taxes and fees and do not guarantee a return or arrival date.",
    "Inflation reduces future buying power. Actual product terms, risks, lock-in and charges must be checked before investing.",
    "The annual-increase comparison and portfolio practice simulation are separate explorations and are not part of this exported plan.",
    "Once the emergency buffer is funded, I can revisit where future contributions go.",
    "",
    "MY NEXT CHECK-IN",
    "Is this contribution still comfortable? Have my income, expenses or priorities changed?",
    "",
    "Created locally in Someday. This file contains the current on-screen plan, including any unsaved edits. It is not a financial account statement or personalized investment recommendation.",
  ].join("\n");
}
export function downloadPlan(plan: ExportablePlan) {
  const url = URL.createObjectURL(
    new Blob([planSummary(plan)], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-someday-plan.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
