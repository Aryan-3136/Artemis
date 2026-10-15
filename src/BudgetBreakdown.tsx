import { money } from "./finance";
import { Sprout } from "lucide-react";

type Props = {
  income: number;
  essentials: number;
  lifestyle: number;
  other: number;
  contribution: number;
};
export function BudgetBreakdown({
  income,
  essentials,
  lifestyle,
  other,
  contribution,
}: Props) {
  const expenses = essentials + lifestyle + other;
  const breathing = Math.max(0, income - expenses - contribution);
  const segments = [
    { label: "Essentials", value: essentials, color: "#a6b592" },
    { label: "Good stuff", value: lifestyle, color: "#d1b491" },
    { label: "Other expenses", value: other, color: "#b3a7bd" },
    { label: "Your future", value: contribution, color: "#486940" },
    { label: "Breathing room", value: breathing, color: "#dce4d0" },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let angle = 0;
  const gradient = segments
    .map((s) => {
      const start = angle;
      angle += total ? (s.value / total) * 360 : 0;
      return `${s.color} ${start}deg ${angle}deg`;
    })
    .join(",");
  return (
    <section
      className="insight-card budget-breakdown"
      aria-label="Monthly budget breakdown"
    >
      <div className="insight-top">
        <span className="round-icon">
          <Sprout size={19} />
        </span>
        <span>YOUR MONTH AT A GLANCE</span>
      </div>
      <h2>
        A little clarity.
        <br />A little more possibility.
      </h2>
      <div
        className="budget-donut"
        style={{
          background: total ? `conic-gradient(${gradient})` : "#dce4d0",
        }}
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${money(s.value)}`)
          .join(". ")}
      >
        <div>
          <strong>
            {income ? Math.round((contribution / income) * 100) : 0}%
          </strong>
          <span>for your future</span>
        </div>
      </div>
      <div className="budget-legend">
        {segments
          .filter((s) => s.label !== "Other expenses" || s.value > 0)
          .map((s) => (
            <div key={s.label}>
              <span className="legend-dot" style={{ background: s.color }} />
              <span>{s.label}</span>
              <strong>{money(s.value)}</strong>
            </div>
          ))}
      </div>
      <p className="budget-insight">
        {expenses > income
          ? "Your expenses exceed your income. Revisit your estimates to find a comfortable starting point."
          : income === 0
            ? "Start with your monthly income. Estimates are welcome."
            : contribution === 0
              ? "There’s no rush. Choose an amount that feels comfortable, even if it’s small."
              : `You’re making room for ${money(contribution)} a month, with ${money(breathing)} left for life’s little surprises.`}
      </p>
    </section>
  );
}
