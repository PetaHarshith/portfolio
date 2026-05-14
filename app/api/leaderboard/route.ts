import { NextResponse, type NextRequest } from "next/server";
import {
  checkRateLimit,
  consumeSession,
  getLeaderboard,
  submitEntry,
} from "@/lib/leaderboard";
import { clientIp } from "@/lib/clientIp";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET() {
  try {
    const board = await getLeaderboard();
    return NextResponse.json({ board }, { status: 200, headers: NO_CACHE });
  } catch {
    return NextResponse.json({ board: [] }, { status: 200, headers: NO_CACHE });
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  let allowed = true;
  try {
    allowed = await checkRateLimit(ip);
  } catch {
    // Fail open if Redis is briefly unreachable for the rate-limit hop;
    // the session token still gates whether this submission is accepted.
  }
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Try again in a minute." },
      { status: 429, headers: NO_CACHE },
    );
  }

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request." },
      { status: 400, headers: NO_CACHE },
    );
  }
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { ok: false, error: "Bad request." },
      { status: 400, headers: NO_CACHE },
    );
  }
  const body = parsed as {
    name?: unknown;
    score?: unknown;
    combo?: unknown;
    session?: unknown;
  };
  if (
    typeof body.name !== "string" ||
    typeof body.score !== "number" ||
    typeof body.combo !== "number"
  ) {
    return NextResponse.json(
      { ok: false, error: "Bad request." },
      { status: 400, headers: NO_CACHE },
    );
  }

  try {
    // Proof-of-play: token is HMAC-signed at match start and single-use
    // via Redis GETDEL. The gate runs only after shape/precondition checks
    // pass, so a rejected submission doesn't burn the player's token.
    const result = await submitEntry({
      name: body.name,
      score: body.score,
      combo: body.combo,
      gate: () => consumeSession(body.session).catch(() => false),
    });
    if (!result.ok) {
      return NextResponse.json(result, { status: 400, headers: NO_CACHE });
    }
    return NextResponse.json(result, { status: 200, headers: NO_CACHE });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Leaderboard error. Try again." },
      { status: 500, headers: NO_CACHE },
    );
  }
}
