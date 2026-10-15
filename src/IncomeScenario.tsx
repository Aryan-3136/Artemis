import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { money, yearsToGoal } from "./finance";

type Props = { monthly: number; rate: number; goal: number };
export function IncomeScenario({ monthly, rate, goal }: Props) {
  const [increase, setIncrease] = useState(10);
  const base = yearsToGoal(monthly, rate, goal);
  const stepped = yearsToGoal(monthly, rate, goal, increase / 100);
  const format = (value: number | null) =>
    monthly <= 0
      ? "Not funded"
      : value === null
        ? "100+ years"
        : `${Math.ceil(value)} years`;
  const monthsSaved =
    base !== null && stepped !== null ? Math.round((base - stepped) * 12) : 0;
  return (
    <section className="card detail-card income-scenario">
      <span className="small-eyebrow">THE PART YOU CAN CONTROL</span>
      <h2>A little more, over time.</h2>
      <p>
        What if you increase your monthly investment as your income grows?
        Explore a possibility without changing your current budget.
      </p>
      <label className="stepup-label" htmlFor="annual-increase">
        Increase my contribution each year<strong>{increase}%</strong>
      </label>
      <input
        id="annual-increase"
        type="range"
        min="0"
        max="20"
        step="1"
        value={increase}
        onChange={(e) => setIncrease(+e.target.value)}
      />
      <div className="range-labels">
        <span>Keep it the same</span>
        <span>20% more each year</span>
      </div>
      <div className="comparison">
        <span>
          Same amount each month<small>{money(monthly)} / month</small>
        </span>
        <strong>{format(base)}</strong>
      </div>
      <div className="comparison stepup-result" aria-live="polite">
        <span>
          With a {increase}% annual increase
          <small>
            {money(monthly * (1 + increase / 100))} / month in year 2
          </small>
        </span>
        <strong>{format(stepped)}</strong>
      </div>
      {monthsSaved > 0 && (
        <div className="time-saved" role="status">
          <TrendingUp size={17} />
          <span>
            About{" "}
            <strong>
              {monthsSaved >= 12
                ? `${Math.floor(monthsSaved / 12)} years${monthsSaved % 12 ? `, ${monthsSaved % 12} months` : ""}`
                : `${monthsSaved} months`}
            </strong>{" "}
            sooner under these assumptions.
          </span>
        </div>
      )}
      <p className="quiet-note">
        Both scenarios use a {Math.round(rate * 1000) / 10}% annual return
        assumption. Increases happen after every 12 contributions. This
        comparison changes only long-term contributions; it does not change your
        saved plan or the chart below. Increase only when your future budget
        allows. Returns, tax, fees and affordability can change the result.
      </p>
      {monthly <= 0 && (
        <p className="warning">
          Allocate some money to long-term investing in Your safety net to
          explore this comparison.
        </p>
      )}
    </section>
  );
}
