"use client";

import { useEffect, useState } from "react";

const tabs = [
  { id: "hero", label: "HOME" },
  { id: "live", label: "LIVE" },
  { id: "store", label: "STORE" },
  { id: "career", label: "CAREER" },
  { id: "range", label: "RANGE" },
  { id: "connect", label: "CONNECT" },
];

export function Nav() {
  const [now, setNow] = useState("");
  const [active, setActive] = useState("hero");

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
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.1, 0.5, 0.9] },
    );
    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
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
