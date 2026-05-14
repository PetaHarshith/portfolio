"use client";

import { useEffect, useState } from "react";

const LINES = [
  "> initializing player_01...",
  "> mounting modules: hero, side_quests, loadout, match_history",
  "> loading vibe: playful_neon.arcade",
  "> uplinking spotify api .................... [ok]",
  "> uplinking valorant tracker ................ [ok]",
  "> calibrating glitch shaders ................ [ok]",
  "> press any key to enter",
];

export function BootScreen() {
  // Default visible so SSR ships the overlay and it paints with the rest of
  // the page — no portfolio flash before hydration. The pre-hydration script
  // in app/layout.tsx hides it via CSS for revisitors / reduced-motion users.
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("booted") === "1") {
      setVisible(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("booted", "1");
      setVisible(false);
      return;
    }
    document.body.style.overflow = "hidden";

    const lineTimer = setInterval(() => {
      setLineIdx((i) => Math.min(i + 1, LINES.length));
    }, 220);

    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 4 + Math.random() * 6, 100));
    }, 90);

    return () => {
      clearInterval(lineTimer);
      clearInterval(progTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (progress >= 100 && lineIdx >= LINES.length) {
      setDone(true);
    }
  }, [progress, lineIdx, visible]);

  useEffect(() => {
    if (!done) return;
    const dismiss = () => {
      sessionStorage.setItem("booted", "1");
      document.documentElement.classList.remove("booting");
      document.documentElement.dataset.booted = "1";
      document.body.style.overflow = "";
      setVisible(false);
    };
    const auto = setTimeout(dismiss, 1200);
    window.addEventListener("keydown", dismiss, { once: true });
    window.addEventListener("pointerdown", dismiss, { once: true });
    return () => {
      clearTimeout(auto);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, [done]);

  if (!visible) return null;

  const blocks = 24;
  const filled = Math.round((progress / 100) * blocks);

  return (
    <div
      data-boot-overlay
      className="fixed inset-0 z-[90] bg-[#0a0f1c] font-mono text-mint flex flex-col items-center justify-center px-6"
    >
      <div className="hud bg-bg-2/60 w-full max-w-2xl p-6 sm:p-8">
        <p className="text-xs sm:text-sm tracking-widest text-magenta mb-4">
          ▰▰ HARSHITH_OS v0.1.0 ─ booting
        </p>
        <pre className="text-sm sm:text-base whitespace-pre-wrap leading-7">
          {LINES.slice(0, lineIdx).map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
          {lineIdx < LINES.length && (
            <span className="block text-dim">
              {LINES[lineIdx]}
              <span className="animate-pulse">_</span>
            </span>
          )}
        </pre>
        <div className="mt-6 flex items-center gap-3 text-sm sm:text-base">
          <span className="text-dim">[</span>
          <span className="text-mint">
            {"█".repeat(filled)}
            <span className="text-dim">{"░".repeat(blocks - filled)}</span>
          </span>
          <span className="text-dim">]</span>
          <span className="text-magenta tabular-nums">{Math.floor(progress)}%</span>
        </div>
      </div>
      {done && (
        <p className="mt-6 text-sm tracking-widest text-magenta animate-pulse">
          [ press any key to enter ]
        </p>
      )}
    </div>
  );
}
