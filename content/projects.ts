export type Project = {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  stack: string[];
  date: string;
  status: "LIVE" | "BETA" | "WIP" | "SHIPPED";
  accent: "magenta" | "mint" | "cyan" | "amber";
  href?: string;
};

export const projects: Project[] = [
  {
    id: "truthgap",
    name: "TruthGap",
    tagline: "AI documentation checker that catches docs lying about code.",
    problem: "READMEs, API docs, and example commands silently drift from the codebase.",
    solution:
      "Combines rule-based checks with LLM claim extraction over a seeded benchmark of 30+ doc bugs; returns the broken claim, source-file evidence, and a suggested fix.",
    stack: ["TypeScript", "Next.js", "PostgreSQL", "GitHub API", "LLMs"],
    date: "May 2026 — Present",
    status: "WIP",
    accent: "magenta",
  },
  {
    id: "idea-fund",
    name: "Sales-to-Finance Workflow",
    tagline: "Idea Fund La Crosse Hackathon · Spring 2026.",
    problem:
      "Deals were getting blocked downstream by missing billing contacts, stale approvals, and incomplete handoffs.",
    solution:
      "Architected an Action Center that surfaces $465K+ in deals across ready-to-invoice, needs-info, and blocked states — eliminating the manual status-check loop between sales and finance.",
    stack: ["Express.js", "TypeScript", "PostgreSQL", "Workflow Automation"],
    date: "Spring 2026",
    status: "SHIPPED",
    accent: "mint",
  },
  {
    id: "apptrack",
    name: "AppTrack",
    tagline: "Full-stack job application tracker — 40% less manual tracking.",
    problem: "Spreadsheets don't paginate, don't analyze, and don't deploy.",
    solution:
      "Express + Postgres backend with request validation, indexed queries, Dockerized deployment, CI/CD on EC2. Average API latency dropped from ~500ms to under ~200ms.",
    stack: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "AWS"],
    date: "Jan 2026",
    status: "LIVE",
    accent: "cyan",
  },
  {
    id: "uw-research",
    name: "Behavioral Analysis Framework",
    tagline: "Reusable Python pipeline replacing ad-hoc CSV review.",
    problem:
      "Cognitive-task experiments were reviewed via brittle, one-off CSV scripts that didn't compose across batches.",
    solution:
      "Built subject-level QC outputs across 1,000+ sessions and 5 cognitive tasks; standardized 20+ behavioral + linguistic metrics. Recurring analysis time dropped 60%.",
    stack: ["Python", "Pandas", "scikit-learn", "Word2Vec"],
    date: "Jun 2025 — Present",
    status: "LIVE",
    accent: "amber",
  },
];
