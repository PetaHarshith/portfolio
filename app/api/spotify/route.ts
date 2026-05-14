import { NextResponse } from "next/server";
import { fetchNowPlaying } from "@/lib/spotify";
import { hasSpotify } from "@/lib/env";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function GET() {
  if (!hasSpotify) {
    return NextResponse.json(
      {
        isPlaying: true,
        title: "Self Control",
        artist: "Frank Ocean",
        album: "Blonde",
        albumArt:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23ff4655'/><stop offset='1' stop-color='%236ee7ff'/></linearGradient></defs><rect width='160' height='160' fill='url(%23g)'/><text x='50%25' y='52%25' text-anchor='middle' font-family='monospace' font-size='14' fill='%230a0f1c'>♪ DEMO</text></svg>",
        progressMs: 87000,
        durationMs: 247000,
        url: "#",
        mock: true,
      },
      { status: 200, headers: NO_CACHE },
    );
  }

  try {
    const now = await fetchNowPlaying();
    return NextResponse.json(now, { status: 200, headers: NO_CACHE });
  } catch {
    return NextResponse.json({ isPlaying: false }, { status: 200, headers: NO_CACHE });
  }
}
