import type { ExportablePlan } from "./exportPlan";

export const defaultPlan: ExportablePlan = {
  income: 8000,
  essentials: 4000,
  lifestyle: 1500,
  other: 0,
  contribution: 2000,
  buffer: 40,
  saved: 0,
  goal: 1000000,
  growth: 60,
};
const keys = Object.keys(defaultPlan) as (keyof ExportablePlan)[];
export function parseSavedPlan(raw: string | null): ExportablePlan | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      !value ||
      !keys.every(
        (key) =>
          typeof value[key] === "number" &&
          Number.isFinite(value[key]) &&
          value[key] >= 0 &&
          value[key] <= 100000000,
      )
    )
      return null;
    if (
      value.buffer > 100 ||
      value.growth > 100 ||
      value.goal <= 0 ||
      value.contribution <= 0 ||
      value.contribution >
        Math.max(
          0,
          value.income - value.essentials - value.lifestyle - value.other,
        )
    )
      return null;
    return Object.fromEntries(
      keys.map((key) => [key, value[key]]),
    ) as ExportablePlan;
  } catch {
    return null;
  }
}
export function readSavedPlan(): ExportablePlan | null {
  try {
    return parseSavedPlan(localStorage.getItem("someday-plan"));
  } catch {
    return null;
  }
}
export function samePlan(a: ExportablePlan, b: ExportablePlan) {
  return keys.every((key) => a[key] === b[key]);
}
