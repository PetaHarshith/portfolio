"use client";

import { useEffect, useState } from "react";
import type { ValorantSnapshot } from "@/lib/valorant";

const MOCK: ValorantSnapshot = {
  account: { name: "rasam ninja", tag: "beta", level: 142 },
  rank: { tier: "Diamond 2", rr: 67, elo: 1867 },
  lastMatch: {
    map: "Ascent",
    mode: "Competitive",
    agent: "Jett",
    kills: 24,
    deaths: 14,
    assists: 7,
    result: "WIN",
    score: "13–9",
  },
};

export function ValorantCard() {
  const [data, setData] = useState<ValorantSnapshot | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/valorant", { cache: "no-store" });
        const json = (await res.json()) as ValorantSnapshot & { mock?: boolean };
        if (cancelled) return;
        setIsMock(Boolean(json.mock));
        setData(json);
      } catch {
        if (cancelled) return;
        setIsMock(true);
        setData(MOCK);
      }
    };
    load();
    const id = setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const showing = data ?? MOCK;
  const m = showing.lastMatch;
  const kda = m ? ((m.kills + m.assists) / Math.max(1, m.deaths)).toFixed(2) : "—";
  const resultColor =
    m?.result === "WIN" ? "var(--color-mint)" : m?.result === "LOSS" ? "var(--color-danger)" : "var(--color-amber)";

  return (
    <div className="hud hud-mint bg-bg-2/50 p-6 sm:p-8 relative">
      {isMock && (
        <div className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-amber/80 border border-amber/40 px-2 py-0.5">
          [ DEMO · add HENRIK_API_KEY ]
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-mono text-sm tracking-widest text-magenta">
          <span className="pulse-dot" style={{ background: "var(--color-magenta)", boxShadow: "0 0 12px var(--color-magenta)" }} />
          VALORANT · LIVE_RANK
        </div>
        {!isMock && (
          <div className="font-mono text-xs tracking-widest text-magenta">[ LIVE ]</div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div
          className="w-28 h-28 sm:w-32 sm:h-32 hud hud-mint flex flex-col items-center justify-center bg-bg-2/80"
          aria-hidden
        >
          {showing.rank.tierIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={showing.rank.tierIconUrl} alt="" className="w-16 h-16 object-contain" />
          ) : (
            <span className="font-headline uppercase text-magenta text-3xl tracking-wider">
              {showing.rank.tier.split(" ")[0]?.slice(0, 3) ?? "D2"}
            </span>
          )}
          <span className="font-mono text-[10px] text-dim mt-1 tracking-widest">tier</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-headline uppercase tracking-wide text-2xl sm:text-3xl truncate">
            {showing.rank.tier}
          </div>
          <div className="font-mono text-base text-mint mt-1">{showing.rank.rr} RR</div>
          <div className="font-mono text-xs text-dim mt-1 truncate">
            {showing.account.name}#{showing.account.tag} · LVL {showing.account.level}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 font-mono">
        {m ? (
          <>
            <Stat label="LAST MAP" value={m.map} sub={m.mode} />
            <Stat label="KDA" value={`${m.kills}/${m.deaths}/${m.assists}`} sub={`ratio ${kda}`} />
            <Stat label="RESULT" value={m.result} sub={m.score} color={resultColor} />
          </>
        ) : (
          <div className="col-span-3 text-dim">No recent match data.</div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="hud bg-bg-2/40 px-3 py-2.5">
      <div className="text-[10px] tracking-[0.2em] text-dim">{label}</div>
      <div
        className="font-headline text-xl sm:text-2xl mt-0.5 tabular-nums leading-none tracking-wide"
        style={{ color: color ?? "var(--color-ink)" }}
      >
        {value}
      </div>
      <div className="text-[10px] text-dim mt-1">{sub}</div>
    </div>
  );
}
