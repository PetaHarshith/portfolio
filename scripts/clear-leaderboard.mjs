#!/usr/bin/env node
// One-shot: wipe the shared leaderboard.
// Run with:
//   KV_REST_API_URL=... KV_REST_API_TOKEN=... node scripts/clear-leaderboard.mjs
// Or, if you have the Vercel CLI:
//   vercel env pull .env.local && node --env-file=.env.local scripts/clear-leaderboard.mjs

const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error(
    "Missing KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_* equivalents).",
  );
  process.exit(1);
}

const KEY = "leaderboard:v1";

async function call(cmd) {
  const res = await fetch(`${url}/${cmd.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${cmd[0]} failed: ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

const before = await call(["get", KEY]);
const parsed = (() => {
  try {
    return typeof before === "string" ? JSON.parse(before) : before;
  } catch {
    return before;
  }
})();
console.log(
  `Before: ${Array.isArray(parsed) ? `${parsed.length} entries` : before === null ? "empty" : "value present"}`,
);

const deleted = await call(["del", KEY]);
console.log(`DEL ${KEY} → ${deleted}`);
console.log("Done.");
