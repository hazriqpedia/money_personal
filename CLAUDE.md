# $ HQ — Claude Context

A browser-only personal finance planning dashboard. No backend, no auth. Everything runs in React, persisted to `localStorage`.

## Design philosophy

**Minimal, dark, and modern.** The entire UI is built on a `#09090b` (zinc-950) background. Surfaces use `zinc-900` / `zinc-800`. Text hierarchy: `zinc-100` (primary) → `zinc-300` (secondary) → `zinc-500` (muted). Interactive elements use subtle hover states — no heavy shadows, no gradients, no color accents. The only "bright" element is the white `bg-zinc-100` primary action button. When in doubt: less is more.

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
├── router.tsx                  # createBrowserRouter; routes derived from TABS + a separate /about route
├── index.css                   # Global styles + Tailwind import + @theme tokens
├── types/
│   ├── index.ts                 # Barrel — re-exports every domain type file
│   ├── agePlan.ts                # AgePlanEntry
│   ├── income.ts                 # IncomeEntry
│   ├── savings.ts                 # SavingsAccount
│   ├── loan.ts                     # Loan
│   ├── bills.ts                     # Bill
│   ├── subscription.ts               # Subscription
│   ├── tax.ts                         # TaxRecord
│   └── appData.ts                     # AppData (7 slices) + EMPTY_APP_DATA + hydrateAppData
├── store/
│   ├── context.ts               # createContext<AppDataContextType>(undefined)
│   ├── AppDataProvider.tsx      # Provider: localStorage sync, domain setters, updateAppData
│   ├── useAppData.ts            # Hook to access the context
│   └── AppDataProvider.test.tsx
├── config/
│   └── tabs.ts                  # TABS — single source of truth for nav AND routes
└── components/
    ├── Layout.tsx                 # Header (logo + nav from TABS, "|", About) + <Outlet/> + footer
    ├── EmptyTabPlaceholder.tsx    # Shared "Coming soon" stub panel
    ├── DashboardPage.tsx          # Cross-domain summary cards, year selector, backup export/import
    ├── AgePlanPage.tsx            # Stub
    ├── IncomePage.tsx             # Stub
    ├── SavingsPage.tsx            # Stub
    ├── LoanPage.tsx               # Stub
    ├── BillsPage.tsx              # Stub
    ├── SubscriptionPage.tsx       # Stub
    ├── TaxPage.tsx                # Stub
    └── AboutPage.tsx              # Informational page — intentionally not a TABS entry (see Routing)
```

## Data model

```ts
AppData
  ├── agePlan: AgePlanEntry[]        // { id, year, age, title, description? }
  ├── income: IncomeEntry[]           // { id, source, amount }
  ├── savings: SavingsAccount[]        // { id, name, balance }
  ├── loans: Loan[]                     // { id, name, principal }
  ├── bills: Bill[]                      // { id, name, amount }
  ├── subscriptions: Subscription[]       // { id, name, amount }
  └── taxRecords: TaxRecord[]              // { id, year, amountPaid }
```

`localStorage` key: `moneyPersonal_appData` (single JSON blob holding the whole `AppData` tree).

Domain types are intentionally minimal placeholders — do not over-design fields until a tab's real feature work begins.

## State management

All state lives in `AppDataProvider`. Read the whole tree via `appData`. Mutate a single domain via its scoped setter (`setIncome`, `setSavings`, `setLoans`, `setBills`, `setSubscriptions`, `setTaxRecords`, `setAgePlan`) — each replaces that domain's entire array, mirroring `money_splitter`'s `updateProject` pattern but scoped per-domain since there are 7 independent entities here instead of 1. `updateAppData(data)` is also available for whole-state operations — it's what backs the Dashboard's backup import (see below).

On load, a saved blob missing a key (older/partial schema) is merged against `EMPTY_APP_DATA` via `hydrateAppData()` so any missing domain safely defaults to `[]`. `hydrateAppData()` is shared between the provider's initial load and the Dashboard's backup-import handler — don't duplicate that merge logic inline elsewhere.

## Backup — export / import

`DashboardPage.tsx` has "Export backup" / "Import backup" controls (mirrors `money_splitter`'s Dashboard project export/import, just for the single unified `AppData` blob instead of per-project):

- **Export** downloads the current `appData` as `moneyPersonal_appData_backup_<YYYY-MM-DD>.json` via a `data:` URI — same browser-download mechanism as `money_splitter`, so it lands in Downloads, never in the repo.
- **Import** reads a chosen `.json` file, confirms with the user (it replaces *all* current data), then calls `updateAppData(hydrateAppData(parsed))` — `hydrateAppData` means an older/partial backup still loads safely.

This is the only place a JSON file representing personal data should ever exist on disk, and only transiently in the user's Downloads folder — see "Never commit personal financial data" below.

## Dashboard year scoping

The Dashboard has a year `<select>` (defaults to the current year, plus any years already present in `agePlan`/`taxRecords`). It filters **only** the Age & Plan and Tax Records cards, since `AgePlanEntry` and `TaxRecord` are the only domains with a `year` field. Income/Savings/Loan/Bills/Subscription always show all data regardless of the selected year — those tabs will get their own (non-year-based) filter mechanisms later, TBD. Don't add a `year` field to those domains just to make the Dashboard selector "consistent" — that was a deliberate decision, not an oversight.

## Routing

`src/config/tabs.ts` (`TABS`) is the single source of truth for the 8 financial domain tabs — each entry has `path`, `label`, `icon`, and the `Component` to render. `router.tsx` derives its route list directly from `TABS`, and `Layout.tsx` derives its nav links from the same array. **Adding a 9th domain tab = one entry in `TABS` plus one new component file** — never hand-write a `<NavLink>` or a route for one of the 8.

**About is deliberately not in `TABS`.** It's a single, fixed, non-domain page (mirrors `money_splitter`'s own About, which was never part of any tab-switching array either). `Layout.tsx` renders it after a `|` separator following the main tab list, and `router.tsx` adds its `/about` route as a sibling alongside the `TABS`-derived ones, not inside the array. If a second "meta" page is ever needed, follow the same pattern rather than forcing it into `TABS`.

## Roadmap (not yet built — scaffolded only)

- [x] Dashboard — year selector (Age & Plan + Tax only) and backup export/import
- [ ] Dashboard — real cross-domain aggregation (net worth, monthly cash flow, etc.)
- [ ] Income/Savings/Loan/Bills/Subscription — decide and build their own filter mechanism (not year-based)
- [ ] Age & Plan — timeline CRUD UI
- [ ] Income — entry CRUD UI
- [ ] Savings — account CRUD UI
- [ ] Loan — loan CRUD UI + amortization calculations
- [ ] Bills — recurring bill CRUD UI
- [ ] Subscription — subscription CRUD UI + renewal tracking
- [ ] Tax — tax record CRUD UI

## Key patterns

- **Conditional classes**: use `cn()` from `utils/cn.ts` — never string concatenation.
- **IDs**: always `uuidv4()` from the `uuid` package.
- **No backend**: never introduce server-side code, fetch calls to external APIs, or environment variables. This is intentional — the app is designed to be statically hosted.
- **No `components/ui/` primitives folder**: Tailwind utility classes are used directly and repeated rather than abstracted into Button/Card/Input components, matching `money_splitter`'s convention. `EmptyTabPlaceholder` is the one deliberate exception, since all 7 stub pages are structurally identical, not just visually similar.
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
