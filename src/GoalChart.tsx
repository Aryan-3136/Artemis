import { useState } from "react";
import { money, project, yearsToGoal } from "./finance";

type Props = { monthly: number; rate: number; goal: number };
export function GoalChart({ monthly, rate, goal }: Props) {
  const [inflation, setInflation] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const arrival = yearsToGoal(monthly, rate, goal);
  const horizon = Math.min(50, Math.max(5, Math.ceil(arrival ?? 20)));
  const year = Math.min(selectedYear ?? Math.round(horizon / 2), horizon);
  const adjust = (value: number, at: number) =>
    inflation ? value / Math.pow(1.05, at) : value;
  const points = Array.from({ length: horizon + 1 }, (_, i) => ({
    year: i,
    projected: adjust(project(monthly, rate, i), i),
    contributed: adjust(monthly * i * 12, i),
    lower: adjust(project(monthly, 0.03, i), i),
  }));
  const upper =
    Math.max(
      goal,
      ...points.map((p) => p.projected),
      ...points.map((p) => p.lower),
      1,
    ) * 1.1;
  const x = (i: number) => 55 + (i / horizon) * 655;
  const y = (value: number) => 220 - (value / upper) * 185;
  const line = (key: "projected" | "contributed" | "lower") =>
    points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p[key])}`).join(" ");
  const chosen = points[year];
  return (
    <section className="card detail-card trajectory">
      <div className="chart-heading">
        <div>
          <span className="small-eyebrow">THE LONG VIEW</span>
          <h2>Watch small steps add up.</h2>
        </div>
        <button
          className={`inflation-toggle ${inflation ? "enabled" : ""}`}
          aria-pressed={inflation}
          onClick={() => setInflation(!inflation)}
        >
          <span className="toggle-track">
            <span />
          </span>
          Today’s buying power
        </button>
      </div>
      <p>
        Move through the years to compare what you put in with what it could
        become.
      </p>
      <div className="chart-readout" aria-live="polite">
        <span>
          Year {year}
          <strong>{money(chosen.projected)}</strong>
        </span>
        <span>
          Your contributions<strong>{money(chosen.contributed)}</strong>
        </span>
        <span>
          3% return scenario<strong>{money(chosen.lower)}</strong>
        </span>
      </div>
      <div className="chart-container">
        <svg
          viewBox="0 0 740 260"
          role="img"
          aria-label={`Illustrative investment value over ${horizon} years. At year ${year}, contributions are ${money(chosen.contributed)} and the ${Math.round(rate * 1000) / 10}% scenario is ${money(chosen.projected)}.`}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#90a87b" stopOpacity=".25" />
              <stop offset="100%" stopColor="#90a87b" stopOpacity=".02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line
                x1="55"
                x2="710"
                y1={y(upper * f)}
                y2={y(upper * f)}
                stroke="#e8ebdf"
                strokeDasharray={f ? "3 5" : undefined}
              />
              <text
                x="44"
                y={y(upper * f) + 4}
                textAnchor="end"
                className="axis-label"
              >
                {upper * f >= 100000
                  ? `${((upper * f) / 100000).toFixed(1)}L`
                  : upper * f >= 1000
                    ? `${Math.round((upper * f) / 1000)}k`
                    : Math.round(upper * f)}
              </text>
            </g>
          ))}
          <path
            d={`${line("projected")} L710,220 L55,220 Z`}
            fill="url(#chart-fill)"
          />
          <path
            d={points
              .map((p, i) => `${i ? "L" : "M"}${x(i)},${y(adjust(goal, i))}`)
              .join(" ")}
            stroke="#c68a63"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="2 6"
          />
          <path
            d={line("lower")}
            stroke="#b29c7c"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5 5"
          />
          <path
            d={line("contributed")}
            stroke="#aeb9a0"
            strokeWidth="2"
            fill="none"
          />
          <path
            d={line("projected")}
            stroke="#496c40"
            strokeWidth="3"
            fill="none"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <text
              key={f}
              x={x(Math.round(horizon * f))}
              y="247"
              textAnchor="middle"
              className="axis-label"
            >
              Year {Math.round(horizon * f)}
            </text>
          ))}
          <line
            x1={x(year)}
            x2={x(year)}
            y1="24"
            y2="220"
            stroke="#80966f"
            strokeDasharray="4 4"
          />
          <circle
            cx={x(year)}
            cy={y(chosen.projected)}
            r="6"
            fill="#496c40"
            stroke="#fffefa"
            strokeWidth="3"
          />
        </svg>
      </div>
      <label className="chart-slider-label" htmlFor="chart-year">
        Explore a year <strong>{year}</strong>
      </label>
      <input
        id="chart-year"
        type="range"
        min="0"
        max={horizon}
        step="1"
        value={year}
        onChange={(e) => setSelectedYear(+e.target.value)}
      />
      <div className="chart-legend">
        <span>
          <i className="legend-line projected" />
          {Math.round(rate * 1000) / 10}% scenario
        </span>
        <span>
          <i className="legend-line lower" />
          3% scenario
        </span>
        <span>
          <i className="legend-line contributed" />
          Contributions
        </span>
        <span>
          <i className="legend-line target" />
          Your goal
        </span>
      </div>
      <p className="quiet-note">
        {inflation
          ? "All displayed amounts are adjusted for an illustrative 5% annual inflation rate. Your target is entered in future rupees."
          : "Amounts are in future rupees. Switch on today’s buying power to explore an illustrative 5% annual inflation rate."}{" "}
        These smooth paths explain compounding; actual markets fluctuate. The
        emergency buffer is excluded. Allocation stays fixed throughout; revisit
        it when your buffer is funded.
      </p>
      {arrival === null && (
        <p className="warning">
          {monthly <= 0
            ? "No money is currently allocated to investing. Adjust your safety-net split to explore a funded goal."
            : "This goal takes more than 100 years under this assumption. Try changing the goal or your contribution."}
        </p>
      )}
      {arrival !== null && arrival > 50 && (
        <p className="quiet-note">
          This chart shows the first 50 years; your estimated goal lies beyond
          that.
        </p>
      )}
    </section>
  );
}
