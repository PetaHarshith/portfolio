import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, issueSession } from "@/lib/leaderboard";
import { clientIp } from "@/lib/clientIp";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET(req: NextRequest) {
  const ip = clientIp(req);

  let allowed = true;
  try {
    allowed = await checkRateLimit(ip, "session");
  } catch {
    // Fail open — submit endpoint has its own rate limit too.
  }
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many sessions. Try again in a minute." },
      { status: 429, headers: NO_CACHE },
    );
  }

  try {
    const token = await issueSession();
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Leaderboard offline." },
        { status: 503, headers: NO_CACHE },
      );
    }
    return NextResponse.json({ ok: true, token }, { headers: NO_CACHE });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Session error." },
      { status: 500, headers: NO_CACHE },
    );
  }
}
