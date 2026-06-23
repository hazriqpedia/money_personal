# $ HQ

> A private, browser-only personal finance planning dashboard.

A single place to plan one person's finances — income, savings, loans, bills, subscriptions, and tax — all in one dark, minimal, no-frills app that runs entirely in your browser.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

---

## Status

This repo is currently a **scaffold**. Navigation, theming, and the data-persistence layer are wired up; the tabs below are stub pages until each one gets built out.

## Planned tabs (roadmap)

- **Dashboard** — pulls a summary view from every other tab. Already has a year selector (filters the Age & Plan and Tax cards; other tabs show all data) and backup export/import.
- **Age & Plan** — your age/year timeline of what happened and what's planned
- **Income**
- **Savings**
- **Loan**
- **Bills**
- **Subscription**
- **Tax**

All currently scaffolded as stub pages — full functionality coming soon.

---

## Quickstart (for developers)

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5174 — fixed port, runs alongside money_splitter on 5173)
npm run dev
```

```bash
# Production build
npm run build

# Preview the production build
npm run preview
```

No environment variables or backend setup needed.

---

## Tech stack

| Layer           | Choice                |
| --------------- | ---------------------- |
| Framework       | React 19                |
| Language        | TypeScript 6             |
| Build tool      | Vite 8                    |
| Styling         | Tailwind CSS v4             |
| Routing         | react-router v7              |
| Fonts           | Inter (self-hosted via `@fontsource/inter`) |
| Icons           | lucide-react              |
| Class utilities | clsx + tailwind-merge        |
| ID generation   | uuid                           |

---

## Code structure

```
src/
├── App.tsx                  # Root — wraps the router in AppDataProvider
├── router.tsx                # Route table, derived from config/tabs.ts
├── config/tabs.ts             # Single source of truth for nav + routes
├── types/                      # Domain types, one file per tab + AppData
├── store/                       # AppDataProvider + localStorage persistence
└── components/                   # Layout chrome + one component per tab
```

### Data model

```ts
AppData
  ├── agePlan: AgePlanEntry[]
  ├── income: IncomeEntry[]
  ├── savings: SavingsAccount[]
  ├── loans: Loan[]
  ├── bills: Bill[]
  ├── subscriptions: Subscription[]
  └── taxRecords: TaxRecord[]
```

State lives in `AppDataProvider`. Read the whole tree via `appData`; mutate a single domain via its scoped setter (`setIncome`, `setSavings`, etc.). Persisted to `localStorage` under `moneyPersonal_appData`.

### Backup

Your data lives only in your browser's `localStorage` — nothing is ever written to a file on disk by default. The Dashboard has **Export backup** / **Import backup** buttons that download/restore the whole data set as a `.json` file via your browser's normal download flow. This file may contain personal financial data — keep it out of version control and anywhere else you wouldn't put a bank statement.

---

## Contributing

Keep changes minimal and consistent with the existing dark, no-frills design language.

---

Made with &lt;3 in KL by [@Hazriq](https://github.com/hazriqpedia).
