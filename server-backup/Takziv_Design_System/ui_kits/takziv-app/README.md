# Takziv — App UI kit

A high-fidelity, interactive recreation of the **Takziv** family-finance product, composed from the design
system's own components (`window.TakzivDesignSystem_57976b`) and a small set of hand-built SVG charts.

## Surfaces

| File | What it is |
|---|---|
| `index.html` | The **authenticated app**, in a phone frame. Interactive flow: **login → dashboard → add transaction**. The brass FAB (and the "+ הוסף" action) opens the bottom sheet; submitting prepends a new transaction. "יציאה" returns to login. |
| `landing.html` | The **marketing landing page** — sticky nav, hero with a live phone mock, feature grid, dark stats strip, closing CTA and footer. |

## Files

- `data.jsx` — mock household data (`window.TAKZIV_DATA`): summary, net-worth history, health, cashflow,
  spending, savings goals, loans, accounts, transactions.
- `charts.jsx` — `ScoreRing`, `NetWorthSparkline`, `CashflowChart`, `DonutChart` (+ `fmtILS`), all `dir="ltr"`
  internally so axes read left→right on the RTL page.
- `screens.jsx` — `LoginScreen`, `Dashboard`, `HealthCard`, `AddTxSheet`.
- `index.html` / `landing.html` — wire React + Babel + the design-system bundle + the above.

## Composition notes

- Buttons, cards, money figures, badges, inputs, selects, tabs, the kind-toggle, progress bars and the logo
  all come from the **design-system components** — the kit never re-implements them.
- Charts are intentionally local: they are product-specific visualizations, not reusable primitives.
- Everything is **Hebrew / RTL**; currency is ₪ via `Intl.NumberFormat('he-IL')`, income = forest,
  expense = terracotta, on dark cards they brighten to mint / rose.

> Recreation only — no real backend. It mirrors `src/pages/DashboardPage.jsx`, `LoginPage.jsx`,
> `LandingPage.jsx` and the chart/sheet components from `ohad2606/family-finance`.
