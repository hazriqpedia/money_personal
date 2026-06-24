# $ HQ — Claude Context

A browser-only personal finance planning dashboard. No backend, no auth. Everything runs in React, persisted to `localStorage`.

## Design philosophy

**Minimal, dark, and modern.** The entire UI is built on a `#09090b` (zinc-950) background. Surfaces use `zinc-900` / `zinc-800`. Text hierarchy: `zinc-100` (primary) → `zinc-300` (secondary) → `zinc-500` (muted). Interactive elements use subtle hover states — no heavy shadows, no gradients, no color accents. The only "bright" element is the white `bg-zinc-100` primary action button — plus `DonutChart`'s muted slice palette (`index.css`'s `--color-primary`/`--color-success`/`--color-danger`/`--color-chart-*` tokens), a deliberate, narrow exception since a pie/donut chart's entire purpose requires distinguishable slice colors. When in doubt: less is more.

This is a sibling project to `money_splitter` — same tooling, same visual system, different domain (personal finance planning instead of bill splitting).

## Dev commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at `http://localhost:5174` |
| `npm run build` | TypeScript check + Vite production build → `dist/` |
| `npm run preview` | Serve the `dist/` build at `http://localhost:4174` |
| `npm run lint` | ESLint check |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run (CI) |

VS Code quick launch — two options:
- **Run & Debug** (`Cmd+Shift+D`): select `Dev Server + Chrome` compound — starts Vite and opens Chrome with full source-map debugging attached
- **Tasks** (`Cmd+Shift+P → Tasks: Run Task`): `Dev Server` + `Open Dev in Safari` if you prefer Safari; `Preview Build` for a production preview

**Ports are pinned, not Vite's defaults.** `vite.config.ts` sets `server.port: 5174` / `preview.port: 4174` with `strictPort: true`, so the dev server fails loudly instead of silently shifting ports if 5174 is taken — important since this app is meant to run alongside `money_splitter` (pinned to 5173/4173) without either one's URL silently changing and breaking a bookmark.

## Stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite` — no `tailwind.config.js` needed)
- react-router v7 (`createBrowserRouter`) for tab navigation
- `@fontsource/inter` for self-hosted Inter font
- `uuid` for all IDs
- `clsx` + `tailwind-merge` for conditional class merging
- `lucide-react` for icons

## File layout

```
src/
├── App.tsx                     # Root — AppDataProvider wraps RouterProvider
├── main.tsx                    # React entry point; imports Inter font weights + index.css
├── router.tsx                  # createBrowserRouter; routes derived from TABS + separate /about + /profile routes
├── index.css                   # Global styles + Tailwind import + @theme tokens
├── types/
│   ├── index.ts                 # Barrel — re-exports every domain type file
│   ├── agePlan.ts                # AgePlanNote, PlanItem, AgePlanEntry
│   ├── income.ts                 # IncomeEntry
│   ├── spendingPlan.ts            # SpendingItem — shared by spendingPlan, savingsPlan, and CreditCardSpending.items
│   ├── creditCard.ts               # CreditCardSpending
│   ├── savings.ts                 # SavingsAccountConfig, SavingsBalanceEntry, SavingsSnapshot
│   ├── epf.ts                      # EpfEntry
│   ├── gold.ts                      # GoldMode, GoldEntry
│   ├── loan.ts                     # Loan
│   ├── bills.ts                     # Bill
│   ├── subscription.ts               # Subscription
│   ├── tax.ts                         # TaxRecord
│   ├── profile.ts                      # Profile (singleton — not a domain array, see Data model)
│   └── appData.ts                       # AppData (profile + 13 domain slices) + EMPTY_APP_DATA + hydrateAppData
├── store/
│   ├── context.ts               # createContext<AppDataContextType>(undefined)
│   ├── AppDataProvider.tsx      # Provider: localStorage sync, domain setters, updateAppData
│   ├── useAppData.ts            # Hook to access the context
│   └── AppDataProvider.test.tsx
├── config/
│   └── tabs.ts                  # TABS — single source of truth for nav AND routes
├── utils/
│   ├── cn.ts                    # clsx + tailwind-merge helper
│   ├── age.ts                    # ageForYear(dateOfBirth, year) — shared by ProfilePage + AgePlanPage
│   ├── income.ts                  # computeIncrement, formatIncrement, computeDifference — Income tab's read-only computed columns
│   ├── savings.ts                  # getBalance, computeRowTotal, computeSavingsOnlyTotal, computeSavingsOnlyDifference, isWithdrawal — Savings accounts table's computed columns + withdrawal indicator
│   ├── gold.ts                      # computeTotalWeight, computeGapWeight, computeGapAverage, computeTotalCost — Gold tab's summary stats + Dashboard's Gold card
│   └── currency.ts                 # formatCurrency(value, symbol) — freeform symbol, not an ISO currency code
└── components/
    ├── Layout.tsx                 # Header (logo + nav from TABS, "|", Profile icon, About) + <Outlet/> + footer
    ├── EmptyTabPlaceholder.tsx    # Shared "Coming soon" stub panel
    ├── BackupControls.tsx          # Shared export/import buttons — used by Dashboard and Profile
    ├── DashboardPage.tsx          # Cross-domain summary cards, year selector, <BackupControls/>
    ├── AgePlanPage.tsx            # Year/Age/Happened/Plan CRUD table (see Age & Plan below)
    ├── AgePlanItemList.tsx         # Reusable inline-editable list for the Happened/Plan columns
    ├── ProfilePage.tsx             # Settings: DOB, currency symbol, budget split %, credit card identities + <BackupControls/>
    ├── IncomePage.tsx             # Year/Monthly/Annually/Increment/Gross/Difference CRUD table + spending/savings/credit-card breakdowns + balance
    ├── SpendingItemList.tsx        # Reusable inline-editable {id, name, amount} list — spending plan, savings plan, each credit card
    ├── DonutChart.tsx               # Generic SVG donut/pie chart — main breakdown, savings breakdown, per-card breakdown, latest savings-accounts breakdown
    ├── FormattedNumberInput.tsx      # Comma-formatted on blur, raw digits while focused — Income table's Monthly/Annually/Gross + SpendingItemList's amount + Savings/EPF/Gold tables
    ├── SavingsPage.tsx            # Savings accounts (configurable, date-row check-ins) + EPF + Gold CRUD tables, Dashboard-linked summary cards
    ├── LoanPage.tsx               # Stub
    ├── BillsPage.tsx              # Stub
    ├── SubscriptionPage.tsx       # Stub
    ├── TaxPage.tsx                # Stub
    └── AboutPage.tsx              # Informational page — intentionally not a TABS entry (see Routing)
```

## Data model

```ts
AppData
  ├── profile: Profile                // { dateOfBirth, currencySymbol, budgetSplit: { needs, wants, savings }, creditCards: { id, name }[] } — singleton, not an array
  ├── agePlan: AgePlanEntry[]        // { id, year, age, happened: AgePlanNote[], plans: PlanItem[] }
  │                                    // AgePlanNote = { id, text }; PlanItem = AgePlanNote & { done }
  ├── income: IncomeEntry[]           // { id, year, label, monthly, annually, gross, isPrimary } — increment/difference are computed, not stored (see utils/income.ts)
  ├── spendingPlan: SpendingItem[]     // { id, name, amount } — Income tab's main "Monthly Spending" list, NOT scoped per year
  ├── savingsPlan: SpendingItem[]       // { id, name, amount } — Income tab's "Savings" breakdown. NOT the same domain as `savingsAccounts`/`savingsSnapshots` below — same English word, two unrelated concepts (this is a monthly contribution breakdown; `savingsAccounts`/`savingsSnapshots` are real account balance history)
  ├── creditCardSpending: CreditCardSpending[] // { cardId, items: SpendingItem[] } — one entry per profile.creditCards card, lazily created on first edit
  ├── savingsAccounts: SavingsAccountConfig[] // { id, name, category: 'savings' | 'investment' } — user-configured accounts, local to the Savings tab (not in Profile, since nothing else references them)
  ├── savingsSnapshots: SavingsSnapshot[]      // { id, date, balances: { accountId, balance }[] } — one row per check-in date, sparse balances (see Savings accounts below)
  ├── epfEntries: EpfEntry[]                    // { id, date, account1, account2, account3, monthlySavings } — total is computed live, not stored
  ├── goldEntries: GoldEntry[]                   // { id, dateBought, mode: 'GAP' | 'Normal' | 'Wealth Card', weight, price } — price is the TOTAL paid for the lot, not a per-gram rate
  ├── loans: Loan[]                     // { id, name, principal }
  ├── bills: Bill[]                      // { id, name, amount }
  ├── subscriptions: Subscription[]       // { id, name, amount }
  └── taxRecords: TaxRecord[]              // { id, year, amountPaid }
```

`localStorage` key: `moneyPersonal_appData` (single JSON blob holding the whole `AppData` tree).

Domain types are intentionally minimal placeholders — do not over-design fields until a tab's real feature work begins. `AgePlanEntry`, `Profile`, and `IncomeEntry` are the first three to graduate past that placeholder stage; the rest still are.

`AgePlanEntry.age` is a stored field, not a live-computed one — it auto-fills from `profile.dateOfBirth` (`Year − birth year`, via `utils/age.ts`'s `ageForYear`) whenever a row's `year` is set or changed, but stays a normal editable number input so it still works with no profile set, and can be overridden per row. Editing the DOB later does **not** retroactively recompute existing rows — only new rows or rows whose `year` you re-touch get the fresh value. This matches most of the app, where every field is a plain stored value with nothing derived live at render time.

`IncomeEntry`'s `increment` (year-over-year % change in `annually`) and `difference` (year-over-year **$** change in `gross` — the dollar-amount counterpart to `increment`'s percentage) are the deliberate exception to that pattern — they're **not** stored fields at all, computed live by `utils/income.ts`'s `computeIncrement`/`computeDifference` (both take the sorted-by-year array + an index, returning `null` — rendered as "—" — for the first row) every render, because the user wants them always-accurate and read-only rather than an independently-overridable snapshot like `age` is. `monthly`/`annually` are linked manual inputs (editing either one recomputes the other, ×12/÷12, in the same update); `gross` is a pure independent manual input.

**A year can have 2+ `IncomeEntry` rows** (e.g. a mid-year raise: a Jan entry at the old salary plus a second entry from the raise onward) — `IncomeEntry.isPrimary` flags which one is "current" for that year, resolved via `utils/income.ts`'s `pickPrimaryEntry(entries, year)` (prefers the flagged entry, falls back to the first match so a lone entry needs no flag at all). Both `IncomePage`'s Balance and `DashboardPage`'s Income card resolve the selected/current year through this helper rather than a plain `.find()`. `IncomePage.tsx`'s `handleYearChange` auto-promotes a row to primary (and demotes whichever row it now collides with) whenever editing `year` creates a duplicate — the just-edited row is assumed to be the live one — and an "Active" radio column appears in the table, but **only** when the *current* year specifically has 2+ rows (not other years), letting the user override the default pick. `computeIncrement`/`computeDifference` are unaffected by any of this — they walk the sorted list positionally regardless of duplicates, so comparing a mid-year raise against the start-of-year entry for that same year is intentional, not a bug.

**Savings accounts are a date-rows × account-columns table, the transpose of a typical spreadsheet layout.** Each `SavingsSnapshot` is one check-in date (irregular cadence, not monthly-aligned) holding a *sparse* `balances` array — not every configured `SavingsAccountConfig` needs an entry on every snapshot, mirroring `CreditCardSpending`'s lazy-per-card-items pattern. This shape (rows = dates, dynamic columns = accounts) was a deliberate choice over a literal accounts-as-rows/dates-as-columns matrix, since every other table in this app adds new *rows* for new entries, never new columns. `SavingsPage.tsx` computes three trailing columns live per row via `utils/savings.ts` — `computeRowTotal` (all accounts), `computeSavingsOnlyTotal` (only `category: 'savings'` accounts, excluding `'investment'`-tagged ones), and `computeSavingsOnlyDifference` (period-over-period change in that savings-only total, `null`/"—" for the first row, same pattern as `computeIncrement`/`computeDifference`) — plus a per-cell `isWithdrawal` check that renders `text-red-400` whenever a cell's balance dropped from the same account's previous row (the app's only other red-only indicator precedent, no green-for-increase). Removing a configured account does **not** cascade-clean its `accountId` out of past snapshots' `balances` — intentionally consistent with `Profile.creditCards` removal already leaving stale `creditCardSpending` entries behind.

**Gold's `mode` field is a closed set** (`'GAP' | 'Normal' | 'Wealth Card'`), not free text, because `utils/gold.ts`'s `computeGapWeight`/`computeGapAverage` match on the literal string `'GAP'` — a typo-prone free-text field would silently break that math. `GAP` means gold the user owns under a scheme but doesn't hold physically (vs. `Normal`/`Wealth Card`, which are physically held). `GoldEntry.price` is the **total** amount paid for that purchase lot, not a per-gram rate. `computeGapAverage` averages `price / weight` *per entry* (price-per-gram) rather than averaging raw `price`, since that would be meaningless once lot weights differ.

## State management

All state lives in `AppDataProvider`. Read the whole tree via `appData`. Mutate a single domain via its scoped setter (`setIncome`, `setSavingsAccounts`, `setSavingsSnapshots`, `setEpfEntries`, `setGoldEntries`, `setLoans`, `setBills`, `setSubscriptions`, `setTaxRecords`, `setAgePlan`, `setProfile`) — each replaces that domain's entire value, mirroring `money_splitter`'s `updateProject` pattern but scoped per-domain since there are independent entities here instead of 1. `setProfile` replaces the whole `Profile` object (it's a singleton, not an array) rather than a single array like the others. `updateAppData(data)` is also available for whole-state operations — it's what backs the backup import (see below).

On load, a saved blob missing a key (older/partial schema) is merged against `EMPTY_APP_DATA` via `hydrateAppData()` so any missing domain safely defaults to `[]`. `hydrateAppData()` is shared between the provider's initial load and the Dashboard's backup-import handler — don't duplicate that merge logic inline elsewhere.

`profile` is the one key that gets a deeper merge instead of a shallow top-level replace: `hydrateAppData()` merges `profile` (and `profile.budgetSplit` one level deeper) field-by-field against `EMPTY_APP_DATA.profile`, so an old backup with just `{ profile: { dateOfBirth } }` still gets `currencySymbol`/`budgetSplit`/`creditCards` defaults instead of losing them. Every other key (the array domains) stays a shallow top-level replace-if-present.

## Backup — export / import

`components/BackupControls.tsx` is a shared component rendering "Export backup" / "Import backup" controls, used on both `DashboardPage.tsx` and `ProfilePage.tsx` (mirrors `money_splitter`'s Dashboard project export/import, just for the single unified `AppData` blob instead of per-project). Don't duplicate this JSX/logic inline on a page — import the component.

- **Export** downloads the current `appData` (the *entire* tree, including `profile`) as `moneyPersonal_appData_backup_<YYYY-MM-DD>.json` via a `data:` URI — same browser-download mechanism as `money_splitter`, so it lands in Downloads, never in the repo.
- **Import** reads a chosen `.json` file, confirms with the user (it replaces *all* current data), then calls `updateAppData(hydrateAppData(parsed))` — `hydrateAppData` means an older/partial backup still loads safely (e.g. one taken before `profile.currencySymbol`/`budgetSplit` existed gets those fields backfilled via a deep-merge of `profile`, not a wholesale default-on-missing-key; see State management above).

This is the only place a JSON file representing personal data should ever exist on disk, and only transiently in the user's Downloads folder — see "Never commit personal financial data" below.

## Dashboard year scoping

The Dashboard has a year `<select>` (defaults to the current year, plus any years already present in `agePlan`/`taxRecords`/`income`). It filters the Age & Plan, Income, and Tax Records cards, since `AgePlanEntry`, `IncomeEntry`, and `TaxRecord` are the domains with a `year` field. Savings/Loan/Bills/Subscription always show all data regardless of the selected year — those tabs will get their own (non-year-based) filter mechanisms later, TBD. Don't add a `year` field to those domains just to make the Dashboard selector "consistent" — that was a deliberate decision, not an oversight. The new Savings Accounts/EPF/Gold cards (below) follow this same convention: despite `SavingsSnapshot`/`EpfEntry`/`GoldEntry` having real dates, the Dashboard cards always show the *latest* entry by date rather than filtering by `selectedYear`.

The Dashboard's Income card shows the matching year's `gross` plus the three `gross × profile.budgetSplit.{needs,wants,savings} / 100` amounts (or a "No income entry for {year}" fallback). It does **not** show the Income tab's Balance/Total CC figures — those stay Income-tab-only.

The Savings figure inside the Income card is the one deliberate exception to "no color accents" on the Dashboard: it shows the *actual* `savingsPlan` total (not the target), colored `text-red-400` whenever that's below the `gross × savings%` target, with the target shown as a small caption underneath. Needs/Wants stay plain targets with no color logic — there's no "actual Needs/Wants spending" tracked anywhere (`spendingPlan` items aren't tagged by category), so only Savings has a real figure to compare against. This is an unrelated figure from the separate **"Savings Accounts"** card described below — same English word, two different concepts, deliberately titled differently to avoid confusion.

Three more bespoke cards sit below the Income card: **"Savings Accounts"** (latest `SavingsSnapshot`'s `computeRowTotal`/`computeSavingsOnlyTotal`), **"EPF"** (latest `EpfEntry`'s `account1+account2+account3` total and `monthlySavings`), and **"Gold"** (`computeTotalWeight`/`computeGapWeight`/`computeTotalCost` across all `goldEntries` — labeled "Total Spent", explicitly a cost-basis figure, never a live market value, since fetching a real-time gold price would require an external API call, which this app never does).

## Routing

`src/config/tabs.ts` (`TABS`) is the single source of truth for the 8 financial domain tabs — each entry has `path`, `label`, `icon`, and the `Component` to render. `router.tsx` derives its route list directly from `TABS`, and `Layout.tsx` derives its nav links from the same array. **Adding a 9th domain tab = one entry in `TABS` plus one new component file** — never hand-write a `<NavLink>` or a route for one of the 8.

**About and Profile are deliberately not in `TABS`.** They're fixed, non-domain pages (About mirrors `money_splitter`'s own About, which was never part of any tab-switching array either). `Layout.tsx` renders both after a `|` separator following the main tab list — Profile first (an icon-only `NavLink` using `User` from `lucide-react`), then About (text) — and `router.tsx` adds `/profile` and `/about` as sibling routes alongside the `TABS`-derived ones, not inside the array. If a third "meta" page is ever needed, follow the same pattern rather than forcing it into `TABS`.

**Profile's nav link is the first icon-only element in the nav.** Every other nav link (the 8 `TABS` entries plus About) is text-only — `TabConfig.icon` exists on the type but Layout never actually renders it. Profile's icon button reuses the same active-state `cn()` pattern (`text-zinc-100` active vs a muted/hover color otherwise), just applied to the icon's color instead of text.

## Roadmap (not yet built — scaffolded only)

- [x] Dashboard — year selector (Age & Plan + Tax only) and backup export/import
- [x] Profile — date of birth input, used to auto-derive Age & Plan's Age column
- [x] Age & Plan — timeline CRUD UI (Year/Age/Happened/Plan table, with done-toggle + strikethrough on Plan items)
- [ ] Dashboard — real cross-domain aggregation (net worth, monthly cash flow, etc.)
- [ ] Savings/Loan/Bills/Subscription — decide and build their own filter mechanism (not year-based)
- [x] Income — Year/Monthly/Annually/Increment/Gross/Difference table, monthly spending plan, savings breakdown, per-credit-card breakdown (configured in Profile), auto-balance
- [x] Savings — account CRUD UI (date-rows × account-columns, category-based totals, withdrawal indicator), EPF table, Gold table, Dashboard cards
- [ ] Loan — loan CRUD UI + amortization calculations
- [ ] Bills — recurring bill CRUD UI
- [ ] Subscription — subscription CRUD UI + renewal tracking
- [ ] Tax — tax record CRUD UI

## Key patterns

- **Conditional classes**: use `cn()` from `utils/cn.ts` — never string concatenation.
- **IDs**: always `uuidv4()` from the `uuid` package.
- **No backend**: never introduce server-side code, fetch calls to external APIs, or environment variables. This is intentional — the app is designed to be statically hosted.
- **No `components/ui/` primitives folder**: Tailwind utility classes are used directly and repeated rather than abstracted into Button/Card/Input components, matching `money_splitter`'s convention. `EmptyTabPlaceholder`, `BackupControls`, `AgePlanItemList`, `SpendingItemList`, `DonutChart`, and `FormattedNumberInput` are the deliberate exceptions — each one is reused by 2+ structurally identical call sites (not just visually similar ones), not a speculative abstraction. `SpendingItemList` backs the spending plan, savings plan, and every configured credit card's breakdown; `DonutChart` backs the main/savings/per-card breakdown charts plus the Savings tab's latest-balances breakdown; `FormattedNumberInput` backs every dollar-amount input across the Income table, `SpendingItemList`, and the Savings/EPF/Gold tables. The Savings tab's own account-config list, category toggle, and three tables stay inline in `SavingsPage.tsx` — each has only one call site, so they don't earn a separate file.
- **Comma-formatted number inputs**: native `<input type="number">` cannot display formatted text (e.g. `11,000`) — browsers strip non-digit characters. `FormattedNumberInput` works around this by rendering `type="text"` with `inputMode="decimal"`: shows the comma-formatted value while unfocused, swaps to the raw digit string on focus (so editing isn't fighting a formatted cursor position), and parses commas back out on every keystroke before calling `onChange` with a plain `number`. Use it for any editable dollar amount; plain `<input type="number">` is still fine for non-currency fields like Year or budget-split percentages.
- **Tab navigation**: data-driven from `TABS` in `src/config/tabs.ts` (see Routing above).

## Development workflow

After completing any feature, bug fix, or non-trivial change:

1. **Run tests** — `npm run test:run`. All tests must pass before considering the task done.
2. **Run lint** — `npm run lint`. Fix any lint errors before finishing.
3. **TypeScript check** — `npm run build` catches type errors. Run it if you touched types or added new files.

Never report a task as complete if tests or lint are failing.

## Things to watch out for

- Tailwind v4 uses a CSS-first config (no JS config file). Add custom tokens directly in `index.css` with `@theme`.
- `store/context.ts` is kept separate from `store/AppDataProvider.tsx` so `eslint-plugin-react-refresh`'s fast-refresh rule doesn't flag a file exporting both a component and a non-component value.
- `--font-sans` is overridden in `index.css`'s `@theme` block to match `body`'s `'Inter', ...` stack. Without this, any element using Tailwind's `font-sans` utility class (e.g. `Layout.tsx`'s root div) resolves to Tailwind's own default `ui-sans-serif` stack instead of inheriting `body`'s font, silently undoing the Inter font load — this was verified by actually rendering the app and checking the platform font used, not just by reading the CSS. Don't remove the `--font-sans` override without re-verifying rendered text actually uses Inter.
- **Never commit personal financial data.** `AppData` lives in `localStorage`; the only JSON file that can exist on disk is a backup exported from the Dashboard, and it must always go through the browser's own download flow (Downloads folder) — never get saved into the repo. `.gitignore` defends against `/backups/`, `*.backup.json`, and `moneyPersonal_appData*.json` (which the real export filename matches) in case one ever ends up in the project folder.
