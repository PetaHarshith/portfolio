"use client";

import { useEffect, useRef } from "react";

export function GrainOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const W = 220;
    const H = 220;
    canvas.width = W;
    canvas.height = H;

    let raf = 0;
    let last = 0;
    const FPS = 14;
    const frameMs = 1000 / FPS;

    const draw = (time: number) => {
      if (time - last >= frameMs) {
        last = time;
        const img = ctx.createImageData(W, H);
        const data = img.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 28;
        }
        ctx.putImageData(img, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[58] h-full w-full mix-blend-overlay opacity-[0.55]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
