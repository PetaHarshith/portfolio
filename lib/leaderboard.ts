import { Redis } from "@upstash/redis";

const LEADERBOARD_KEY = "leaderboard:v1";
const MAX_ENTRIES = 10;
const NAME_MAX_LEN = 14;
// 60s of perfect play caps around 60k by the game's own scoring;
// 200k is a generous server-side sanity ceiling.
const SCORE_MAX = 200_000;
const COMBO_MAX = 200;

// Rate limit: at most 3 submissions per IP per 60s window.
const RATE_WINDOW_SECS = 60;
const RATE_MAX = 3;

export type LeaderEntry = {
  name: string;
  score: number;
  combo: number;
  date: string;
};

let cached: Redis | null = null;
function getRedis(): Redis | null {
  if (cached) return cached;
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cached = new Redis({ url, token });
  return cached;
}

export async function getLeaderboard(): Promise<LeaderEntry[]> {
  const r = getRedis();
  if (!r) return [];
  const data = await r.get<LeaderEntry[]>(LEADERBOARD_KEY);
  return Array.isArray(data) ? data : [];
}

export type SubmitResult =
  | { ok: true; board: LeaderEntry[] }
  | { ok: false; error: string };

export async function submitEntry(input: {
  name: string;
  score: number;
  combo: number;
}): Promise<SubmitResult> {
  const r = getRedis();
  if (!r) return { ok: false, error: "Leaderboard offline." };

  const clean = input.name.trim().slice(0, NAME_MAX_LEN).toUpperCase();
  if (!clean) return { ok: false, error: "Tag required." };
  if (!/^[A-Z0-9 _-]+$/.test(clean)) {
    return { ok: false, error: "Tag has invalid characters." };
  }
  if (
    !Number.isFinite(input.score) ||
    input.score < 0 ||
    input.score > SCORE_MAX
  ) {
    return { ok: false, error: "Invalid score." };
  }
  if (
    !Number.isFinite(input.combo) ||
    input.combo < 0 ||
    input.combo > COMBO_MAX
  ) {
    return { ok: false, error: "Invalid combo." };
  }

  const current = (await r.get<LeaderEntry[]>(LEADERBOARD_KEY)) ?? [];
  if (current.some((e) => e.name === clean)) {
    return { ok: false, error: `"${clean}" is taken. Pick a different tag.` };
  }

  const entry: LeaderEntry = {
    name: clean,
    score: Math.floor(input.score),
    combo: Math.floor(input.combo),
    date: new Date().toISOString(),
  };
  const next = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  await r.set(LEADERBOARD_KEY, next);
  return { ok: true, board: next };
}

export async function checkRateLimit(ip: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  const key = `leaderboard:rate:${ip}`;
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, RATE_WINDOW_SECS);
  return count <= RATE_MAX;
}
