"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { experience, type Experience } from "@/content/experience";
import { skills, achievements } from "@/content/skills";

type Tab = "history" | "loadout" | "achievements";

const TAG_COLORS: Record<Experience["tag"], string> = {
  RESEARCH: "var(--color-cyan)",
  STARTUP: "var(--color-mint)",
  ENTERPRISE: "var(--color-amber)",
};

export function Career() {
  const [tab, setTab] = useState<Tab>("history");
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
      items.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
      // animate skill bars when loadout tab is active
      const bars = root.querySelectorAll<HTMLDivElement>("[data-bar]");
      bars.forEach((bar) => {
        const target = Number(bar.dataset.bar);
        gsap.to(bar, { width: `${target}%`, duration: 1, ease: "expo.out", delay: 0.15 });
      });
      return () => {
        ScrollTrigger.getAll()
          .filter((t) => root.contains(t.trigger as Node))
          .forEach((t) => t.kill());
      };
    },
    { scope: ref, dependencies: [tab] },
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "history", label: "MATCH HISTORY" },
    { id: "loadout", label: "LOADOUT" },
    { id: "achievements", label: "ACHIEVEMENTS" },
  ];

  return (
    <section
      id="career"
      ref={ref}
      className="relative px-5 sm:px-10 py-24 sm:py-32"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="02 · CAREER"
          title="WHERE I'VE SHIPPED."
          sub="Roles are matches. Stack is a loadout. Achievements are badges. Pick a tab, they all hold up."
        />

        {/* Lobby-style tabs */}
        <div className="mt-12 flex items-center gap-0 border-b border-white/10 overflow-x-auto">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative font-headline uppercase tracking-wider text-xl sm:text-2xl px-5 py-3 transition-colors whitespace-nowrap"
                style={{ color: isActive ? "var(--color-mint)" : "var(--color-ink-dim)" }}
              >
                {t.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                    style={{ background: "var(--color-mint)", boxShadow: "0 0 12px var(--color-mint)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          {tab === "history" && <MatchHistoryGrid />}
          {tab === "loadout" && <LoadoutGrid />}
          {tab === "achievements" && <AchievementsGrid />}
        </div>
      </div>
    </section>
  );
}

function MatchHistoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-5">
      {experience.map((exp, idx) => (
        <article
          key={exp.id}
          data-reveal
          className="hud bg-bg-2/50 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="font-mono text-xs tracking-widest"
                style={{ color: TAG_COLORS[exp.tag] }}
              >
                ▰ {exp.tag}
              </span>
              <span className="font-mono text-xs text-dim tracking-widest">
                MATCH #{String(experience.length - idx).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-headline uppercase text-3xl sm:text-4xl leading-[0.95] tracking-wide">
              {exp.role}
            </h3>
            <div className="mt-2 font-mono text-sm sm:text-base text-magenta">
              {exp.company}
            </div>
            <div className="mt-1 font-mono text-xs sm:text-sm text-dim tracking-widest">
              {exp.start} → {exp.end} · {exp.location}
            </div>
            <p
              className="mt-4 text-base sm:text-lg leading-relaxed max-w-2xl"
              style={{ color: "var(--color-ink-dim)" }}
            >
              {exp.summary}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-base">
              {exp.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="text-mint mt-1">▸</span>
                  <span style={{ color: "var(--color-ink-dim)" }}>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {exp.stack.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] tracking-widest border border-white/10 px-2.5 py-1 uppercase"
                  style={{ color: "var(--color-ink-dim)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* KDA stat column */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:w-[200px] lg:flex-shrink-0">
            {exp.kda.map((k) => (
              <div key={k.label} className="hud bg-bg-2/60 px-4 py-3">
                <div className="text-[10px] tracking-[0.25em] text-dim">
                  {k.label}
                </div>
                <div
                  className="font-headline text-3xl sm:text-4xl mt-1"
                  style={{ color: TAG_COLORS[exp.tag] }}
                >
                  {k.value}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function LoadoutGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {skills.map((group, gi) => (
        <div
          key={group.slot}
          data-reveal
          className="hud bg-bg-2/40 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="font-mono text-xs tracking-widest text-magenta">
              ▰ SLOT_{String(gi + 1).padStart(2, "0")}
            </div>
            <div className="font-mono text-[10px] tracking-widest text-dim">
              {group.slot}
            </div>
          </div>
          <div className="font-headline uppercase text-2xl mb-5 tracking-wide">
            {group.label}
          </div>
          <ul className="flex flex-col gap-3.5">
            {group.skills.map((s) => (
              <li key={s.name}>
                <div className="flex justify-between font-mono text-sm">
                  <span
                    style={{ color: s.primary ? "var(--color-mint)" : "var(--color-ink)" }}
                  >
                    {s.name}
                    {s.primary && (
                      <span className="ml-2 text-[10px] tracking-widest text-magenta">
                        ◆ PRIMARY
                      </span>
                    )}
                  </span>
                  <span className="text-dim tabular-nums">{s.level}</span>
                </div>
                <div className="mt-1.5 h-[4px] bg-white/5 rounded-full overflow-hidden">
                  <div
                    data-bar={s.level}
                    className="h-full rounded-full"
                    style={{
                      width: 0,
                      background: s.primary
                        ? "linear-gradient(90deg, var(--color-mint), var(--color-magenta))"
                        : "var(--color-mint)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function AchievementsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((a, i) => (
        <div
          key={a.label}
          data-reveal
          className="hud bg-bg-2/40 p-5 flex items-center gap-4"
        >
          <div
            className="hud hud-mint w-14 h-14 flex items-center justify-center font-mono text-mint text-xl"
            style={{ background: "rgba(20,241,149,0.05)" }}
          >
            ◆
          </div>
          <div className="min-w-0">
            <div className="font-headline uppercase text-xl tracking-wide leading-tight">
              {a.label}
            </div>
            <div className="font-mono text-xs text-dim mt-1 tracking-wider">
              {a.detail}
            </div>
          </div>
          <div className="ml-auto font-mono text-[11px] text-dim tracking-widest">
            #{String(i + 1).padStart(2, "0")}
          </div>
        </div>
      ))}
    </div>
  );
}
