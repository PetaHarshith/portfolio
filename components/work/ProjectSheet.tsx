"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { projects } from "@/content/projects";
import { projectDetails, type DetailBlock } from "@/content/projectDetails";

const ACCENT = {
  magenta: "var(--color-magenta)",
  mint: "var(--color-mint)",
  cyan: "var(--color-cyan)",
  amber: "var(--color-amber)",
} as const;

export function ProjectSheet() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) {
      setActiveId(null);
      return;
    }
    gsap.to(panel, { xPercent: 100, duration: 0.5, ease: "expo.in" });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => setActiveId(null),
    });
  }, []);

  // Listen for open events from anywhere
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id && projectDetails[id]) setActiveId(id);
    };
    window.addEventListener("portfolio:open-project", onOpen);
    return () => window.removeEventListener("portfolio:open-project", onOpen);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  // Body scroll lock + animation in
  useEffect(() => {
    if (!activeId) return;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("portfolio:lock-scroll"));

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (overlay && panel) {
      gsap.set(overlay, { opacity: 0 });
      gsap.set(panel, { xPercent: 100 });
      gsap.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(panel, { xPercent: 0, duration: 0.65, ease: "expo.out", delay: 0.05 });
      // Stagger content reveal
      const items = panel.querySelectorAll<HTMLElement>("[data-block]");
      gsap.fromTo(
        items,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.04, delay: 0.25 },
      );
    }
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("portfolio:unlock-scroll"));
    };
  }, [activeId]);

  if (!activeId) return null;
  const detail = projectDetails[activeId];
  if (!detail) return null;
  const project = projects.find((p) => p.id === activeId);
  const accent = project?.accent ?? "magenta";

  return (
    <div className="fixed inset-0 z-[92]">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[#03070f]/85 backdrop-blur-md"
        onClick={close}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full lg:w-[min(960px,92vw)] bg-[#070b16] border-l border-white/15 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] flex flex-col"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 sm:px-10 py-4 flex-shrink-0">
          <div className="font-mono text-xs sm:text-sm tracking-widest text-dim flex items-center gap-3">
            <span style={{ color: ACCENT[accent] }}>◆</span>
            <span>{detail.eyebrow}</span>
          </div>
          <button
            onClick={close}
            className="font-mono text-sm tracking-widest text-dim hover:text-mint transition-colors flex items-center gap-2"
            aria-label="Close project details"
          >
            CLOSE [ ESC ]
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollerRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <article className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
            <div data-block>
              <h1
                className="font-headline uppercase leading-[0.9] text-balance tracking-wide text-[clamp(2.6rem,7vw,5.5rem)]"
                style={{ color: ACCENT[accent] }}
              >
                {project?.name ?? detail.id.toUpperCase()}
              </h1>
              <p
                className="mt-5 font-mono text-base sm:text-lg tracking-wide"
                style={{ color: "var(--color-ink)" }}
              >
                {detail.subhead}
              </p>
            </div>

            <div
              data-block
              className="mt-9 pl-5 border-l-2 text-lg sm:text-xl leading-relaxed"
              style={{ borderColor: ACCENT[accent], color: "var(--color-ink)" }}
            >
              {detail.intro}
            </div>

            <div className="mt-12 flex flex-col gap-7 text-lg leading-relaxed">
              {detail.blocks.map((b, i) => (
                <Block key={i} block={b} accent={accent} />
              ))}
            </div>

            {project && (
              <div data-block className="mt-12 pt-8 border-t border-white/10">
                <div className="font-mono text-xs tracking-[0.3em] text-dim mb-3">
                  STACK
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs tracking-widest border border-white/15 px-3 py-1.5 uppercase"
                      style={{ color: "var(--color-ink-dim)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {detail.links?.length ? (
              <div data-block className="mt-8 flex flex-wrap gap-3">
                {detail.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-headline uppercase tracking-wider text-lg sm:text-xl px-6 py-3 hover:bg-white/5 transition-colors"
                    style={{
                      border: `1px solid ${ACCENT[accent]}`,
                      color: ACCENT[accent],
                      clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                    }}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            ) : null}

            <div data-block className="mt-16 font-mono text-xs text-dim tracking-widest">
              ▰ END OF FILE · close [esc] · or click backdrop
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function Block({
  block,
  accent,
}: {
  block: DetailBlock;
  accent: "magenta" | "mint" | "cyan" | "amber";
}) {
  switch (block.type) {
    case "h":
      return (
        <h2
          data-block
          className="font-headline uppercase tracking-wide leading-[0.95] text-3xl sm:text-4xl mt-6"
          style={{ color: "var(--color-ink)" }}
        >
          <span style={{ color: ACCENT[accent] }}>▰</span> {block.text}
        </h2>
      );
    case "p":
      return (
        <p
          data-block
          className="text-lg sm:text-xl leading-relaxed"
          style={{ color: "var(--color-ink-dim)" }}
        >
          {block.text}
        </p>
      );
    case "callout":
      return (
        <div
          data-block
          className="hud p-5 sm:p-6 my-2"
          style={{
            borderColor: ACCENT[block.tone],
            background: "rgba(255,255,255,0.02)",
            boxShadow: `0 0 30px ${ACCENT[block.tone]}22`,
          }}
        >
          <div
            className="font-mono text-[11px] tracking-[0.3em] mb-2"
            style={{ color: ACCENT[block.tone] }}
          >
            ◆ {block.label}
          </div>
          <p
            className="text-lg sm:text-xl leading-relaxed"
            style={{ color: "var(--color-ink)" }}
          >
            {block.text}
          </p>
        </div>
      );
    case "list":
      return (
        <ul data-block className="flex flex-col gap-3 text-lg leading-relaxed">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1" style={{ color: ACCENT[accent] }}>
                ▸
              </span>
              <span style={{ color: "var(--color-ink-dim)" }}>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre
          data-block
          className="font-mono text-sm sm:text-base bg-[#03070f] border border-white/10 p-4 sm:p-5 overflow-x-auto leading-relaxed"
          style={{ color: "var(--color-mint)" }}
        >
          {block.text}
        </pre>
      );
    case "quote":
      return (
        <blockquote
          data-block
          className="relative pl-6 border-l-4 italic text-xl sm:text-2xl leading-snug font-display"
          style={{
            borderColor: ACCENT[accent],
            color: "var(--color-ink)",
          }}
        >
          “{block.text}”
        </blockquote>
      );
    case "stats":
      return (
        <div
          data-block
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono"
        >
          {block.items.map((s) => (
            <div key={s.label} className="hud bg-bg-2/40 px-4 py-3">
              <div className="text-[10px] tracking-[0.25em] text-dim">
                {s.label}
              </div>
              <div
                className="font-headline text-2xl sm:text-3xl mt-1 tracking-wide leading-none"
                style={{ color: ACCENT[accent] }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      );
  }
}
