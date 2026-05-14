import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
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
// Token issuance is looser — players may restart a few times per minute.
const SESSION_RATE_MAX = 10;

// Play session: HMAC-signed, single-use via Redis GETDEL, TTL just longer
// than a match (60s game + grace for slow submit).
const SESSION_TTL_SECS = 180;

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
  // Runs after all validation/precondition checks pass and immediately
  // before the write — so a rejected submission (bad tag, lower score)
  // doesn't burn the caller's single-use token.
  gate?: () => Promise<boolean>;
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

  const score = Math.floor(input.score);
  const combo = Math.floor(input.combo);
  const current = (await r.get<LeaderEntry[]>(LEADERBOARD_KEY)) ?? [];

  // Same-tag-keeps-highest: if the tag already exists, only replace when
  // beating the prior score. Prevents tag-squatting griefing while letting
  // legit replays improve a personal best.
  const priorIdx = current.findIndex((e) => e.name === clean);
  if (priorIdx !== -1 && current[priorIdx].score >= score) {
    return {
      ok: false,
      error: `"${clean}" already scored ${current[priorIdx].score.toLocaleString()}. Beat it to update.`,
    };
  }

  const entry: LeaderEntry = {
    name: clean,
    score,
    combo,
    date: new Date().toISOString(),
  };
  const without =
    priorIdx === -1
      ? current
      : [...current.slice(0, priorIdx), ...current.slice(priorIdx + 1)];
  const next = [...without, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  if (input.gate && !(await input.gate())) {
    return { ok: false, error: "Session expired. Start a new match." };
  }

  await r.set(LEADERBOARD_KEY, next);
  return { ok: true, board: next };
}

export async function checkRateLimit(
  ip: string,
  kind: "submit" | "session" = "submit",
): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  const key = `leaderboard:rate:${kind}:${ip}`;
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, RATE_WINDOW_SECS);
  return count <= (kind === "session" ? SESSION_RATE_MAX : RATE_MAX);
}

// --- play session (proof-of-play token) ---------------------------------

let warnedNoSecret = false;
let ephemeralSecret: string | null = null;

function getSessionSecret(): string {
  const env = process.env.LEADERBOARD_SECRET;
  if (env && env.length >= 16) return env;
  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(32).toString("hex");
    if (!warnedNoSecret) {
      warnedNoSecret = true;
      console.warn(
        "[leaderboard] LEADERBOARD_SECRET not set — using ephemeral secret. Tokens will not survive restart.",
      );
    }
  }
  return ephemeralSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export async function issueSession(): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  const nonce = randomBytes(16).toString("hex");
  const exp = Date.now() + SESSION_TTL_SECS * 1000;
  const payload = `${nonce}.${exp}`;
  const sig = sign(payload);
  await r.set(`leaderboard:nonce:${nonce}`, 1, { ex: SESSION_TTL_SECS });
  return `${payload}.${sig}`;
}

export async function consumeSession(token: unknown): Promise<boolean> {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [nonce, expStr, sig] = parts;
  if (!/^[a-f0-9]{32}$/.test(nonce)) return false;
  if (!/^[a-f0-9]{64}$/.test(sig)) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const expected = sign(`${nonce}.${expStr}`);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const r = getRedis();
  if (!r) return false;
  // GETDEL makes the nonce single-use atomically.
  const existed = await r.getdel(`leaderboard:nonce:${nonce}`);
  return existed !== null;
}
