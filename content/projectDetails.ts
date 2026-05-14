export type DetailBlock =
  | { type: "h"; text: string }
  | { type: "p"; text: string }
  | { type: "callout"; tone: "magenta" | "mint" | "cyan" | "amber"; label: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string; lang?: string }
  | { type: "quote"; text: string }
  | { type: "stats"; items: { label: string; value: string }[] };

export type ProjectDetail = {
  id: string;
  eyebrow: string;
  subhead: string;
  intro: string;
  blocks: DetailBlock[];
  links?: { label: string; href: string }[];
};

export const projectDetails: Record<string, ProjectDetail> = {
  truthgap: {
    id: "truthgap",
    eyebrow: "DROP_01 · WIP · May 2026 → present",
    subhead: "An AI documentation checker that catches READMEs telling fairy tales about your code.",
    intro:
      "Code drifts. Documentation drifts faster. TruthGap is an early-stage project trying to fix that. It combines a rule engine, structured LLM claim extraction, and a benchmark to actually measure whether the checker works. Just started this month.",
    blocks: [
      { type: "h", text: "Every README I've ever shipped lied to someone" },
      {
        type: "p",
        text: "It's the universal new-hire ritual: clone the repo, copy the install command, watch it explode because the package was renamed nine months ago. The README isn't wrong on purpose. It's wrong because docs and code live in different files, get updated by different humans, on different days, with different definitions of 'done'. Drift is the default state.",
      },
      {
        type: "callout",
        tone: "magenta",
        label: "THE THESIS",
        text: "Documentation accuracy should not depend on a human noticing. It should be a check that fails in CI, just like a broken test.",
      },
      { type: "h", text: "Why 'just ask GPT to read it' is the wrong shape" },
      {
        type: "p",
        text: "The naive version is one prompt: 'here's the README, here's the codebase, find the lies.' LLMs are pattern matchers, not auditors. Without a structured way to ground each claim against the actual code, you get confident-sounding output that misses renamed env vars and invents config keys that don't exist. The interesting engineering is in the grounding step, not the prompt.",
      },
      { type: "h", text: "The intended design" },
      {
        type: "list",
        items: [
          "Rule-based pass first: extract every code block, command, file path, API endpoint, and config key the README references.",
          "LLM claim extraction with structured output. Each claim has a verb (\"this command does X\", \"this endpoint accepts Y\"), a target (a file, a route, a flag), and a quote from the docs.",
          "Ground each claim against the real codebase via the GitHub API. Does the file exist? Does the command resolve? Is the route still wired up?",
          "Return the broken claim, the source-file evidence (a real line of real code), and a suggested fix. Not vibes. Receipts.",
        ],
      },
      { type: "h", text: "The benchmark (planned)" },
      {
        type: "p",
        text: "Models are easy to demo and hard to evaluate. The plan is a seed repo with intentional documentation bugs: broken commands, outdated config keys, removed endpoints, renamed functions, stale example output, dead links. Each one has a fix-of-record. TruthGap's score becomes precision and recall against that ground truth, not a screenshot or a tweet thread. Building the benchmark is the next milestone.",
      },
      { type: "h", text: "What I'm still figuring out" },
      {
        type: "p",
        text: "False positives are the killer. If TruthGap flags five non-bugs before catching a real one, nobody runs it again. The fix is being honest about confidence. Every claim gets a tier (verified, probably, or can't tell), and the CI integration only fails the build on verified.",
      },
      {
        type: "quote",
        text: "The dream is a CI check that fails your PR if your docs lie. We're not there yet, but the floor for 'is my README accurate' should be higher than 'a human spotted it'.",
      },
    ],
    links: [{ label: "ON GITHUB →", href: "https://github.com/PetaHarshith" }],
  },

  "idea-fund": {
    id: "idea-fund",
    eyebrow: "DROP_02 · SHIPPED · Spring 2026",
    subhead: "Six fields between a closed deal and an invoice. Built at the Idea Fund La Crosse Hackathon.",
    intro:
      "Northwoods is a CRM that does one thing nobody else does well: it stops sales from handing finance a half-finished deal. The project name is boring on purpose. The engineering problem underneath is the most unexpectedly satisfying state machine I've ever shipped. $465K+ in deals tracked through it.",
    blocks: [
      { type: "h", text: "The problem nobody mentions on the careers page" },
      {
        type: "p",
        text: "A sales rep closes a deal. High-fives all around. The CRM updates. Then finance reaches for the invoice and discovers nobody knows when the contract starts, the customer hasn't signed yet, or there's no billing contact on file. So the deal sits in limbo. Revenue waits. Three weeks later somebody schedules a reconciliation meeting. This happens, quietly, at every B2B company on earth.",
      },
      {
        type: "callout",
        tone: "mint",
        label: "WHAT NORTHWOODS DOES",
        text: "Every closed-won deal gets a readiness score against six mandatory fields. Missing any one of them and the deal can't move to 'ready for invoice'. Server-enforced. No exceptions.",
      },
      { type: "h", text: "Readiness as a pure function" },
      {
        type: "p",
        text: "The whole system pivots around one function. It takes a deal, its contacts, and its line items, and returns a status (blocked, warning, or ready), plus the list of fields that are missing and why.",
      },
      {
        type: "code",
        lang: "ts",
        text: "computeReadiness(deal, contacts, lineItems)\n  → { readinessStatus, missingFields, warnings }",
      },
      {
        type: "p",
        text: "It runs on every write to the deals table. It also runs for every deal on an account whenever a contact on that account changes (add, edit, delete). Adding a billing contact instantly unblocks every deal on the account that was waiting on one.",
      },
      { type: "h", text: "The six blockers" },
      {
        type: "list",
        items: [
          "Contract start date. Finance needs to know when to start billing.",
          "Contract term. Either a free-text term or a derived opportunity term.",
          "Contract value. Total contracted value, in dollars, non-zero.",
          "Signed contract attached. Boolean, not implied.",
          "Billing contact. At least one contact on the account must be flagged as the billing contact.",
          "Line items. At least one line item must be attached to the deal.",
        ],
      },
      { type: "h", text: "The most satisfying moment in B2B software" },
      {
        type: "p",
        text: "When the readiness checker transitions a deal from blocked to ready, the backend auto-advances the deal's stage from 'needs info' to 'ready for invoice' in the same database write. Filling in the last missing field clears the deal from the inbox immediately. No manual promotion, no save button, no waiting for a sync. Just gone.",
      },
      {
        type: "code",
        lang: "ts",
        text: "if (readinessStatus === 'ready' && stage === 'needs_info') {\n  return 'ready_for_invoice';\n}\nreturn currentStage;",
      },
      { type: "h", text: "The stage gate" },
      {
        type: "p",
        text: "Sales tries to manually drag a deal to 'ready for invoice' while it's still blocked? The server returns HTTP 400 with the list of missing fields. The UI shows a toast. The badge reverts. You cannot lie to finance through this system. That's the entire pitch.",
      },
      { type: "h", text: "The Action Center" },
      {
        type: "p",
        text: "The front page is a three-column priority inbox: Needs Info (oldest first, so the stalest deal in the company has nowhere to hide), Ready for Invoice (waiting on finance to act), and Overdue Invoices (past due, still unpaid). One screen, one glance, every blocked dollar visible.",
      },
      {
        type: "stats",
        items: [
          { label: "DEALS TRACKED", value: "$465K+" },
          { label: "BLOCKERS", value: "6" },
          { label: "READINESS STATES", value: "3" },
          { label: "BUILT IN", value: "~36 HRS" },
        ],
      },
      {
        type: "quote",
        text: "Hackathons usually produce toys. This one shipped to an internal team and replaced a Google Sheet.",
      },
    ],
  },

  apptrack: {
    id: "apptrack",
    eyebrow: "DROP_03 · LIVE · January 2026",
    subhead: "I built a full-stack job tracker because spreadsheets are where ambition goes to die.",
    intro:
      "AppTrack is the kind of project you build because you genuinely need it. Cruel irony: I built the tracker faster than I got responses to the applications I tracked in it. It's a centralized dashboard, server-side paginated, with a real analytics layer, because the side effect of tracking your job search is finding out exactly how bad your response rate is.",
    blocks: [
      { type: "h", text: "Spreadsheets are where ambition goes to die" },
      {
        type: "p",
        text: "Every CS student starts with a Google Sheet. It has four tabs by week three, twelve unused columns by week five, and conditional formatting from hell by week seven. You can't search it. You can't paginate it. You definitely can't graph it. You stop opening it. The applications stop happening.",
      },
      {
        type: "callout",
        tone: "cyan",
        label: "THE STACK",
        text: "React 18 + TypeScript + Vite on the front. Express + Drizzle + Zod on the back. PostgreSQL with status enums in the middle. Recharts for the analytics layer. Refine for the data plumbing.",
      },
      { type: "h", text: "Pagination, indexes, and not loading everything" },
      {
        type: "p",
        text: "The first version returned the full applications list on every keystroke. Fine at a dozen rows; obviously the wrong shape past that. I rewrote the table around Refine + react-table's server-side data provider: every search, filter, sort, and page-change hits a paginated endpoint backed by indexed columns. The dashboard charts are aggregated server-side too, so one stats endpoint replaces N round-trips.",
      },
      { type: "h", text: "The state machine in disguise" },
      {
        type: "p",
        text: "Application status is a finite state machine. You don't skip from 'Applied' to 'Offer'. There's a sequence. The data model bakes that in with a Postgres enum, and Zod validates the transitions on the boundary so a malformed request can't put a row into 'Offer' from nowhere.",
      },
      {
        type: "code",
        text: "Applied  →  OA  →  Interview  →  Offer\n                              ↘\n                             Rejected",
      },
      { type: "h", text: "Inline editing > forms" },
      {
        type: "p",
        text: "Every column in the table is editable in place. Click the status, get a dropdown, change it, save. No modal. No 'edit page'. The biggest UX win of the project was deleting the entire edit form and trusting the table to be the interaction surface.",
      },
      { type: "h", text: "Recharts and the temptation to over-visualize" },
      {
        type: "p",
        text: "I added a pie chart, a bar chart, and an area chart because I could. After two weeks of actual use, the only one I open is the recent-applications list. Lesson: graphs are dopamine, lists are tools. Don't replace tools with dopamine.",
      },
      { type: "h", text: "What's next" },
      {
        type: "list",
        items: [
          "User-level data isolation (right now it's single-tenant).",
          "CSV / PDF export for when recruiters ask for 'a list of your projects'.",
          "Dockerized deployment + automated tests, because Future Me will thank Current Me.",
        ],
      },
      {
        type: "quote",
        text: "If you're job-hunting, fork the repo. The most useful side project I've shipped is the one I actually use every day.",
      },
    ],
    links: [{ label: "ON GITHUB →", href: "https://github.com/PetaHarshith" }],
  },

  "uw-research": {
    id: "uw-research",
    eyebrow: "DROP_04 · LIVE · June 2025 → present",
    subhead: "Behavioral pipelines for Prof. Joao Moreira's Computational Development Neuroscience Lab at UW–Madison.",
    intro:
      "I walked into a neuroscience lab the summer after CS540 wanting to ship something that mattered outside a portfolio. A year later I have read more fMRI papers than I ever planned to, can spell Cronbach without checking, and have built the pipeline the lab now uses to evaluate behavior on 1,000+ experiment sessions. This is the story of a CS undergrad accidentally becoming useful to a neuroscience PI.",
    blocks: [
      { type: "h", text: "Why behavioral research needs an engineer" },
      {
        type: "p",
        text: "Neuroscience labs run on grad students with brilliant ideas and very little time. Behavioral analysis (turning raw experiment logs into reviewable, subject-level reports) was being done with ad-hoc CSV scripts. Each grad student rewrote a similar version. None of them composed across studies. Replacing that with one reusable pipeline freed up a meaningful percentage of the lab's analysis hours.",
      },
      {
        type: "callout",
        tone: "amber",
        label: "WHAT I BUILT",
        text: "A pure-Python behavioral analysis framework that processes 1,000+ experiment sessions across 5 cognitive tasks. Automates 20+ behavioral and linguistic metrics. Drops recurring analysis time by 60%.",
      },
      { type: "h", text: "The architecture (unglamorous edition)" },
      {
        type: "p",
        text: "It's a load → validate → score → export pipeline. The load step normalizes raw experiment files (formats vary by task and by experimenter, because of course they do). Validation catches missing trials, malformed timestamps, and incomplete sessions before they poison the rest of the run. Scoring runs the 20+ metrics. Export drops standardized CSVs ready for downstream stats or fMRI alignment.",
      },
      {
        type: "p",
        text: "Nothing about it is clever. Everything about it is reliable. That trade (boring code, predictable outputs) is the whole point for research infrastructure.",
      },
      { type: "h", text: "The fMRI reliability pipeline" },
      {
        type: "p",
        text: "The second piece I built was an fMRI reliability pipeline. It computes Cronbach's α and Guttman's G6 across subjects, Schaefer-atlas parcels, and three task conditions. In plain English: when a brain region lights up during a task, how confident are we that we'd see the same lighting next session?",
      },
      {
        type: "p",
        text: "Previously this was a parcel-by-parcel manual check. Now it's a single command that produces a CSV the lab's actual researchers can drop into their own analyses.",
      },
      { type: "h", text: "The NLP side quest" },
      {
        type: "p",
        text: "Then there's the modeling pipeline I'm proudest of. Subjects respond to 30 memory-writing prompts. Their text gets turned into Word2Vec features. The pipeline runs 50-repeat nested split-half validation across Ridge, RBF-SVR, XGBoost, and an ensemble, comparing which model best predicts the memory metric we care about.",
      },
      {
        type: "list",
        items: [
          "Word2Vec embeddings on the response text.",
          "Outer split: 50 repeats of split-half.",
          "Inner CV: hyperparameter search per model.",
          "Reports out the mean / std of each model's correlation with the target metric.",
        ],
      },
      {
        type: "p",
        text: "I now know what 'nested split-half reliability' means in a way that is mildly traumatizing but unambiguously useful.",
      },
      {
        type: "stats",
        items: [
          { label: "SESSIONS", value: "1,000+" },
          { label: "METRICS", value: "20+" },
          { label: "ANALYSIS TIME", value: "−60%" },
          { label: "TASKS", value: "5" },
        ],
      },
      { type: "h", text: "The best feeling in research engineering" },
      {
        type: "quote",
        text: "When a metric I shipped is now the way the lab measures something. Closest a CS undergrad gets to being cited.",
      },
    ],
  },
};
