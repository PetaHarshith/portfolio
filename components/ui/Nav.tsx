"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const tabs = [
  { id: "hero", label: "HOME" },
  { id: "career", label: "CAREER" },
  { id: "store", label: "STORE" },
  { id: "live", label: "LIVE" },
  { id: "range", label: "RANGE" },
  { id: "connect", label: "CONNECT" },
];

export function Nav() {
  const [now, setNow] = useState("");
  const [active, setActive] = useState("hero");
  // Suppresses observer-driven updates while a click-triggered scroll is in flight,
  // so the clicked tab stays highlighted even as other sections cross the viewport band.
  const lockUntilRef = useRef(0);

  useEffect(() => {
    const update = () =>
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "America/Chicago",
        }) + " CT",
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const recomputeActive = () => {
      if (Date.now() < lockUntilRef.current) return;
      // Pick the section whose center is closest to the viewport center.
      const vh = window.innerHeight;
      const target = vh / 2;
      let best: { id: string; dist: number } | null = null;
      for (const t of tabs) {
        const el = document.getElementById(t.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const center = (r.top + r.bottom) / 2;
        const dist = Math.abs(center - target);
        if (!best || dist < best.dist) best = { id: t.id, dist };
      }
      if (best) setActive(best.id);
    };

    recomputeActive();
    window.addEventListener("scroll", recomputeActive, { passive: true });
    window.addEventListener("resize", recomputeActive);
    return () => {
      window.removeEventListener("scroll", recomputeActive);
      window.removeEventListener("resize", recomputeActive);
    };
  }, []);

  const handleTabClick = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActive(id);
    // Block observer-driven overrides for the duration of the animated scroll.
    lockUntilRef.current = Date.now() + 1400;
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -16, duration: 1.0 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4">
      <div className="max-w-7xl mx-auto hud bg-[#050912]/85 backdrop-blur-md flex items-center justify-between gap-4 px-4 sm:px-5 py-2.5">
        {/* Back arrow + logo */}
        <a
          href="#hero"
          className="flex items-center gap-3 font-mono text-xs tracking-widest uppercase"
        >
          <span className="text-magenta">◀</span>
          <span className="text-magenta hidden sm:inline">BACK</span>
          <span className="text-dim hidden sm:inline">//</span>
          <span className="text-ink">LOBBY</span>
        </a>

        {/* Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 font-headline uppercase tracking-wider text-sm sm:text-base">
          {tabs.map((t) => {
            const isActive = active === t.id;
            return (
              <a
                key={t.id}
                href={`#${t.id}`}
                onClick={handleTabClick(t.id)}
                className="relative px-2 sm:px-4 py-1 transition-colors"
                style={{ color: isActive ? "var(--color-mint)" : "var(--color-ink-dim)" }}
              >
                {t.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-mint"
                    style={{ background: "var(--color-mint)", boxShadow: "0 0 10px var(--color-mint)" }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: status */}
        <div className="hidden md:flex items-center gap-3 font-mono text-xs text-mint">
          <span className="pulse-dot" />
          <span className="tracking-widest uppercase">{now}</span>
        </div>
      </div>
    </header>
  );
}
