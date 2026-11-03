# תקציב · Takziv — Design System

**Takziv** (Hebrew: תקציב, "budget") is a **family financial-management app**. It gives a household one
calm, private place to track accounts, income and expenses, stick to a monthly budget, manage loans and
savings goals, and watch their net worth grow. The product is **Hebrew-first and right-to-left (RTL)**,
mobile-first, and built around a single guiding promise:

> **הכסף שלך, בשליטה שלך** — "Your money, in your control."

This design system captures Takziv's visual language, voice, foundations, reusable components, and full
product UI kit so that any new screen, slide, or marketing page reads unmistakably as Takziv.

---

## Sources

This system was reverse-engineered from the product's own frontend code. If you have access, explore these
to go deeper — the components and screens here mirror the real implementation:

- **GitHub:** `ohad2606/family-finance` — https://github.com/ohad2606/family-finance
  (the React + Vite frontend under `frontend/`, plus a FastAPI-style backend under `backend/`).

Key reference files inside that repo: `src/pages/LandingPage.jsx`, `src/pages/DashboardPage.jsx`,
`src/pages/LoginPage.jsx`, `src/components/HealthCard.jsx`, `src/components/DonutChart.jsx`,
`src/components/CashflowChart.jsx`, `src/components/AddTransactionSheet.jsx`, and `src/components/TakzivLogo.jsx`.
The app is built with React 19, React Router and TanStack Query; the entire UI is styled with **inline
style objects** (no CSS framework), which is why this system re-expresses those literal values as tokens.

> Note: the repo's `src/index.css` / `src/App.css` are leftover Vite-starter files (purple `--accent`,
> Vite hero) and are **not** part of Takziv's real design. They were ignored. The real palette lives in the
> page/component style objects.

---

## Products & surfaces

There is **one product** with two faces:

1. **Marketing / landing** — a public, centered marketing page: sticky nav, hero with a live phone mock,
   feature grid, dark stats strip, closing CTA, footer. (`src/pages/LandingPage.jsx`)
2. **The app** — an authenticated, mobile-width column: a dark net-worth hero, a financial-health score
   card, monthly income/expense summaries, an over-budget alert, recurring/cashflow/spending/savings/loans
   sections, account & transaction lists, a brass FAB, and bottom-sheet forms. Auth is a centered card with
   email/password tabs + "Continue with Google". (`src/pages/DashboardPage.jsx`, `LoginPage.jsx`, sheets)

The UI kit in `ui_kits/takziv-app/` recreates the authenticated app; foundation, component and brand cards
populate the Design System tab.

---

## CONTENT FUNDAMENTALS — how Takziv writes

Takziv's copy is **warm, plain, and reassuring**. It speaks to a household, not a "user." It never lectures
about money or shames overspending — it just states the situation clearly and offers the next step.

- **Language:** Hebrew, RTL. Translations should preserve the same calm, second-person-singular register.
- **Person & address:** Direct **second person, informal/singular** — "**הכסף שלך**" (your money),
  "**הגדר תקציב**" (set a budget), "**העלה קובץ**" (upload a file). It talks *to* you and *for* the family.
  The product itself is rarely the subject; the household is.
- **Tone:** Confident and gentle. Benefit-led, never feature-jargon. "תקציב עוזר לך ולמשפחתך לעקוב…"
  ("Takziv helps you and your family keep track…"). Reassurance is explicit: "ללא כרטיס אשראי"
  (no credit card), "פרטי — לא מוכרים נתונים" (private — we don't sell data).
- **Casing & punctuation:** Hebrew has no case. The one Latin device is a small **uppercase, letter-spaced
  eyebrow** above the hero ("ניהול פיננסי משפחתי"). Em-dashes and middots (`·`) separate meta
  ("עו״ש · אשראי"). Sentences are short; fragments are fine on cards.
- **Numbers & money:** Always formatted ₪ via `Intl.NumberFormat('he-IL', currency ILS)`, **no decimals**
  for balances ("₪127,430"). Signed amounts lead with **+ / −** and take income/expense color. Numerals are
  set in Heebo with `tabular-nums`.
- **Microcopy patterns:** Verbs as button labels ("שמור" save, "כניסה" sign-in, "הכל" all, "+ הוסף" add).
  Time is humanized ("היום" today, "מחר" tomorrow, "עוד 3 ימים" in 3 days). Empty states are encouraging,
  not blank ("אין תנועות עדיין" → "הוסף תנועה ראשונה" / add your first).
- **Emoji:** Used **functionally, sparingly**, as category/section markers (💰 🏠 🚗 🎓 🛟 🏦 👨‍👩‍👧) and
  as a ⚠ on the budget alert — never decoratively in body copy.
- **Vibe:** A trustworthy household ledger that happens to be beautiful. Editorial calm, not fintech hype.

---

## VISUAL FOUNDATIONS

**Overall mood.** Earthy, quiet, and grown-up. Takziv rejects the blue/purple fintech cliché for a
**sage-and-forest** palette warmed by **brass** and grounded by **terracotta**. It reads like fine
stationery: matte sage paper, off-white cards, deep-green ink.

**Color.**
- Surfaces: app sits on **sage paper `#E9EBE4`**; content rises on **off-white cards `#F7F8F4`**; the most
  important cards (net-worth, financial health) **invert to deep forest ink `#1B2A27`** with white text.
- Money is color-coded everywhere and consistently: **income = forest `#2F6B4F`**, **expense = terracotta
  `#B0573C`**. On dark cards these brighten to mint `#6EE7B7` / rose `#FCA5A5`.
- **Brass `#C9A23F`** is the single action/brand accent — CTAs, the FAB, "all/details" links, brand marks.
  Used sparingly so it always means "do this."
- Health/status badges use a soft fg-on-tint scale (excellent green, good teal, fair amber, poor terracotta).
- Charts use a 10-step categorical palette led by forest and brass.

**Type.** Two Hebrew families. **Assistant** (400/600/700) is the UI & body face. **Heebo** (700/900) is the
display face — every heading, the logotype, and **every monetary figure**, always `tabular-nums`. Display
text is heavy (900) and slightly tight; body is 1rem with generous 1.6 line-height. A small uppercase
letter-spaced eyebrow is the only flourish.

**Spacing & layout.** Mobile-first. The app is a centered column maxing at **560px**; marketing content
bands at **1000px**; the auth card at **380px**. Screen padding is **1.25rem**; sections stack with **1rem**
gaps; paired summary cards sit **0.75rem** apart. Generous internal padding (1–1.5rem) keeps cards calm.

**Corners & cards.** Everything is softly rounded — inputs/tiles **12px**, feature/summary cards **16px**,
hero & net-worth cards **20px**, the auth card & bottom-sheet top **22px**, the FAB fully round. A card is a
fill + radius + (usually) **no border** — separation comes from the paper/card contrast. The exceptions:
summary cards take a **3px colored top-border** (income/expense), and a few list tiles use a 1px `--line`
divider between rows rather than boxes.

**Borders & dividers.** Hairline **`#D5D8CF`** for field borders and the row dividers inside lists. The dark
cards use translucent-white insets (`rgba(255,255,255,0.07)`) instead of borders.

**Shadows.** Mostly absent — the palette does the lifting. Three quiet levels exist: a soft card shadow
`0 2px 16px rgba(27,42,39,.08)` (auth), a float `0 20px 40px rgba(27,42,39,.18)` (hero phone), and the one
expressive shadow, the **brass CTA/FAB glow** `0 4px 16px rgba(201,162,63,.35)`. No inner shadows.

**Backgrounds.** Flat color only — **no gradients, no photographic hero, no patterns or textures**. Depth is
the paper→card→ink stack. The dark stats strip and dark cards provide contrast moments.

**Imagery.** Essentially none. The "hero image" is a built-from-divs **phone mock** showing a real app
screen. There is no stock photography. Keep imagery, if ever added, warm and muted to match the paper.

**Charts.** Hand-built SVG: a donut (spending by category, with center label + legend), grouped bars
(6-month cashflow, income vs expense), a sparkline (12-month net worth), and a conic/stroke **score ring**
(0–100 financial health). All chart SVGs flip to `dir="ltr"` internally so axes read left→right even on RTL
pages. Bars/slices sit at ~0.85–0.9 opacity.

**Motion.** Restrained. `transition: width 0.4s ease` on progress/goal bars; `0.3s` border/box-shadow on
hover. No bounces, no parallax, no entrance choreography. Calm and instant.

**Interaction states.** Hover lifts a link with the soft shadow or reveals a border-color; the brass CTA
keeps its glow. Active/press is not exaggerated. Inputs show a brass/ink outline on focus. Toggle/tab
"active" = fill flips to ink (white text) or to income/expense for the transaction-kind switch.

**Transparency & blur.** Used only for the modal **scrim** `rgba(27,42,39,0.40)` behind bottom sheets, and
the translucent-white tiles/tracks on dark cards. No backdrop-blur glass.

**Fixed elements.** Sticky top header (card bg + hairline bottom border). A round brass **FAB** pinned
bottom-end. Forms arrive as **bottom sheets** that slide up from the bottom edge with a grab handle.

---

## ICONOGRAPHY

Takziv has **no icon font and no SVG icon set** of its own. Its iconography is deliberately lightweight:

- **The brand mark** is the one bespoke SVG: a forest-green rounded square holding a brass roof triangle over
  a brass-outlined ledger box with a **₪** inside (see `assets/logomark.svg`). It reads as "home + money."
- **Emoji** are the functional icon system, used sparingly as category/section markers and status cues:
  💰 (savings rate), 🛟 (runway), 🏦 (debt), 🏠 🚗 🎓 💳 📄 (loan types), 👨‍👩‍👧 (family), ⚠ (over-budget alert),
  ◑ ◎ ↺ ◉ ⬆ (landing feature glyphs).
- **Unicode geometric glyphs** stand in for UI affordances: `↑ ↓` (assets/liabilities), `▲ ▼` (trend),
  `›` (chevron / drill-in), `+` (add / FAB), `←` (back), `·` (meta separator).
- There is **no Lucide/Heroicons/Feather dependency.** Do not introduce a stroke-icon set to "upgrade" the
  UI — it would break the brand's plain, typographic character. If a future surface genuinely needs line
  icons, match Takziv's weight by reaching for a **single** restrained set and flag the addition.
- The favicon/PWA icon is the logomark on the forest-green tile.

**When building Takziv artifacts:** use the logomark for brand moments, emoji for categories/status, and
unicode glyphs for arrows/chevrons. Never hand-draw decorative SVG illustrations — the system is
illustration-free by design.

---

## CAVEATS / SUBSTITUTIONS

- **Fonts** (Assistant, Heebo) are loaded from **Google Fonts** via `tokens/fonts.css`, exactly as the
  source app does — these are the real families, not substitutes. They require network access at render time.
- The repo shipped no standalone logo file; `assets/logomark.svg` is lifted verbatim from the app's
  `favicon.svg` (identical to the in-app `TakzivLogo` component).

---

## INDEX — what's in this system

**Foundations (root)**
- `styles.css` — the single entry point consumers link (a manifest of `@import`s).
- `tokens/fonts.css` · `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` — all tokens.
- `assets/logomark.svg`, `assets/icon-512.svg` — brand marks.

**Specimen cards** (Design System tab) — under `guidelines/`: color, type, spacing, and brand cards.

**Components** (`components/`) — reusable React primitives, each with `.jsx` + `.d.ts` + `.prompt.md` and a
directory card:
- `core/` — `Button`, `Card`, `Badge`, `StatusBadge`, `Input`, `Select`, `Tabs`, `KindToggle`, `ProgressBar`,
  `MoneyAmount`, `SectionHeader`, `Logo`.

**UI kit** (`ui_kits/takziv-app/`) — interactive recreation of the authenticated app + landing, composed
from the component primitives. Entry: `ui_kits/takziv-app/index.html`.

**Skill** — `SKILL.md` makes this folder usable as a downloadable Agent Skill.
