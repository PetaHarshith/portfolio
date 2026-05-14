"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Snappy dot: glued to the pointer
    const xDot = gsap.quickTo(dot, "x", { duration: 0.04, ease: "power2.out" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.04, ease: "power2.out" });
    // Ring: just enough trail to feel premium without lag
    const xRing = gsap.quickTo(ring, "x", { duration: 0.18, ease: "expo.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.18, ease: "expo.out" });

    const onMove = (e: PointerEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const setHover = (active: boolean) => {
      gsap.to(ring, {
        scale: active ? 1.8 : 1,
        borderColor: active ? "var(--color-mint)" : "var(--color-magenta)",
        duration: 0.28,
        ease: "expo.out",
      });
      gsap.to(dot, {
        scale: active ? 0 : 1,
        duration: 0.2,
        ease: "expo.out",
      });
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a, button, [data-magnetic], [role='button']")) setHover(true);
    };
    const onOut = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a, button, [data-magnetic], [role='button']")) setHover(false);
    };

    // Click feedback — quick contract + rebound
    const onDown = () => {
      gsap.to(ring, { scale: 0.6, duration: 0.12, ease: "power2.out" });
    };
    const onUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.45)" });
    };

    // Soft fade in on first move so it doesn't pop at (0,0)
    gsap.set([dot, ring], { opacity: 0 });
    const onFirstMove = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.25, ease: "power2.out" });
      window.removeEventListener("pointermove", onFirstMove);
    };
    window.addEventListener("pointermove", onFirstMove);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onFirstMove);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[110] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          width: 32,
          height: 32,
          borderColor: "var(--color-magenta)",
          boxShadow: "0 0 14px rgba(255,70,85,0.55)",
          mixBlendMode: "screen",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[111] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 6,
          height: 6,
          background: "var(--color-mint)",
          boxShadow: "0 0 12px var(--color-mint)",
        }}
      />
    </>
  );
}
