import { useState } from "react";
import {
  Landmark,
  ShieldCheck,
  FileText,
  Coins,
  TrendingUp,
  Check,
  Plus,
  X,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

const options = [
  {
    id: "savings",
    name: "Savings account",
    icon: Landmark,
    horizon: "near",
    tag: "A place for your safety net",
    description:
      "Keep everyday and emergency money accessible, with interest on the balance.",
    risk: "Lower market risk; inflation can outpace interest.",
    access:
      "Usually accessible on demand, subject to account and transaction limits.",
    cost: "Check minimum-balance rules, account charges and transaction fees.",
    lock: "Generally no fixed lock-in for an ordinary savings account.",
    watch:
      "Interest rates can change. Check the bank’s eligibility for deposit insurance and its applicable limits; protection is not unlimited.",
    fit: "Money you may need unexpectedly. Accessibility matters more than chasing returns.",
  },
  {
    id: "fd",
    name: "Fixed deposit",
    icon: ShieldCheck,
    horizon: "near",
    tag: "For a known expense date",
    description:
      "Leave money with a bank for an agreed term and interest rate.",
    risk: "Lower market risk when held to maturity; bank credit risk and inflation still matter.",
    access:
      "Many deposits allow early exit with reduced interest or a penalty; some do not.",
    cost: "Check early-withdrawal penalties. Interest may be taxable.",
    lock: "A chosen maturity date; withdrawal rules vary by deposit type.",
    watch:
      "A tax-saving FD has different lock-in rules from an ordinary FD. Check terms, renewal instructions and applicable deposit-insurance limits.",
    fit: "A planned expense with a date, when the deposit’s maturity matches your needs.",
  },
  {
    id: "bonds",
    name: "Bonds",
    icon: FileText,
    horizon: "long",
    tag: "Understand who owes you",
    description:
      "Lend money to a government or company in exchange for specified payments.",
    risk: "Varies by issuer and duration. Default is possible and market prices can fall.",
    access:
      "Holding to maturity and selling early have different risks. Finding a buyer can be difficult.",
    cost: "Brokerage, spreads and platform charges may apply. Interest and gains may be taxable.",
    lock: "A maturity date; early sale depends on the instrument and available liquidity.",
    watch:
      "Government and company bonds do not carry the same credit risk. Higher promised yields can reflect higher risk.",
    fit: "A dated cash-flow need or diversification, after checking issuer quality, maturity and liquidity.",
  },
  {
    id: "gold",
    name: "Gold",
    icon: Coins,
    horizon: "long",
    tag: "One piece of a bigger mix",
    description:
      "A diversifier whose price can move differently from other investments.",
    risk: "Prices can fluctuate sharply. Gold does not guarantee growth or regular income.",
    access:
      "Depends on the format: physical gold, an ETF or other products have different sale rules.",
    cost: "Physical gold can have making, storage and resale costs. Funds can have expense ratios and trading costs.",
    lock: "Depends on how you buy. Check the specific product before committing.",
    watch:
      "Purity, spreads, custody, regulation and tax treatment depend on the format. Buying jewellery and buying an investment fund are different choices.",
    fit: "Diversification within a broader plan, rather than an emergency fund or a guaranteed route to a target.",
  },
  {
    id: "index",
    name: "Index fund",
    icon: TrendingUp,
    horizon: "long",
    tag: "Give growth time",
    description:
      "An equity index fund holds a basket of shares to follow a market index.",
    risk: "Market-linked. Value can fall significantly and stay below your purchase value for years.",
    access:
      "Open-ended funds generally allow redemption, but settlement takes time and restrictions can apply.",
    cost: "An expense ratio reduces returns. Exit loads and taxes may apply.",
    lock: "Many open-ended equity index funds have no fixed lock-in; check the scheme’s terms.",
    watch:
      "Compare the index, diversification, expense ratio, tracking difference and scheme documents. A SIP spreads purchases; it does not remove market risk.",
    fit: "Long-term money you can leave invested through difficult markets. Five years or more is a useful starting horizon, not a guarantee against loss.",
  },
];
const rows: {
  label: string;
  key: "risk" | "access" | "cost" | "lock" | "fit";
}[] = [
  { label: "Can it lose value?", key: "risk" },
  { label: "Can I get my money?", key: "access" },
  { label: "Fees and costs", key: "cost" },
  { label: "Lock-in", key: "lock" },
  { label: "What is it useful for?", key: "fit" },
];
export function OptionsExplorer() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const chosen = options.filter((option) => selected.includes(option.id));
  const toggle = (id: string) =>
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : previous.length < 2
          ? [...previous, id]
          : previous,
    );
  const filtered = options.filter(
    (option) => filter === "all" || option.horizon === filter,
  );
  return (
    <section
      className="card detail-card options-explorer"
      aria-labelledby="options-title"
    >
      <div className="explorer-header">
        <div>
          <span className="small-eyebrow">UNDERSTAND BEFORE YOU CHOOSE</span>
          <h2 id="options-title">Different tools. Different jobs.</h2>
          <p>
            You don’t need every option. Start with what you need your money to
            do.
          </p>
        </div>
        <span className="pill">LEARN, THEN DECIDE</span>
      </div>
      <div
        className="option-filters"
        role="group"
        aria-label="Filter investment options"
      >
        {[
          ["all", "All options"],
          ["near", "Near-term needs"],
          ["long", "Longer-term goals"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="filter-description" role="status">
        {filter === "near"
          ? "Start with access and predictable timing. Check the actual terms before choosing."
          : filter === "long"
            ? "Explore growth and diversification. Time reduces some pressures, but does not eliminate risk."
            : "Five familiar options, explained through risk, access and cost."}
      </p>
      <div className="option-card-grid">
        {filtered.map((option) => {
          const Icon = option.icon;
          const active = selected.includes(option.id);
          return (
            <article
              className={`option-card ${active ? "is-selected" : ""}`}
              key={option.id}
            >
              <div className="option-card-top">
                <span className={`option-icon ${option.id}`}>
                  <Icon size={21} />
                </span>
                <span className="option-purpose">{option.tag}</span>
              </div>
              <h3>{option.name}</h3>
              <p className="option-description">{option.description}</p>
              <div className="option-facts">
                <span>RISK</span>
                <p>{option.risk}</p>
                <span>ACCESS</span>
                <p>{option.access}</p>
              </div>
              <details className="option-details">
                <summary>
                  Costs & things to know <ChevronDown size={14} />
                </summary>
                <div>
                  <h4>Fees and costs</h4>
                  <p>{option.cost}</p>
                  <h4>Lock-in</h4>
                  <p>{option.lock}</p>
                  <h4>Look a little closer</h4>
                  <p>{option.watch}</p>
                </div>
              </details>
              <button
                className="compare-button"
                aria-label={`${active ? "Remove" : "Compare"} ${option.name}${active ? " from comparison" : ""}`}
                aria-pressed={active}
                disabled={!active && selected.length >= 2}
                onClick={() => toggle(option.id)}
              >
                {active ? <Check size={14} /> : <Plus size={14} />}{" "}
                {active ? "Selected for comparison" : "Compare this option"}
              </button>
            </article>
          );
        })}
      </div>
      <div className="compare-tray">
        <div>
          <span className="small-eyebrow">TAKE TWO, LOOK CLOSER</span>
          <p role="status">
            {selected.length === 2
              ? "Your two options are ready to compare."
              : selected.length === 1
                ? "Choose one more option to compare."
                : "Choose up to two options to compare."}
          </p>
          <div className="selected-options">
            {chosen.map((option) => (
              <button
                key={option.id}
                onClick={() => toggle(option.id)}
                aria-label={`Remove ${option.name} selection`}
              >
                {option.name}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>
        {selected.length === 2 && (
          <a className="comparison-link" href="#option-comparison">
            View comparison <ArrowDown size={15} />
          </a>
        )}
      </div>
      {chosen.length === 2 && (
        <div className="option-comparison" id="option-comparison">
          <h3>A little side-by-side clarity.</h3>
          <p className="comparison-scroll-hint">Swipe sideways to see both options →</p>
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Scroll to compare investment options"
          >
            <table>
              <caption>
                Educational comparison of {chosen[0].name} and {chosen[1].name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">What matters</th>
                  {chosen.map((option) => (
                    <th scope="col" key={option.id}>
                      {option.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {chosen.map((option) => (
                      <td key={option.id}>{option[row.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="text-button" onClick={() => setSelected([])}>
            <X size={14} /> Clear comparison
          </button>
        </div>
      )}
      <p className="quiet-note">
        Exploring and comparing does not change your mix. Use the allocation
        controls above to adjust your plan. These are general explanations, not
        product recommendations; actual terms and tax treatment vary.
      </p>
    </section>
  );
}
