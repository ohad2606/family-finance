---
name: takziv-design
description: Use this skill to generate well-branded interfaces and assets for Takziv (תקציב), the Hebrew-first family-finance app — for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static
HTML files for the user to view. If working on production code, you can copy assets and read the rules here
to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask
some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on
the need.

## Quick orientation

- **Brand:** Takziv (תקציב, "budget") — a calm, private, **Hebrew RTL** family-finance app.
  Promise: *הכסף שלך, בשליטה שלך* ("Your money, in your control").
- **Tokens:** link `styles.css` (it `@import`s `tokens/{fonts,colors,typography,spacing}.css`). Fonts are
  **Assistant** (UI/body) and **Heebo** (display + every ₪ figure), loaded from Google Fonts.
- **Palette:** sage `paper #E9EBE4`, off-white `card #F7F8F4`, forest `ink #1B2A27`, `brass #C9A23F` for
  action, `income #2F6B4F` / `expense #B0573C` for money. Brass is the only action color — use it sparingly.
- **Components:** `components/core/` — `Button, Card, MoneyAmount, Badge, Input, Select, Tabs, KindToggle,
  ProgressBar, SectionHeader, Logo`. Load `_ds_bundle.js`, read from `window.TakzivDesignSystem_57976b`.
- **UI kit:** `ui_kits/takziv-app/` — interactive app (login → dashboard → add transaction) + landing page.
- **Iconography:** no icon font. Use the logomark, **emoji** as category/status markers, and **unicode
  glyphs** (↑ ↓ ▲ ▼ › + · ←) for affordances. Never hand-draw decorative SVG.

Always set `dir="rtl"`, color money by semantics, set numerals in Heebo `tabular-nums`, keep corners soft
and shadows quiet, and write copy in a warm, second-person, household-first voice.
