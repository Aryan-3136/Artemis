import { useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  TrendingDown,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  advancePortfolio,
  emptyPortfolio,
  money,
  type MonthlyAllocation,
} from "./finance";

type Props = {
  allocation: MonthlyAllocation;
  goal: number;
  onEdit: () => void;
};
export function Portfolio({ allocation, goal, onEdit }: Props) {
  const [open, setOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(emptyPortfolio);
  const [details, setDetails] = useState(false);
  const [resetMessage, setResetMessage] = useState(false);
  const total = portfolio.safety + portfolio.growth + portfolio.predictable;
  const invested = portfolio.growth + portfolio.predictable;
  const monthly =
    allocation.safety + allocation.growth + allocation.predictable;
  const progress = goal > 0 ? Math.min(100, (invested / goal) * 100) : 0;
  const next = (shock = false) => {
    setPortfolio((p) => advancePortfolio(p, allocation, shock));
    setResetMessage(false);
  };
  return (
    <section className="card detail-card portfolio-section">
      <div className="portfolio-intro">
        <div>
          <span className="small-eyebrow">LIFE AFTER THE PLAN</span>
          <h2>A month in your future.</h2>
          <p>
            Practise checking in on your money without putting any money at
            risk.
          </p>
        </div>
        <button
          className="secondary-button"
          aria-expanded={open}
          aria-controls="portfolio-simulation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close simulation" : "Explore a month"}
          {open ? <ChevronUp size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
      {open && (
        <div id="portfolio-simulation" className="portfolio-simulation">
          <div className="simulation-banner">
            <span className="simulation-dot" /> SIMULATED MONEY{" "}
            <span>Month {portfolio.month} · this visit only</span>
          </div>
          <div className="portfolio-overview">
            <div>
              <span className="portfolio-value-label">
                Everything in this simulation
              </span>
              <strong className="portfolio-value">{money(total)}</strong>
              <p>Starting from ₹0. Existing savings aren’t included.</p>
            </div>
            <div className="portfolio-totals">
              <span>
                You’ve added<strong>{money(portfolio.contributed)}</strong>
              </span>
              <span>
                Investment movement
                <strong
                  className={
                    total - portfolio.contributed < 0 ? "negative" : ""
                  }
                >
                  {total - portfolio.contributed >= 0 ? "+" : ""}
                  {money(total - portfolio.contributed)}
                </strong>
              </span>
            </div>
          </div>
          <div
            className={`monthly-story ${portfolio.lastChange < 0 ? "down-month" : ""}`}
            role="status"
            aria-live="polite"
          >
            <span className="feature-icon">
              {portfolio.lastChange < 0 ? (
                <TrendingDown size={20} />
              ) : (
                <Wallet size={20} />
              )}
            </span>
            <div>
              <h3>
                {portfolio.month === 0
                  ? "Your plan is ready for its first month."
                  : portfolio.lastShock
                    ? "A difficult month. Let’s look at it calmly."
                    : portfolio.lastChange < 0
                      ? "A down month is part of the story."
                      : "Another month, a little more clarity."}
              </h3>
              <p>
                {portfolio.month === 0
                  ? `Add your first simulated ${money(monthly)} to see your plan in action.`
                  : `You added ${money(portfolio.lastContribution)}. Investment movement ${portfolio.lastChange < 0 ? "reduced" : "increased"} the value by ${money(Math.abs(portfolio.lastChange))}.`}
                {portfolio.lastShock
                  ? " Growth holdings fell 30% before this month’s contribution. Your safety net wasn’t exposed."
                  : ""}
              </p>
            </div>
          </div>
          <div className="portfolio-goal">
            <div>
              <span>Long-term goal progress</span>
              <strong>
                {money(invested)} <small>of {money(goal)}</small>
              </strong>
            </div>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <progress
            className="goal-progress"
            aria-label="Simulated long-term goal progress"
            max="100"
            value={progress}
          />
          <p className="quiet-note">
            Emergency savings are separate from your long-term goal.
          </p>
          <button
            className="holdings-toggle"
            aria-expanded={details}
            aria-controls="simulated-holdings"
            onClick={() => setDetails(!details)}
          >
            {details ? "Hide" : "See"} simulated holdings{" "}
            {details ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {details && (
            <div id="simulated-holdings" className="simulated-holdings">
              {[
                ["Safety net", portfolio.safety, "No return assumed"],
                [
                  "Growth-oriented fund",
                  portfolio.growth,
                  "Illustrative monthly market movements",
                ],
                [
                  "Fixed deposit",
                  portfolio.predictable,
                  "Simplified 4% annual interest",
                ],
              ].map(([label, value, description], i) => (
                <div className="allocation-item" key={label}>
                  <span className={`allocation-dot dot-${i}`} />
                  <div>
                    <h3>{label}</h3>
                    <p>{description}</p>
                  </div>
                  <strong>{money(+value)}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="simulation-actions">
            <button
              className="primary-button"
              disabled={monthly <= 0 || portfolio.month >= 120}
              onClick={() => next()}
            >
              Simulate next month <ArrowRight size={16} />
            </button>
            <button
              className="decline-button"
              disabled={portfolio.growth <= 0 || portfolio.month >= 120}
              onClick={() => next(true)}
            >
              <TrendingDown size={16} /> Try a market decline
            </button>
            <button
              className="reset-simulation"
              disabled={portfolio.month === 0}
              onClick={() => {
                setPortfolio(emptyPortfolio);
                setResetMessage(true);
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
          {resetMessage && (
            <p className="quiet-note" role="status">
              Simulation reset. Your saved plan is unchanged.
            </p>
          )}
          {portfolio.month >= 120 && (
            <p className="quiet-note">
              You’ve explored 10 simulated years. Reset to try another path.
            </p>
          )}
          {monthly <= 0 && (
            <p className="warning">
              Choose a monthly contribution in your budget to explore this
              simulation.{" "}
              <button className="text-button" onClick={onEdit}>
                Update my month <ArrowRight size={14} />
              </button>
            </p>
          )}
          <div className="simulation-assumptions">
            <strong>How this practice view works</strong>
            <p>
              Each step adds one month’s planned contributions after applying
              returns to existing holdings. The example market sequence repeats
              every 12 months for demonstration; it is not historical data or a
              forecast. A market decline replaces that month’s growth return
              with −30%. Fixed deposits use simplified monthly accrual at 4% a
              year; emergency savings earn 0% here. Tax, fees, lock-in and
              withdrawals are excluded. The allocation stays fixed even after
              your safety net is funded. Leaving this page or editing your plan
              restarts the simulation.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
