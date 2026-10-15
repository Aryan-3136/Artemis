# Someday · The Honest Million

A complete frontend prototype for Artemis problem statement 1. Someday turns a beginner’s monthly budget into an understandable financial plan, then lets them practise living through uncertain markets.

Built with React, TypeScript, Vite and Lucide icons. All calculations, simulations, downloads and storage run in the browser. No backend, credentials, financial API, authentication or database is required.

## Open without installing anything

Download [Someday.html](https://raw.githubusercontent.com/Aryan-3136/Artemis/main/Someday.html), save it as **Someday.html**, then double-click the downloaded file to open it in Chrome, Edge, Firefox or Safari. If GitHub shows the file contents, use **Download raw file**. This single file contains the full interface, scripts, styles and icon; no ZIP extraction or installation is needed.

Browser storage availability for local files varies. If a browser blocks saving, the app explains this inline and the plan can still be downloaded or printed. Use a static web host for a consistent saved-plan origin across browser sessions.

Developers can regenerate the standalone file with `npm run build:standalone`.

## Start development

Use Node.js 22.18+ (Node.js 24 recommended).

```sh
npm ci
npm run dev
```

Start with Aarav’s example budget, edit it, or choose **Start blank**. Each screen also has a direct link, for example `?view=goal` or `?view=plan`. Refresh and browser Back/Forward preserve the current screen. Only explicitly saved financial inputs survive a refresh; scenario state is temporary.

## The complete journey

| Screen           | What works                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your month       | Income, spending categories, available budget, exact contribution input, presets, live spending breakdown, blank and overspending states             |
| Your safety net  | Existing savings, emergency target and progress, editable savings/investment split, debt and upcoming-expense guidance                               |
| Your someday     | ₹10 lakh default goal, custom amount, contribution/return chart, year slider, inflation view, annual contribution increase comparison                |
| Your money mix   | Editable growth/predictable allocation, five educational option cards, purpose filters, expandable details, two-option comparison                    |
| A difficult year | 30% growth-asset decline, remaining goal timeline impact, continue/pause/withdraw scenarios, weak/flat/growing future paths                          |
| Your plan        | Plain-language summary, monthly allocations, local save/restore, check-ins, downloadable summary, print/PDF layout, simulated portfolio and holdings |

The header distinguishes draft, saved and unsaved states. Edits do not overwrite the saved copy until **Save my plan** is selected. Returning users can review or restore their saved plan. **A little help → Start fresh** opens an in-app confirmation; cancellation preserves the plan. Blocked storage is explained inline and downloads remain available.

## Validation

```sh
npm test             # financial calculations, storage validation and URL helpers
npm run build        # TypeScript check and production bundle
npm run test:e2e     # complete journeys, responsive layout, storage, exports, keyboard and accessibility checks
npm run check        # all of the above
```

Browser checks use `/usr/bin/chromium` when available. Otherwise run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to your installed Chromium binary. Playwright starts Vite automatically if needed.

Automated accessibility scans cover the six screens, expanded comparisons, portfolio holdings and the mobile reset dialog. They supplement the keyboard and focus tests; they are not a certification of accessibility compliance. Responsive checks exercise every screen at 320px, 768px and 1440px.

## Static deployment

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static web host. Relative assets support hosting in a subdirectory. Navigation uses a query parameter, so a server-side route fallback is unnecessary. Serve the build over HTTP rather than opening its HTML directly from disk. No application server or environment variables are needed.

## Financial model and limits

- All amounts are in INR. ₹10 lakh is one million rupees, not US$1 million.
- Projections compound monthly with contributions at month-end. The editable blend uses illustrative 9% growth-asset and 4% predictable-asset annual return assumptions, with a 3% comparison scenario. No return or goal date is guaranteed.
- The inflation view uses an illustrative 5% annual rate. Taxes and fees are excluded. Emergency savings are separate from the long-term goal.
- The safety-net allocation remains fixed in projections. When the buffer is funded, revisit the allocation; nothing is automatically reinvested.
- The annual contribution increase exploration applies after every twelve contributions. It changes neither the saved plan nor the base goal chart. Future affordability is not assumed to be established.
- The downturn screen is a simplified shock to a fixed allocation, followed by alternative hypothetical paths. The timeline comparison assumes continued contributions and the displayed future rate; it does not promise recovery.
- Portfolio practice starts at zero, excludes existing emergency savings and uses a repeating illustrative monthly return sequence. A decline replaces the next growth return with −30%. Predictable holdings accrue simplified 4% annual interest monthly; emergency savings earn 0% in this demonstration. New contributions are added after the month’s return. Tax, fees, lock-in and withdrawals are excluded.
- Practice state resets when leaving the plan screen or changing its allocation. The practice view is not an account statement and represents no actual holdings.
- Exported summaries include current edits and model assumptions, excluding the temporary annual-increase comparison and practice simulation.

There are no real investments, external font requests or cloud synchronization. Local storage belongs to the current browser and clearing it removes the saved plan. General educational explanations are not personalized investment recommendations; review actual product terms before making a real financial decision.
