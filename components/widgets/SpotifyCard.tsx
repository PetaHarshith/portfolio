"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const VISIBLE_POLL_MS = 4000;
const HIDDEN_POLL_MS = 30000;

type LastKnown = {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
};

const LAST_KNOWN_KEY = "spotify:lastKnown";

export function SpotifyCard() {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [lastKnown, setLastKnown] = useState<LastKnown | null>(null);
  const cancelledRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastLoadRef = useRef(0);

  const load = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    lastLoadRef.current = Date.now();
    try {
      const res = await fetch(`/api/spotify?t=${Date.now()}`, { cache: "no-store" });
      const json = (await res.json()) as NowPlaying & { mock?: boolean };
      if (cancelledRef.current) return;
      setIsMock(Boolean(json.mock));
      setData(json);
      setFetchedAt(Date.now());
    } catch {
      if (cancelledRef.current) return;
      setIsMock(true);
      setData(MOCK);
      setFetchedAt(Date.now());
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  // Hydrate the last-known track from localStorage so a long pause across reloads
  // still falls back to the previously seen track instead of [ STANDBY ].
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_KNOWN_KEY);
      if (raw) setLastKnown(JSON.parse(raw) as LastKnown);
    } catch {}
  }, []);

  // Whenever the API returns a playing or paused/recent track, remember it.
  useEffect(() => {
    if (!data || isMock) return;
    let snapshot: LastKnown | null = null;
    if (data.isPlaying) {
      snapshot = {
        title: data.title,
        artist: data.artist,
        album: data.album,
        albumArt: data.albumArt,
        url: data.url,
      };
    } else if (data.lastPlayed) {
      snapshot = {
        title: data.lastPlayed.title,
        artist: data.lastPlayed.artist,
        album: data.lastPlayed.album,
        albumArt: data.lastPlayed.albumArt,
        url: data.lastPlayed.url,
      };
    }
    if (!snapshot) return;
    setLastKnown(snapshot);
    try {
      window.localStorage.setItem(LAST_KNOWN_KEY, JSON.stringify(snapshot));
    } catch {}
  }, [data, isMock]);

  useEffect(() => {
    cancelledRef.current = false;
    load();
    let intervalId: number | undefined;
    const startPolling = () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      const ms = document.visibilityState === "visible" ? VISIBLE_POLL_MS : HIDDEN_POLL_MS;
      intervalId = window.setInterval(load, ms);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // tab regained focus — only refetch if it's been more than 2s since the last load,
        // otherwise just re-pace the timer
        if (Date.now() - lastLoadRef.current > 2000) load();
      }
      startPolling();
    };
    startPolling();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);
    return () => {
      cancelledRef.current = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
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

  // When the current track hits the end, refetch immediately so the next song lands fast.
  useEffect(() => {
    if (!isPlaying) return;
    const remaining = showing.durationMs - progress;
    if (remaining <= 0 && Date.now() - lastLoadRef.current > 1500) {
      load();
    }
  }, [isPlaying, progress, showing, load]);

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
      ) : ("lastPlayed" in showing && showing.lastPlayed) || lastKnown ? (
        (() => {
          const track =
            "lastPlayed" in showing && showing.lastPlayed
              ? showing.lastPlayed
              : (lastKnown as LastKnown);
          return (
            <div className="flex gap-5 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={track.albumArt}
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
                  {track.title}
                </div>
                <div className="font-mono text-base text-dim truncate mt-1">
                  {track.artist}
                </div>
                <div className="font-mono text-xs text-dim truncate uppercase tracking-widest mt-1">
                  {track.album}
                </div>
              </div>
            </div>
          );
        })()
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
