"use client";

import { SpotifyCard } from "./SpotifyCard";
import { ValorantCard } from "./ValorantCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function SideQuests() {
  return (
    <section id="live" className="relative px-5 sm:px-10 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="02 · LIVE_FEED"
          title="WHAT I'M DOING RIGHT NOW."
          sub="Two live feeds. One says I shipped a build today, the other says I queued ranked at midnight. Both are true."
        />
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SpotifyCard />
          <ValorantCard />
        </div>
        <div className="mt-6 font-mono text-xs text-dim tracking-widest">
          ▰ widgets refresh every 30s / 5min · falls back to demo data when offline
        </div>
      </div>
    </section>
  );
}
