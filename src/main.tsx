import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet,
  House,
  Coffee,
  ShoppingBag,
  ShieldCheck,
  Sprout,
  Flag,
  CircleHelp,
  ChevronRight,
  Menu,
  X,
  RotateCcw,
  TrendingDown,
  CheckCircle2,
  SlidersHorizontal,
  Download,
  Printer,
} from "lucide-react";
import { money, project, yearsToGoal } from "./finance";
import "./style.css";
import { GoalChart } from "./GoalChart";
import { Portfolio } from "./Portfolio";
import { BudgetBreakdown } from "./BudgetBreakdown";
import { useFocusLayer } from "./useFocusLayer";
import { IncomeScenario } from "./IncomeScenario";
import { OptionsExplorer } from "./OptionsExplorer";
import { downloadPlan, type ExportablePlan as Budget } from "./exportPlan";
import { stepFromSearch, stepUrl } from "./navigation";
import {
  defaultPlan as defaults,
  readSavedPlan,
  samePlan,
} from "./planStorage";

const steps = [
  "Your month",
  "Your safety net",
  "Your someday",
  "Your money mix",
  "A difficult year",
  "Your plan",
];
function App() {
  const [storedPlan, setStoredPlan] = useState<Budget | null>(() =>
    readSavedPlan(),
  );
  const [b, setB] = useState<Budget>(() => storedPlan ?? defaults);
  const saved = storedPlan !== null && samePlan(b, storedPlan);
  const [storageError, setStorageError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const startFreshRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirmReset) resetCancelRef.current?.focus();
  }, [confirmReset]);
  const [step, setStep] = useState(() =>
    stepFromSearch(window.location.search),
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  useEffect(() => {
    const onBack = () => {
      navigated.current = true;
      setStep(stepFromSearch(window.location.search));
      setMenu(false);
      setHelp(false);
      setConfirmReset(false);
    };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);
  const [reviewed, setReviewed] = useState<string | null>(() => {
    try {
      const value = localStorage.getItem("someday-reviewed");
      return value && !Number.isNaN(Date.parse(value)) ? value : null;
    } catch {
      return null;
    }
  });
  const [checkIn, setCheckIn] = useState(false);
  const [exported, setExported] = useState(false);
  const review = () => {
    try {
      const date = new Date().toISOString();
      localStorage.setItem("someday-reviewed", date);
      setReviewed(date);
      setCheckIn(true);
    } catch {
      setStorageError(
        "This browser couldn’t save your check-in. Your plan is still available on screen. You can download a copy.",
      );
    }
  };
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const helpRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const closeHelp = () => {
    setHelp(false);
    setConfirmReset(false);
  };
  useFocusLayer(help, helpRef, closeHelp);
  useFocusLayer(menu, menuRef, () => setMenu(false));
  useEffect(() => {
    document.title = `${steps[step]} · Someday`;
    if (navigated.current) {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
      navigated.current = false;
    }
  }, [step]);
  const [response, setResponse] = useState("continue");
  const [showOptions, setShowOptions] = useState(false);
  const update = (key: keyof Budget, value: number) => {
    setStorageError("");
    setExported(false);
    setB((old) => {
      const next = {
        ...old,
        [key]: Math.max(
          0,
          Math.min(
            key === "buffer" || key === "growth" ? 100 : 100000000,
            Number.isFinite(value) ? value : 0,
          ),
        ),
      };
      if (key === "contribution")
        next.contribution = Math.min(
          next.contribution,
          Math.max(
            0,
            next.income - next.essentials - next.lifestyle - next.other,
          ),
        );
      if (["income", "essentials", "lifestyle", "other"].includes(key))
        next.contribution = Math.min(
          next.contribution,
          Math.max(
            0,
            next.income - next.essentials - next.lifestyle - next.other,
          ),
        );
      return next;
    });
  };
  const expenses = b.essentials + b.lifestyle + b.other;
  const available = Math.max(0, b.income - expenses);
  const emergency = (b.contribution * b.buffer) / 100;
  const investing = b.contribution - emergency;
  const rate = 0.04 * (1 - b.growth / 100) + (0.09 * b.growth) / 100;
  const lowYears = yearsToGoal(investing, 0.03, b.goal);
  const highYears = yearsToGoal(investing, rate, b.goal);
  const years = (n: number | null) =>
    n === null
      ? investing > 0
        ? "100+ years"
        : "Not funded"
      : `${Math.ceil(n)} years`;
  const save = () => {
    if (expenses > b.income || b.contribution <= 0 || b.goal <= 0) {
      go(b.goal <= 0 ? 2 : 0);
      return;
    }
    try {
      localStorage.setItem("someday-plan", JSON.stringify(b));
      setStoredPlan({ ...b });
      setStorageError("");
    } catch {
      setStorageError(
        "This browser couldn’t save your plan. Allow browser storage, or use Download summary to keep a copy. Your on-screen numbers are unchanged.",
      );
    }
  };
  const go = (n: number) => {
    if (n !== step) {
      window.history.pushState({}, "", stepUrl(n, window.location.href));
      navigated.current = true;
      setStep(n);
    }
    setMenu(false);
  };
  const field = (
    key: keyof Budget,
    label: string,
    icon: React.ReactNode,
    description: string,
  ) => (
    <div className="money-row">
      <div className={`field-icon ${key}`}>{icon}</div>
      <div className="field-label">
        <label htmlFor={key}>{label}</label>
        <span id={`${key}-hint`}>
          {key === "goal" && b.goal <= 0
            ? "Enter a goal greater than ₹0."
            : description}
        </span>
      </div>
      <div className="amount-input">
        <span>₹</span>
        <input
          id={key}
          type="number"
          min="0"
          max="100000000"
          aria-describedby={`${key}-hint`}
          aria-invalid={key === "goal" && b.goal <= 0 ? true : undefined}
          value={b[key]}
          onChange={(e) =>
            update(key, Math.min(100000000, Number(e.target.value)))
          }
        />
      </div>
    </div>
  );
  const total3 = project(investing, rate, 3);
  const crashed = total3 * (1 - (0.3 * b.growth) / 100);
  const beforeDecline = yearsToGoal(investing, rate, b.goal, 0, total3);
  const afterDecline = yearsToGoal(investing, rate, b.goal, 0, crashed);
  const remainingTime = (value: number | null) =>
    value === 0 ? "Goal reached" : years(value);
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {menu && (
        <button
          className="menu-backdrop"
          tabIndex={-1}
          aria-label="Close navigation backdrop"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        ref={menuRef}
        className={`sidebar ${menu ? "open" : ""}`}
        inert={help}
        aria-label="Journey navigation"
      >
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <span className="brand-mark">
            <Sprout size={23} />
          </span>
          someday<span className="brand-dot">.</span>
        </a>
        <button
          className="mobile-close icon-button"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="journey-label">A LITTLE PLAN. A BIG FUTURE.</div>
        <nav aria-label="Your financial journey">
          {steps.map((s, i) => (
            <button
              key={s}
              className={`nav-step ${step === i ? "active" : ""} ${step > i ? "done" : ""}`}
              aria-current={step === i ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="step-number">
                {step > i ? (
                  <Check size={13} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <span>{s}</span>
              {step === i && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-art">
            <span className="art-line" />
            <Sprout size={52} strokeWidth={1} />
            <span className="tiny-sun" />
          </div>
          <h3>Big things start small.</h3>
          <p>
            You don’t need to have it all figured out. Just a place to begin.
          </p>
          <div className="sidebar-footer">
            <ShieldCheck size={14} /> Your money. Your pace.
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={help || menu}>
        <header>
          <div className="breadcrumb">
            <button
              className="mobile-toggle icon-button"
              onClick={() => setMenu(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            Your first money plan <ChevronRight size={13} />
            <span>{steps[step]}</span>
          </div>
          <div className="header-actions">
            <span
              className={`plan-state ${saved ? "is-saved" : ""}`}
              role="status"
            >
              <span />
              {saved
                ? "Saved on this device"
                : storedPlan
                  ? "Unsaved changes"
                  : "Draft plan"}
            </span>
            <button className="help-button" onClick={() => setHelp(true)}>
              <CircleHelp size={16} /> A little help
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {storageError && (
            <div className="storage-notice" role="alert">
              <div>
                <strong>A little trouble saving.</strong>
                <p>{storageError}</p>
              </div>
              <button
                className="icon-button"
                aria-label="Dismiss storage message"
                onClick={() => setStorageError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {step === 0 && storedPlan && (
            <section className="return-banner" aria-label="Saved plan">
              <span className="feature-icon">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h2>Your plan is right here.</h2>
                <p>
                  {saved
                    ? `${money(storedPlan.contribution)} each month toward a future you understand.`
                    : "You’re exploring changes. Your saved plan is safe until you choose to save again."}
                </p>
              </div>
              <div className="return-actions">
                {!saved && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setB({ ...storedPlan });
                      setStorageError("");
                      setExported(false);
                    }}
                  >
                    <RotateCcw size={14} /> Restore saved plan
                  </button>
                )}
                <button className="secondary-button" onClick={() => go(5)}>
                  Review my plan <ArrowRight size={15} />
                </button>
              </div>
            </section>
          )}
          <div className="page-heading">
            <div className="eyebrow">
              <span /> STEP {String(step + 1).padStart(2, "0")} OF 06
            </div>
            <div className="title-line">
              <h1 ref={headingRef} tabIndex={-1}>
                {[
                  "Make room for<br/>your future.",
                  "A soft landing,<br/>for real life.",
                  "Give your future<br/>a little direction.",
                  "Every rupee,<br/>with a purpose.",
                  "Let’s meet a<br/>difficult year.",
                  "A little plan.<br/>A promising start.",
                ][step]
                  .split("<br/>")
                  .map((s, i) => (
                    <React.Fragment key={s}>
                      {i > 0 && <br />}
                      {s}
                    </React.Fragment>
                  ))}
              </h1>
              <div className="heading-doodle">
                <Sprout size={66} strokeWidth={1.1} />
                <span>one small step</span>
              </div>
            </div>
            <p className="subtitle">
              {
                [
                  "Before we talk investing, let’s find out what a comfortable month looks like for you.",
                  "Unexpected expenses happen. Let’s make sure they don’t undo your plans.",
                  "A number is a start. A plan makes it feel a little closer.",
                  "Understand where your money goes, and why it belongs there.",
                  "Markets don’t move in straight lines. Your plan should make room for that.",
                  "Something you understand. Something you can come back to.",
                ][step]
              }
            </p>
          </div>
          {step === 0 ? (
            <div className="budget-grid">
              <section className="budget-card card">
                <div className="card-heading">
                  <div>
                    <h2>Your month, in numbers</h2>
                    <p>Rough estimates are a perfectly good start.</p>
                  </div>
                  <span className="pill">
                    {!storedPlan && samePlan(b, defaults)
                      ? "EXAMPLE"
                      : "MONTHLY"}
                  </span>
                </div>
                {!storedPlan && samePlan(b, defaults) && (
                  <div className="example-note">
                    <span>Aarav’s example budget. Make it yours.</span>
                    <button
                      onClick={() =>
                        setB({
                          ...defaults,
                          income: 0,
                          essentials: 0,
                          lifestyle: 0,
                          other: 0,
                          contribution: 0,
                          saved: 0,
                        })
                      }
                    >
                      Start blank <ArrowRight size={12} />
                    </button>
                  </div>
                )}
                {field(
                  "income",
                  "Money coming in",
                  <Wallet size={20} />,
                  "Pocket money, part-time work, anything else",
                )}
                <div className="section-divider">
                  <span>AND WHERE IT GOES</span>
                </div>
                {field(
                  "essentials",
                  "The essentials",
                  <House size={20} />,
                  "Food, rent, travel & bills",
                )}
                {field(
                  "lifestyle",
                  "The good stuff",
                  <Coffee size={20} />,
                  "Outings, subscriptions & little joys",
                )}
                {field(
                  "other",
                  "Anything else?",
                  <ShoppingBag size={20} />,
                  "Other expenses or monthly repayments",
                )}
                <div className="budget-total">
                  <span>Room for your future</span>
                  <strong>
                    {money(b.income - expenses)}
                    <small>/ month</small>
                  </strong>
                </div>
                {expenses > b.income && (
                  <p className="warning" role="alert">
                    Your expenses are higher than your income. Adjust your
                    estimates before setting money aside.
                  </p>
                )}
                <div className="quiet-note">
                  <ShieldCheck size={15} />
                  <span>
                    No bank connections. No judgement. Just your numbers.
                  </span>
                </div>
              </section>
              <aside className="right-column">
                <BudgetBreakdown
                  income={b.income}
                  essentials={b.essentials}
                  lifestyle={b.lifestyle}
                  other={b.other}
                  contribution={b.contribution}
                />
                <div className="side-note">
                  <span>✳</span>
                  <p>
                    <strong>Keep a little for living.</strong>
                    <br />A plan that leaves no room for a coffee with friends
                    is a plan that’s hard to stick to.
                  </p>
                </div>
              </aside>
              <section className="set-aside card">
                <div className="set-aside-heading">
                  <div>
                    <span className="small-eyebrow">YOUR COMFORT ZONE</span>
                    <h2>What feels right to set aside?</h2>
                    <p>You’re in charge. This should fit your life.</p>
                  </div>
                  <div className="contribution">
                    <label className="sr-only" htmlFor="exact-contribution">
                      Exact monthly amount to set aside
                    </label>
                    <div className="exact-contribution">
                      <span>₹</span>
                      <input
                        id="exact-contribution"
                        type="number"
                        min="0"
                        max={available}
                        value={b.contribution}
                        onChange={(e) =>
                          update("contribution", Number(e.target.value))
                        }
                      />
                    </div>
                    <small>each month · tap to edit</small>
                  </div>
                </div>
                <input
                  aria-label="Monthly amount to set aside"
                  className="range"
                  type="range"
                  min="0"
                  max={available}
                  step="1"
                  value={b.contribution}
                  onChange={(e) =>
                    update("contribution", Number(e.target.value))
                  }
                />
                <div className="range-labels">
                  <span>₹0 · start wherever you are</span>
                  <span>{money(available)} available</span>
                </div>
                <div
                  className="contribution-presets"
                  role="group"
                  aria-label="Quick monthly amounts"
                >
                  {[500, 1000, 2000].map((amount) => (
                    <button
                      key={amount}
                      disabled={amount > available}
                      aria-pressed={b.contribution === amount}
                      onClick={() => update("contribution", amount)}
                    >
                      {money(amount)}
                    </button>
                  ))}
                  <button
                    disabled={available <= 0}
                    aria-pressed={b.contribution === available && available > 0}
                    onClick={() => update("contribution", available)}
                  >
                    All available
                  </button>
                </div>
                <div className="breathing">
                  <span className="breathing-dot" />
                  <span>
                    That leaves{" "}
                    <strong>
                      {money(Math.max(0, available - b.contribution))}
                    </strong>{" "}
                    of breathing room each month.
                  </span>
                </div>
                {b.contribution === 0 && (
                  <div className="zero-budget">
                    <h3>There’s no rush to invest.</h3>
                    <p>
                      {expenses > b.income
                        ? "Start by finding a budget that covers your everyday needs."
                        : "Even if there’s no room this month, you can still learn how a plan works."}{" "}
                      Try Aarav’s example, or explore the other steps using the
                      menu.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setB({ ...defaults });
                        setExported(false);
                      }}
                    >
                      Explore the example <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </section>
            </div>
          ) : step === 1 ? (
            <div className="content-grid">
              <section className="card detail-card">
                <div className="feature-icon">
                  <ShieldCheck />
                </div>
                <h2>First, a safety net.</h2>
                <p>
                  Keep emergency money accessible, so an unexpected bill doesn’t
                  force you to sell investments.
                </p>
                {field(
                  "saved",
                  "Already tucked away",
                  <Wallet size={20} />,
                  "Existing emergency savings",
                )}
                <div className="stat-strip">
                  <span>
                    A starting target: 3 months of essentials
                    <strong>{money(b.essentials * 3)}</strong>
                  </span>
                  <span>
                    Still to build
                    <strong>
                      {money(Math.max(0, b.essentials * 3 - b.saved))}
                    </strong>
                  </span>
                </div>
                <div className="safety-progress">
                  <div>
                    <span>Your starting buffer</span>
                    <strong>
                      {b.essentials > 0
                        ? `${Math.min(100, Math.round((b.saved / (b.essentials * 3)) * 100))}% covered`
                        : "Add your essential expenses"}
                    </strong>
                  </div>
                  <progress
                    className="goal-progress"
                    aria-label="Existing emergency savings toward starting buffer"
                    max="100"
                    value={
                      b.essentials > 0
                        ? Math.min(100, (b.saved / (b.essentials * 3)) * 100)
                        : 0
                    }
                  />
                </div>
                {b.essentials > 0 && b.saved < b.essentials * 3 && (
                  <div className="safety-suggestion">
                    <ShieldCheck size={17} />
                    <div>
                      <strong>Give yourself a softer landing.</strong>
                      <p>
                        Your buffer is still growing. You can focus on
                        accessible savings first, then revisit investing.
                      </p>
                      <button
                        className="text-button"
                        onClick={() => update("buffer", 100)}
                      >
                        Focus on my safety net <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
                <label className="slider-title" htmlFor="buffer">
                  Put {b.buffer}% of your monthly contribution toward your
                  buffer <strong>{money(emergency)}/mo</strong>
                </label>
                <input
                  id="buffer"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={b.buffer}
                  onChange={(e) => update("buffer", +e.target.value)}
                />
                <p className="quiet-note">
                  {b.essentials > 0 && b.saved >= b.essentials * 3
                    ? "Your starting buffer is covered. Revisit this target as your needs change."
                    : emergency > 0
                      ? `${Math.ceil(Math.max(0, b.essentials * 3 - b.saved) / emergency)} months to this starting buffer, excluding interest.`
                      : "Choose a contribution to start building your buffer."}
                </p>
                <div className="info-box">
                  An accessible savings account can be useful here. Three months
                  is a starting point; irregular income may call for a bigger
                  buffer.
                </div>
                <details className="planning-note">
                  <summary>
                    Debt or a big expense coming up? <ChevronRight size={14} />
                  </summary>
                  <p>
                    Include required debt repayments in “Anything else?” on your
                    budget. Costly debt can grow faster than investment returns;
                    review its interest rate before committing more to long-term
                    investments.
                  </p>
                  <p>
                    Keep money for an expense you expect soon separate from
                    long-term growth holdings. You can reduce your investment
                    amount while you build that reserve.
                  </p>
                </details>
              </section>
              <section className="insight-card">
                <span className="small-eyebrow">
                  MAKE SPACE FOR THE UNEXPECTED
                </span>
                <h2>
                  A broken phone.
                  <br />A trip home.
                  <br />
                  Life happens.
                </h2>
                <p>
                  Your safety net gives your long-term money time to grow. You
                  can change this split whenever you need to.
                </p>
                <ShieldCheck
                  className="large-illustration"
                  size={110}
                  strokeWidth={0.8}
                />
              </section>
            </div>
          ) : step === 2 ? (
            <>
              <div className="content-grid">
                <section className="card detail-card">
                  <div className="feature-icon">
                    <Flag />
                  </div>
                  <h2>What’s your someday number?</h2>
                  <p>
                    One million rupees is ₹10 lakh. This is your starting goal,
                    and you can make it your own.
                  </p>
                  {field(
                    "goal",
                    "My goal",
                    <Flag size={20} />,
                    "In rupees, at future value",
                  )}
                  <div className="goal-result">
                    <span>WITH {money(investing)} / MONTH INVESTED</span>
                    <h3>
                      {years(highYears)} <em>–</em> {years(lowYears)}
                    </h3>
                    <p>
                      Illustrative timelines, using{" "}
                      {Math.round(rate * 1000) / 10}% and 3% annual returns.
                    </p>
                  </div>
                  <div className="info-box">
                    These are scenarios, not forecasts. Returns vary, taxes and
                    fees reduce outcomes, and inflation means this amount will
                    buy less in the future.
                  </div>
                </section>
                <IncomeScenario monthly={investing} rate={rate} goal={b.goal} />
              </div>
              <GoalChart monthly={investing} rate={rate} goal={b.goal} />
            </>
          ) : step === 3 ? (
            <>
              <div className="content-grid">
                <section className="card detail-card">
                  <div className="feature-icon">
                    <SlidersHorizontal />
                  </div>
                  <h2>A mix you understand.</h2>
                  <p>
                    Of your {money(b.contribution)} monthly contribution,{" "}
                    {money(emergency)} goes to your safety net. Let’s split the
                    remaining {money(investing)}.
                  </p>
                  <label className="slider-title" htmlFor="growth">
                    Long-term growth <strong>{b.growth}%</strong>
                  </label>
                  <input
                    id="growth"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={b.growth}
                    onChange={(e) => update("growth", +e.target.value)}
                  />
                  <div className="allocation">
                    <div>
                      <span className="color-dot green" />
                      Growth-oriented
                      <strong>{money((investing * b.growth) / 100)}</strong>
                      <p>
                        Illustrative broad-market index fund. Value can fall,
                        sometimes for years.
                      </p>
                    </div>
                    <div>
                      <span className="color-dot peach" />
                      More predictable
                      <strong>
                        {money((investing * (100 - b.growth)) / 100)}
                      </strong>
                      <p>
                        Illustrative bank FD allocation. Check lock-in, early
                        withdrawal penalties and applicable deposit protection.
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-button"
                    aria-expanded={showOptions}
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    {showOptions ? "Hide" : "Explore"} other options{" "}
                    <ChevronRight size={15} />
                  </button>
                </section>
                <section className="insight-card">
                  <span className="small-eyebrow">A QUICK TRANSLATION</span>
                  <h2>
                    A SIP is a habit.
                    <br />
                    Not a product.
                  </h2>
                  <p>
                    A systematic investment plan is a way to invest regularly in
                    a fund. The risk comes from what the fund holds.
                  </p>
                  <div className="info-box">
                    This educational mix is editable and isn’t a personalized
                    investment recommendation. Compare actual product fees and
                    terms before investing.
                  </div>
                </section>
              </div>
              {showOptions && <OptionsExplorer />}
            </>
          ) : step === 4 ? (
            <div className="content-grid">
              <section className="card detail-card">
                <div className="feature-icon terracotta">
                  <TrendingDown />
                </div>
                <h2>Imagine this: year three.</h2>
                <p>
                  Your growth holdings fall 30%. The more predictable portion is
                  held flat in this simplified stress test.
                </p>
                <div className="stat-strip">
                  <span>
                    You contributed<strong>{money(investing * 36)}</strong>
                  </span>
                  <span>
                    Before the fall<strong>{money(total3)}</strong>
                  </span>
                </div>
                <div className="crash-result">
                  <span>AFTER THE MARKET SHOCK</span>
                  <strong>{money(crashed)}</strong>
                  <small>
                    {money(total3 - crashed)} lower than before the fall
                  </small>
                </div>
                <div className="downturn-impact">
                  <span className="small-eyebrow">
                    WHAT THIS MEANS FOR YOUR GOAL
                  </span>
                  <div>
                    <span>
                      Before the fall
                      <strong>{remainingTime(beforeDecline)} left</strong>
                    </span>
                    <ArrowRight size={18} />
                    <span>
                      After the fall
                      <strong>{remainingTime(afterDecline)} left</strong>
                    </span>
                  </div>
                  <p>
                    If you continue contributing and future returns average{" "}
                    {Math.round(rate * 1000) / 10}% annually. This is a
                    comparison, not a promised recovery; the paths alongside
                    show other possibilities.
                  </p>
                </div>
                <h3>What would you like to explore?</h3>
                <div className="choice-group">
                  {[
                    ["continue", "Keep contributing"],
                    ["pause", "Pause for 6 months"],
                    ["withdraw", "Withdraw 25%"],
                  ].map(([v, l]) => (
                    <button
                      aria-pressed={response === v}
                      className={response === v ? "selected" : ""}
                      key={v}
                      onClick={() => setResponse(v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="info-box">
                  {response === "continue"
                    ? "Continuing adds new money, but only makes sense if your everyday needs and safety net are covered."
                    : response === "pause"
                      ? "A pause can protect your monthly budget. Your existing holdings remain exposed to market changes."
                      : "A withdrawal makes money available now, and leaves less invested for your future. Actual taxes and exit charges may apply."}
                </div>
              </section>
              <section className="card detail-card">
                <span className="small-eyebrow">
                  FIVE YEARS AFTER THE SHOCK
                </span>
                <h2>More than one future.</h2>
                <p>
                  Compare illustrative paths for the same choice. Recovery isn’t
                  guaranteed.
                </p>
                {[
                  ["Prolonged weak market", -0.02],
                  ["Flat market", 0],
                  ["Growth resumes", 0.07],
                ].map(([label, r]) => {
                  let initial =
                    response === "withdraw" ? crashed * 0.75 : crashed;
                  const val =
                    response === "pause"
                      ? project(
                          investing,
                          +r,
                          4.5,
                          project(0, +r, 0.5, initial),
                        )
                      : project(investing, +r, 5, initial);
                  return (
                    <div className="comparison" key={label}>
                      <span>
                        {label}
                        <small>
                          {(+r * 100).toFixed(0)}% annual return assumption
                        </small>
                      </span>
                      <strong>{money(val)}</strong>
                    </div>
                  );
                })}
                <p className="quiet-note">
                  Simplified scenarios exclude tax, fees and changes in
                  contributions. The 30% shock is illustrative, not a
                  prediction.
                </p>
              </section>
            </div>
          ) : (
            <div className="content-grid">
              <section className="card detail-card">
                <div className="feature-icon">
                  <CheckCircle2 />
                </div>
                <h2>Your plan, in your words.</h2>
                <p className="plan-statement">
                  “I’ll set aside <strong>{money(b.contribution)}</strong> each
                  month. <strong>{money(emergency)}</strong> builds my safety
                  net and <strong>{money(investing)}</strong> goes toward my
                  future. My goal is <strong>{money(b.goal)}</strong>. Some
                  years will be difficult, and I can adjust as life changes.”
                </p>
                <div className="stat-strip">
                  <span>
                    Monthly breathing room
                    <strong>
                      {money(Math.max(0, available - b.contribution))}
                    </strong>
                  </span>
                  <span>
                    Illustrative goal timeline
                    <strong>
                      {years(highYears)}–{years(lowYears)}
                    </strong>
                  </span>
                </div>
                <button className="primary-button" onClick={save}>
                  {saved ? <Check size={17} /> : <ShieldCheck size={17} />}{" "}
                  {saved ? "Plan saved on this device" : "Save my plan"}
                </button>
                <p className="quiet-note" role="status">
                  {saved
                    ? "Saved. Come back on this browser to revisit your numbers."
                    : "Your plan is stored only in this browser. No account needed."}
                </p>
                <div className="plan-export-actions">
                  <button
                    className="text-button"
                    disabled={
                      expenses > b.income || b.contribution <= 0 || b.goal <= 0
                    }
                    onClick={() => {
                      try {
                        downloadPlan(b);
                        setExported(true);
                      } catch {
                        setStorageError(
                          "This browser couldn’t start the download. You can use Print plan to keep a copy.",
                        );
                      }
                    }}
                  >
                    <Download size={15} /> Download summary
                  </button>
                  <button
                    className="text-button"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} /> Print plan
                  </button>
                </div>
                <p className="quiet-note export-status" role="status">
                  {exported
                    ? "Your summary is ready. Check your browser downloads."
                    : "Take a copy with you. Downloads include your current edits."}
                </p>
              </section>
              <section className="insight-card">
                <span className="small-eyebrow">YOUR MONTHLY CHECK-IN</span>
                <h2>
                  Does this still
                  <br />
                  fit your life?
                </h2>
                <p>
                  No actual money is invested or tracked here. Revisit your
                  budget when your income, expenses or priorities change.
                </p>
                <div className="checkin-status">
                  {reviewed
                    ? `Last checked ${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(reviewed))}`
                    : "Your first check-in is ready whenever you are."}
                </div>
                <button className="secondary-button" onClick={review}>
                  {checkIn ? <Check size={16} /> : <CheckCircle2 size={16} />}{" "}
                  {checkIn
                    ? "Check-in recorded"
                    : "This still feels comfortable"}
                </button>
                <span className="checkin-confirmation" role="status">
                  {checkIn
                    ? "A little pause to make sure your plan still fits."
                    : ""}
                </span>
                <button className="secondary-button" onClick={() => go(0)}>
                  Update my month <ArrowUpRight size={16} />
                </button>
                <div className="insight-bottom">
                  A plan can change. That’s the point.
                  <Sprout size={18} />
                </div>
              </section>
              <section className="card detail-card plan-allocation">
                <div>
                  <span className="small-eyebrow">WHERE EACH MONTH GOES</span>
                  <h2>Three jobs for your money.</h2>
                  <p>Your planned contributions, not actual holdings.</p>
                </div>
                <div className="allocation-bar" aria-hidden="true">
                  <span style={{ width: `${b.buffer}%` }} />
                  <span
                    style={{ width: `${((100 - b.buffer) * b.growth) / 100}%` }}
                  />
                  <span
                    style={{
                      width: `${((100 - b.buffer) * (100 - b.growth)) / 100}%`,
                    }}
                  />
                </div>
                <div className="allocation-items">
                  {[
                    [
                      "Safety net",
                      emergency,
                      "Accessible emergency savings",
                      1,
                    ],
                    [
                      "Long-term growth",
                      (investing * b.growth) / 100,
                      "Illustrative broad-market index fund",
                      3,
                    ],
                    [
                      "More predictable",
                      (investing * (100 - b.growth)) / 100,
                      "Illustrative fixed deposit",
                      3,
                    ],
                  ].map(([label, amount, description, target], i) => (
                    <div className="allocation-item" key={label}>
                      <span className={`allocation-dot dot-${i}`} />
                      <div>
                        <h3>{label}</h3>
                        <p>{description}</p>
                      </div>
                      <strong>
                        {money(+amount)}
                        <small>/ month</small>
                      </strong>
                      <button
                        className="icon-button"
                        onClick={() => go(+target)}
                        aria-label={`Edit ${label}`}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="info-box">
                  Next step: compare actual product terms before investing. Once
                  your emergency buffer is funded, revisit your split to decide
                  where future contributions belong.
                </div>
                <p className="print-note">
                  Educational plan · No real money invested. Timelines use
                  illustrative {Math.round(rate * 1000) / 10}% and 3% annual
                  returns with monthly compounding and month-end contributions.
                  Allocations stay fixed. Taxes and fees are excluded; inflation
                  reduces buying power. Returns and goal dates are not
                  guaranteed. Annual-increase comparisons and practice
                  simulations are excluded from this summary. This is your
                  current on-screen plan, including unsaved edits.
                </p>
              </section>
              <Portfolio
                key={`${b.contribution}-${b.buffer}-${b.growth}-${b.goal}`}
                allocation={{
                  safety: emergency,
                  growth: (investing * b.growth) / 100,
                  predictable: (investing * (100 - b.growth)) / 100,
                }}
                goal={b.goal}
                onEdit={() => go(0)}
              />
            </div>
          )}
          <div className="bottom-action">
            <div className="bottom-note">
              <span className="small-leaf">
                <Sprout size={18} />
              </span>
              {step === 0
                ? "A realistic plan starts with an honest month."
                : step === 5
                  ? "Your future has room to grow."
                  : "One step closer to a plan that feels like yours."}
            </div>
            <div className="action-buttons">
              {step > 0 && (
                <button className="back-button" onClick={() => go(step - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step < 5 && (
                <button
                  disabled={
                    expenses > b.income || b.contribution <= 0 || b.goal <= 0
                  }
                  className="primary-button"
                  onClick={() => go(step + 1)}
                >
                  {
                    [
                      "Find my starting point",
                      "Set my goal",
                      "Explore my options",
                      "Try a difficult year",
                      "See my plan",
                    ][step]
                  }
                  <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>
          {(expenses > b.income || b.contribution <= 0 || b.goal <= 0) && (
            <p className="warning">
              To build a plan, enter a positive goal and a monthly contribution
              that fits your budget. You can return to Your month to adjust it.
            </p>
          )}
          <footer>
            <span>Built for your life, not just your money.</span>
            <span>Educational planning · No real money involved</span>
          </footer>
        </main>
      </div>
      {help && (
        <div className="modal-backdrop" onClick={closeHelp}>
          <section
            className="modal card"
            ref={helpRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Close help"
              onClick={closeHelp}
            >
              <X />
            </button>
            <div className="feature-icon">
              <Sprout />
            </div>
            <h2 id="help-title">A little clarity.</h2>
            <p>
              Someday helps you turn your monthly budget into a plan you
              understand. Use estimates, adjust any step, and explore what
              difficult markets could mean.
            </p>
            <p>
              Projections use monthly compounding with contributions at
              month-end. Returns are illustrative and exclude taxes and fees.
              Nothing here invests real money or guarantees a result.
            </p>
            <p>
              Your plan stays on this device only when you choose Save my plan.
              Clearing browser storage removes it.
            </p>
            {confirmReset ? (
              <div className="reset-confirmation">
                <h3>Start a new chapter?</h3>
                <p>
                  This removes your saved plan and check-in from this browser
                  and restores the sample budget. Download a summary first if
                  you want a copy.
                </p>
                <div>
                  <button
                    ref={resetCancelRef}
                    className="secondary-button"
                    onClick={() => {
                      setConfirmReset(false);
                      requestAnimationFrame(() =>
                        startFreshRef.current?.focus(),
                      );
                    }}
                  >
                    Keep my plan
                  </button>
                  <button
                    className="reset-confirm-button"
                    onClick={() => {
                      try {
                        localStorage.removeItem("someday-plan");
                        localStorage.removeItem("someday-reviewed");
                        setStoredPlan(null);
                        setReviewed(null);
                        setCheckIn(false);
                        setB(defaults);
                        setStorageError("");
                        setExported(false);
                        setResponse("continue");
                        setShowOptions(false);
                        go(0);
                        closeHelp();
                      } catch {
                        setStorageError(
                          "This browser couldn’t remove your saved plan. Your current numbers are unchanged.",
                        );
                        closeHelp();
                      }
                    }}
                  >
                    Reset my plan
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="secondary-button"
                ref={startFreshRef}
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw size={15} /> Start fresh
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
