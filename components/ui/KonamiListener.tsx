"use client";

import { useCallback, useEffect, useState } from "react";
import { useKonami } from "@/hooks/useKonami";

export function KonamiListener() {
  const [active, setActive] = useState(false);

  const trigger = useCallback(() => {
    setActive(true);
    setTimeout(() => setActive(false), 2400);
  }, []);

  useKonami(trigger);

  useEffect(() => {
    const onCelebrate = () => trigger();
    window.addEventListener("portfolio:celebrate", onCelebrate);
    window.addEventListener("portfolio:gg", onCelebrate);
    return () => {
      window.removeEventListener("portfolio:celebrate", onCelebrate);
      window.removeEventListener("portfolio:gg", onCelebrate);
    };
  }, [trigger]);

  if (!active) return null;

  const confetti = Array.from({ length: 80 });
  const colors = ["#ff4655", "#14f195", "#6ee7ff", "#ffd166"];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-magenta/10" style={{ background: "rgba(255,70,85,0.05)" }} />
      <div className="hud px-10 py-6 bg-bg-2/80 backdrop-blur">
        <p className="font-mono text-mint text-2xl sm:text-4xl tracking-widest">
          ▰▰ RANK UP ▰▰
        </p>
        <p className="font-mono text-xs sm:text-sm text-dim mt-2 tracking-widest text-center">
          KONAMI · GG WP
        </p>
      </div>
      {confetti.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.2 + Math.random() * 1.2;
        const color = colors[i % colors.length];
        const size = 4 + Math.random() * 6;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-10px",
              left: `${left}%`,
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 8px ${color}`,
              animation: `confetti ${duration}s ${delay}s ease-out forwards`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes confetti {
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
