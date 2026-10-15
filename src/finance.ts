export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export function project(
  monthly: number,
  annualRate: number,
  years: number,
  initial = 0,
) {
  const rate = annualRate / 12;
  let value = initial;
  for (let i = 0; i < Math.round(years * 12); i++)
    value = value * (1 + rate) + monthly;
  return value;
}
export function yearsToGoal(
  monthly: number,
  annualRate: number,
  goal: number,
  annualIncrease = 0,
  initial = 0,
) {
  if (initial >= goal) return 0;
  if (monthly <= 0) return null;
  let value = initial;
  for (let month = 1; month <= 1200; month++) {
    value =
      value * (1 + annualRate / 12) +
      monthly * Math.pow(1 + annualIncrease, Math.floor((month - 1) / 12));
    if (value >= goal) return month / 12;
  }
  return null;
}

export type SimulatedPortfolio = {
  month: number;
  safety: number;
  growth: number;
  predictable: number;
  contributed: number;
  lastChange: number;
  lastContribution: number;
  lastShock: boolean;
};
export const emptyPortfolio: SimulatedPortfolio = {
  month: 0,
  safety: 0,
  growth: 0,
  predictable: 0,
  contributed: 0,
  lastChange: 0,
  lastContribution: 0,
  lastShock: false,
};
export type MonthlyAllocation = {
  safety: number;
  growth: number;
  predictable: number;
};
const illustrativeReturns = [
  0.018, -0.012, 0.025, 0.006, -0.035, 0.014, 0.009, -0.02, 0.03, 0.004, -0.008,
  0.012,
];
export function advancePortfolio(
  previous: SimulatedPortfolio,
  allocation: MonthlyAllocation,
  shock = false,
): SimulatedPortfolio {
  const growthReturn = shock
    ? -0.3
    : illustrativeReturns[previous.month % illustrativeReturns.length];
  const growthChange = previous.growth * growthReturn;
  const predictableChange = previous.predictable * (0.04 / 12);
  const contribution =
    allocation.safety + allocation.growth + allocation.predictable;
  return {
    month: previous.month + 1,
    safety: previous.safety + allocation.safety,
    growth: previous.growth + growthChange + allocation.growth,
    predictable:
      previous.predictable + predictableChange + allocation.predictable,
    contributed: previous.contributed + contribution,
    lastChange: growthChange + predictableChange,
    lastContribution: contribution,
    lastShock: shock,
  };
}
