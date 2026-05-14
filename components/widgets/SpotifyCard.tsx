"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/spotify";

const MOCK: Extract<NowPlaying, { isPlaying: true }> = {
  isPlaying: true,
  title: "Self Control",
  artist: "Frank Ocean",
  album: "Blonde",
  albumArt:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23ff4655'/><stop offset='1' stop-color='%236ee7ff'/></linearGradient></defs><rect width='160' height='160' fill='url(%23g)'/><text x='50%25' y='52%25' text-anchor='middle' font-family='monospace' font-size='14' fill='%230a0f1c'>♪ DEMO</text></svg>",
  progressMs: 87000,
  durationMs: 247000,
  url: "#",
};

function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SpotifyCard() {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/spotify", { cache: "no-store" });
        const json = (await res.json()) as NowPlaying & { mock?: boolean };
        if (cancelled) return;
        setIsMock(Boolean(json.mock));
        setData(json);
        setFetchedAt(Date.now());
      } catch {
        if (cancelled) return;
        setIsMock(true);
        setData(MOCK);
        setFetchedAt(Date.now());
      }
    };
    load();
    const id = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const showing = data ?? MOCK;
  const isPlaying = showing.isPlaying;
  const elapsed = isPlaying ? Math.max(0, now - fetchedAt) : 0;
  const progress = isPlaying
    ? Math.min(showing.progressMs + elapsed, showing.durationMs)
    : 0;
  const pct = isPlaying ? (progress / showing.durationMs) * 100 : 0;
  const isPaused = !isPlaying && "source" in showing && showing.source === "paused";
  const lastLabel = isPaused ? "PAUSED" : "LAST PLAYED";

  return (
    <div className="hud bg-bg-2/50 p-6 sm:p-8 flex flex-col relative">
      {isMock && (
        <div className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-amber/80 border border-amber/40 px-2 py-0.5">
          [ DEMO · set SPOTIFY_* in .env.local ]
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-mint">
          <span className="pulse-dot" />
          NOW_PLAYING · SPOTIFY
        </div>
        {!isMock && (
          <div className="font-mono text-xs tracking-widest text-mint">[ LIVE ]</div>
        )}
      </div>

      {isPlaying ? (
        <div className="flex gap-5 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showing.albumArt}
            alt=""
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm object-cover ring-1 ring-magenta/40 shadow-[0_0_28px_rgba(255,70,85,0.45)]"
          />
          <div className="flex-1 min-w-0">
            <div className="font-headline uppercase tracking-wide text-2xl sm:text-3xl truncate">
              {showing.title}
            </div>
            <div className="font-mono text-base text-dim truncate mt-1">
              {showing.artist}
            </div>
            <div className="font-mono text-xs text-dim truncate uppercase tracking-widest mt-1">
              {showing.album}
            </div>
          </div>
        </div>
      ) : "lastPlayed" in showing && showing.lastPlayed ? (
        <div className="flex gap-5 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showing.lastPlayed.albumArt}
            alt=""
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm object-cover ring-1 ring-magenta/30 shadow-[0_0_24px_rgba(255,70,85,0.25)] opacity-80"
          />
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[10px] tracking-[0.3em] mb-1"
              style={{ color: isPaused ? "var(--color-amber)" : "var(--color-ink-dim)" }}
            >
              ▰ {lastLabel}
            </div>
            <div className="font-headline uppercase tracking-wide text-2xl sm:text-3xl truncate">
              {showing.lastPlayed.title}
            </div>
            <div className="font-mono text-base text-dim truncate mt-1">
              {showing.lastPlayed.artist}
            </div>
            <div className="font-mono text-xs text-dim truncate uppercase tracking-widest mt-1">
              {showing.lastPlayed.album}
            </div>
          </div>
        </div>
      ) : (
        <div className="font-mono text-dim">
          <div className="text-magenta font-headline text-2xl tracking-wide">[ STANDBY ]</div>
          <p className="text-base mt-1">Not vibing right now. Probably head-down in code.</p>
        </div>
      )}

      {isPlaying && (
        <div className="mt-6">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-mint transition-[width] duration-1000 ease-linear"
              style={{ width: `${pct}%`, background: "var(--color-mint)" }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs text-dim tabular-nums">
            <span>{fmt(progress)}</span>
            <span>{fmt(showing.durationMs)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
