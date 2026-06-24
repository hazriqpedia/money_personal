const calculations = [
  {
    title: 'Monthly & Annually',
    description: 'Linked — edit either one and the other updates automatically (×12 / ÷12).',
  },
  {
    title: 'Gross',
    description: 'A plain manual entry — your gross (pre-deduction) salary for that year.',
  },
  {
    title: 'Increment',
    description: "Year-over-year % change in Annually, compared against the previous row. Read-only — there's nothing to type, and it's blank on your first entry.",
  },
  {
    title: 'Difference',
    description: "Year-over-year dollar change in Gross — the dollar amount behind Increment's percentage. Also read-only, also blank on your first entry.",
  },
  {
    title: 'Active (multiple entries in one year)',
    description: "If you add a second entry for the same year — say a mid-year raise — an Active column appears so you can pick which one counts for Balance and the Dashboard. The one you most recently edited is picked by default; switch it any time.",
  },
  {
    title: 'Balance',
    description: "This year's Gross (from whichever entry is Active, if you have more than one) minus everything in your monthly spending: your manual spending items, every credit card's total, and your Savings breakdown total.",
  },
  {
    title: 'Total CC',
    description: 'The sum of every credit card breakdown’s total, added up across all the cards you’ve set up in Profile.',
  },
  {
    title: "Dashboard's Needs / Wants / Savings",
    description: "The selected year's Gross split by the percentages set in Profile (50/30/20 by default). Savings is shown in red when what you've actually logged in the Income tab's Savings breakdown falls short of that target.",
  },
];

const pages = [
  {
    title: 'Dashboard',
    description:
      "Your home screen. See a year-scoped summary across every tab, plus backup export and import for your data.",
  },
  {
    title: 'Age & Plan',
    description:
      'Record your age, year, and life events — past and planned — on a personal timeline.',
  },
  {
    title: 'Income',
    description: 'Track every source of income — salary, freelance, side gigs — in one place.',
  },
  {
    title: 'Savings',
    description: 'Keep tabs on every savings account and how each balance is growing.',
  },
  {
    title: 'Loan',
    description: 'Track outstanding loans, balances, and repayment progress.',
  },
  {
    title: 'Bills',
    description: 'Stay on top of recurring bills so nothing slips through the cracks.',
  },
  {
    title: 'Subscription',
    description: 'See every subscription in one list, with renewal dates and costs.',
  },
  {
    title: 'Tax',
    description: 'Keep a record of tax filings and payments, year over year.',
  },
  {
    title: 'Profile',
    description: 'Set your date of birth so Age & Plan can calculate your age automatically.',
  },
];

export function AboutPage() {
  return (
    <div className="flex-1 px-6 py-12 w-full max-w-2xl mx-auto">
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-3">$ HQ</h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            A private, browser-only tool for planning one person's finances. No accounts, no
            servers — everything runs locally and persists in your browser.
          </p>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pages</p>

          <div className="space-y-5">
            {pages.map((page) => (
              <div key={page.title}>
                <p className="text-zinc-100 font-medium mb-1">{page.title}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{page.description}</p>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">How the numbers are calculated</p>

          <div className="space-y-5">
            {calculations.map((item) => (
              <div key={item.title}>
                <p className="text-zinc-100 font-medium mb-1">{item.title}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Your data</p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Everything you enter is saved only in your browser's local storage — nothing is ever
            sent to a server. Use the export/import backup buttons on the Dashboard to save a
            copy of your data or move it to another browser.
          </p>
        </div>

        <p className="text-xs text-zinc-600">
          Made with &lt;3 in KL by{' '}
          <a
            href="https://hazriqpedia.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors underline underline-offset-2"
          >
            Hazriq
          </a>
          .
        </p>
      </div>
    </div>
  );
}
