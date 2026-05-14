"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects, type Project } from "@/content/projects";

const ACCENT_GRADIENT: Record<Project["accent"], string> = {
  magenta: "radial-gradient(ellipse at center, rgba(255,70,85,0.55), transparent 65%)",
  mint: "radial-gradient(ellipse at center, rgba(20,241,149,0.45), transparent 65%)",
  cyan: "radial-gradient(ellipse at center, rgba(110,231,255,0.45), transparent 65%)",
  amber: "radial-gradient(ellipse at center, rgba(255,209,102,0.45), transparent 65%)",
};

const ACCENT_SOLID: Record<Project["accent"], string> = {
  magenta: "var(--color-magenta)",
  mint: "var(--color-mint)",
  cyan: "var(--color-cyan)",
  amber: "var(--color-amber)",
};

const STATUS_COLOR: Record<Project["status"], string> = {
  LIVE: "var(--color-mint)",
  WIP: "var(--color-magenta)",
  BETA: "var(--color-cyan)",
  SHIPPED: "var(--color-amber)",
};

function useCountdown() {
  const [t, setT] = useState({ d: 21, h: 9, m: 58, s: 33 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        let { d, h, m, s } = p;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
          d -= 1;
        }
        if (d < 0) {
          return { d: 21, h: 9, m: 58, s: 33 };
        }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(t.d)}:${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`;
}

export function FeaturedDrops() {
  const ref = useRef<HTMLDivElement>(null);
  const countdown = useCountdown();
  const [featured, ...offers] = projects;

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
      items.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
      // Featured weapon parallax
      const onMove = (e: PointerEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 18;
        gsap.to("[data-weapon]", { x, y, duration: 0.9, ease: "power3.out" });
      };
      window.addEventListener("pointermove", onMove);
      return () => {
        window.removeEventListener("pointermove", onMove);
        ScrollTrigger.getAll()
          .filter((t) => root.contains(t.trigger as Node))
          .forEach((t) => t.kill());
      };
    },
    { scope: ref },
  );

  return (
    <section id="store" className="relative px-5 sm:px-10 py-24 sm:py-32">
      <div ref={ref} className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="03 · STORE"
          title="FEATURED · DROPS."
          sub="Things I built that I'd actually demo. The featured slot rotates; the offers don't."
        />

        {/* Featured card (big) */}
        <button
          data-reveal
          data-magnetic
          onClick={() => window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: featured.id }))}
          className="mt-12 relative hud bg-[#070b16] overflow-hidden text-left w-full block group transition-transform hover:-translate-y-1"
          aria-label={`Open ${featured.name} case study`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-7 py-3 font-mono text-xs sm:text-sm tracking-widest">
            <div className="flex items-center gap-3">
              <span className="text-ink">FEATURED</span>
              <span className="text-dim">|</span>
              <span className="text-mint tabular-nums">{countdown}</span>
            </div>
            <div
              className="font-mono text-[10px] tracking-widest px-2 py-1 border"
              style={{ color: STATUS_COLOR[featured.status], borderColor: STATUS_COLOR[featured.status] }}
            >
              ● {featured.status}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 p-5 sm:p-8 relative">
            {/* Glow backdrop */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: ACCENT_GRADIENT[featured.accent], opacity: 0.5 }}
            />

            {/* Left: copy */}
            <div className="relative">
              <h3 className="font-headline uppercase text-[clamp(3rem,7vw,6rem)] leading-[0.85] tracking-wide">
                {featured.name}
              </h3>
              <div
                className="mt-3 font-mono text-sm tracking-widest uppercase"
                style={{ color: ACCENT_SOLID[featured.accent] }}
              >
                {featured.tagline}
              </div>
              <div className="mt-2 font-mono text-xs text-dim tracking-widest">
                {featured.date}
              </div>

              <div className="mt-6 space-y-4 text-base sm:text-lg leading-relaxed max-w-xl">
                <div>
                  <div className="font-mono text-[11px] tracking-[0.3em] text-magenta">
                    PROBLEM
                  </div>
                  <p className="mt-1" style={{ color: "var(--color-ink-dim)" }}>
                    {featured.problem}
                  </p>
                </div>
                <div>
                  <div className="font-mono text-[11px] tracking-[0.3em] text-mint">
                    SOLUTION
                  </div>
                  <p className="mt-1" style={{ color: "var(--color-ink-dim)" }}>
                    {featured.solution}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {featured.stack.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs tracking-widest border border-white/15 px-2.5 py-1 uppercase"
                    style={{ color: "var(--color-ink-dim)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Price chip */}
              <div className="mt-7 inline-flex items-center gap-2 bg-mint/95 text-[#070b16] font-headline uppercase text-2xl px-5 py-2 tracking-wider"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                <span style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.2))" }}>◆</span>
                <span className="tabular-nums">READ THE DEEP DIVE →</span>
              </div>
            </div>

            {/* Right: "weapon" — abstract floating spotlight piece */}
            <div className="relative min-h-[280px] sm:min-h-[360px] flex items-center justify-center">
              <div data-weapon className="relative w-full max-w-md">
                {/* Diamond container with strong glow */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 blur-3xl"
                  style={{ background: ACCENT_GRADIENT[featured.accent], opacity: 0.9 }}
                />
                <div
                  className="relative aspect-[16/10] flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 60%)",
                    border: `1px solid ${ACCENT_SOLID[featured.accent]}`,
                    boxShadow: `0 0 40px ${ACCENT_SOLID[featured.accent]}66`,
                  }}
                >
                  {/* Repeating diagonals */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 14px)",
                    }}
                  />
                  {/* "weapon" name */}
                  <div className="relative text-center px-6">
                    <div
                      className="font-headline uppercase text-[clamp(2.4rem,5vw,4.5rem)] leading-none tracking-wider"
                      style={{ color: ACCENT_SOLID[featured.accent] }}
                    >
                      {featured.name}
                    </div>
                    <div className="mt-2 font-mono text-xs sm:text-sm text-dim tracking-[0.3em] uppercase">
                      SKIN · COLLECTION 01
                    </div>
                    <div className="mt-3 text-3xl" style={{ color: ACCENT_SOLID[featured.accent] }}>
                      ◆◆◆◆◆
                    </div>
                  </div>
                  {/* Corner brackets */}
                  <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: ACCENT_SOLID[featured.accent] }} />
                  <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: ACCENT_SOLID[featured.accent] }} />
                  <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: ACCENT_SOLID[featured.accent] }} />
                  <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: ACCENT_SOLID[featured.accent] }} />
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Offers row */}
        <div className="mt-6 flex items-center justify-between font-mono text-xs sm:text-sm tracking-widest border-b border-white/10 pb-2 mb-5">
          <span className="text-dim">OFFERS</span>
          <span className="text-mint tabular-nums">{countdown}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((p, i) => (
            <button
              key={p.id}
              data-reveal
              data-magnetic
              onClick={() => window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: p.id }))}
              aria-label={`Open ${p.name} case study`}
              className="relative hud overflow-hidden group transition-transform hover:-translate-y-1 text-left"
              style={{
                background: `linear-gradient(180deg, ${ACCENT_SOLID[p.accent]}26 0%, rgba(10,2,26,0.92) 90%)`,
                borderColor: `${ACCENT_SOLID[p.accent]}66`,
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: ACCENT_GRADIENT[p.accent], opacity: 0.5 }} />

              <div className="relative px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] tracking-widest text-dim">
                    DROP_{String(i + 2).padStart(2, "0")}
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-widest px-2 py-0.5 border"
                    style={{ color: STATUS_COLOR[p.status], borderColor: STATUS_COLOR[p.status] }}
                  >
                    ● {p.status}
                  </span>
                </div>

                {/* Visual area */}
                <div
                  className="relative aspect-[5/3] flex items-center justify-center border"
                  style={{
                    borderColor: `${ACCENT_SOLID[p.accent]}40`,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))",
                  }}
                >
                  <div
                    className="font-headline uppercase text-[clamp(1.8rem,4vw,3rem)] leading-none tracking-wide text-center px-3"
                    style={{ color: ACCENT_SOLID[p.accent] }}
                  >
                    {p.name}
                  </div>
                  <span className="absolute top-1 left-1 w-3 h-3 border-t border-l" style={{ borderColor: ACCENT_SOLID[p.accent] }} />
                  <span className="absolute bottom-1 right-1 w-3 h-3 border-b border-r" style={{ borderColor: ACCENT_SOLID[p.accent] }} />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-headline uppercase text-xl tracking-wide leading-tight">
                      {p.name}
                    </div>
                    <div className="font-mono text-[11px] text-dim mt-1 tracking-widest line-clamp-2">
                      {p.tagline}
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 font-mono text-xs tracking-widest transition-transform group-hover:translate-x-1"
                    style={{ color: ACCENT_SOLID[p.accent] }}
                  >
                    READ →
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] tracking-widest border border-white/15 px-1.5 py-0.5 uppercase"
                      style={{ color: "var(--color-ink-dim)" }}
                    >
                      {t}
                    </span>
                  ))}
                  {p.stack.length > 4 && (
                    <span className="font-mono text-[10px] tracking-widest text-dim px-1">
                      +{p.stack.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
