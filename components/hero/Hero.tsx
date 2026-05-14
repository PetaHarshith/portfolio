"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { GlitchText } from "@/components/ui/GlitchText";
import { MagneticButton } from "@/components/ui/MagneticButton";

const PHOTOS = ["/photo-1.jpg?v=3", "/photo-2.jpg?v=3", "/photo-3.jpg?v=3"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhotoIdx((i) => (i + 1) % PHOTOS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(
        "[data-name-line]",
        { yPercent: 110, opacity: 0, filter: "blur(14px)" },
        { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.12 },
        0.2,
      )
        .fromTo(
          "[data-banner]",
          { y: 60, opacity: 0, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 1.1 },
          0.1,
        )
        .fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
          0.5,
        );

      // parallax on banner as the user moves the mouse
      const onMove = (e: PointerEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        gsap.to("[data-banner-tilt]", { x, y, duration: 0.8, ease: "power3.out" });
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: ref },
  );

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[100dvh] flex flex-col px-5 sm:px-10 pt-28 pb-12 overflow-hidden"
    >
      {/* radial spotlight */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 55%, rgba(255,70,85,0.18), transparent 70%), radial-gradient(ellipse 40% 50% at 30% 40%, rgba(110,231,255,0.10), transparent 70%)",
        }}
      />
      {/* hex grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,233,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245,233,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Top status row */}
        <div className="flex items-center justify-between font-mono text-xs sm:text-sm text-dim tracking-widest" data-hero-fade>
          <span className="text-magenta">▰ FEATURED · PLAYER_01</span>
          <span className="text-mint hidden sm:inline">SESSION_2026 · 21:09:58:33</span>
        </div>

        {/* Main two-column: name on left, agent banner on right */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-14 items-center flex-1">
          {/* Left: name + tagline + actions */}
          <div className="relative">
            <h1
              className="font-headline uppercase text-balance text-[clamp(3.4rem,12vw,11rem)]"
              aria-label="Harshith Reddy Peta"
            >
              <span className="overflow-hidden block">
                <span data-name-line className="block">HARSHITH</span>
              </span>
              <span className="overflow-hidden block">
                <span data-name-line className="block text-magenta" style={{ textShadow: "0 0 30px rgba(255,70,85,0.5)" }}>REDDY</span>
              </span>
              <span className="overflow-hidden block">
                <span data-name-line className="block">PETA</span>
              </span>
            </h1>

            <div className="mt-6 font-mono text-base sm:text-lg text-cyan" data-hero-fade>
              <span className="text-dim">&gt; </span>
              <GlitchText
                words={[
                  "engineer.exe",
                  "researcher.exe",
                  "full_stack.exe",
                  "builder.exe",
                ]}
              />
              <span className="text-dim"> ── ONLINE</span>
            </div>

            <div
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed space-y-4"
              style={{ color: "var(--color-ink-dim)" }}
              data-hero-fade
            >
              <p>
                I've worked across <span className="text-magenta">backend systems</span>,{" "}
                <span className="text-cyan">AI tooling</span>, and{" "}
                <span className="text-mint">product-focused full-stack apps</span>.
              </p>
              <p>
                Recently I built an AI agent that compressed a{" "}
                <span className="text-ink">50-page welding manual</span> into an interactive troubleshooting and setup assistant with multimodal support. I've also shipped a mobile app end-to-end that's <span className="text-ink">live on the App Store</span>, and built backend systems focused on reliability, performance, and real-world workflows.
              </p>
              <p>
                One project that shaped how I think was at an Idea Fund hackathon, where I traced nearly{" "}
                <span className="text-mint">$465K stuck in a billing flow</span> back to a single broken state caused by fragmented systems across teams. Fixing it made me realize how important clean workflows and trustworthy systems are.
              </p>
              <p className="text-ink">
                I like moving fast, owning product decisions, and building things people actually use.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3" data-hero-fade>
              <MagneticButton
                as="a"
                href="#career"
                className="relative font-headline uppercase tracking-wider text-xl sm:text-2xl px-8 py-4 bg-mint text-[#0a0f1c] hover:bg-mint/90 transition-colors"
                style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
              >
                IN QUEUE ◆
              </MagneticButton>
              <MagneticButton
                as="a"
                href="/resume.pdf"
                download="harshith-peta-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-headline uppercase tracking-wider text-xl sm:text-2xl px-8 py-4 border border-mint text-mint hover:bg-mint/10 transition-colors"
                style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
              >
                ↓ RESUME
              </MagneticButton>
              <MagneticButton
                as="a"
                href="#connect"
                className="font-headline uppercase tracking-wider text-xl sm:text-2xl px-8 py-4 border border-magenta text-magenta hover:bg-magenta/10 transition-colors"
                style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
              >
                ↳ CONNECT
              </MagneticButton>
            </div>
          </div>

          {/* Right: agent card / banner */}
          <div className="relative flex justify-center lg:justify-end" data-hero-fade>
            <div data-banner data-banner-tilt className="relative w-full max-w-[440px]">
{/* Outer glow */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 blur-3xl opacity-50"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(255,70,85,0.7), transparent 65%)",
                }}
              />

              {/* Card */}
              <div className="relative z-10 bg-[#070b16] border border-white/15">
                {/* Top corner brackets */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-magenta" />
                <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-magenta" />
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-mint" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-mint" />

                {/* Portrait — cycles through 3 photos with cross-fade */}
                <div
                  className="relative w-full overflow-hidden bg-[#070b16]"
                  style={{ aspectRatio: "4 / 5" }}
                >
                  {PHOTOS.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt="Harshith Reddy Peta"
                      className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out"
                      style={{
                        opacity: i === photoIdx ? 1 : 0,
                        transform: i === photoIdx ? "scale(1.02)" : "scale(1)",
                        transition: "opacity 0.8s ease-in-out, transform 6s ease-out",
                      }}
                    />
                  ))}
                  {/* Tinted vignette to integrate the photo into the palette */}
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(10,15,28,0.0) 60%, rgba(10,15,28,0.55) 100%), radial-gradient(ellipse at 50% 0%, rgba(255,70,85,0.12), transparent 65%)",
                    }}
                  />
                  {/* HUD chips */}
                  <div className="absolute top-3 left-3 font-mono text-[10px] tracking-widest text-mint z-10">
                    ▰ READY
                  </div>
                  <div className="absolute top-3 right-3 font-mono text-[10px] tracking-widest text-dim z-10">
                    LVL 22
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] tracking-[0.4em] text-mint z-10">
                    ▰ PLAYER_01
                  </div>
                  {/* Photo carousel dots */}
                  <div className="absolute bottom-9 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {PHOTOS.map((_, i) => (
                      <span
                        key={i}
                        className="h-[3px] transition-all duration-500"
                        style={{
                          width: i === photoIdx ? 22 : 8,
                          background:
                            i === photoIdx ? "var(--color-mint)" : "rgba(245,233,255,0.3)",
                          boxShadow:
                            i === photoIdx ? "0 0 8px var(--color-mint)" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Footer plate */}
                <div className="bg-mint/95 text-[#070b16] px-4 py-2 font-headline uppercase text-2xl tracking-wider text-center">
                  Harshith
                </div>
                <div className="bg-[#070b16] text-dim px-4 py-1 font-mono text-[10px] tracking-widest text-center border-t border-white/5">
                  CS · UW–MADISON · 2026
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Stat bar bottom */}
        <div className="mt-16 lg:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono" data-hero-fade>
          <Stat label="INTERNSHIPS" value="3" sub="shipped" />
          <Stat label="GPA" value="3.8" sub="dean's list 7×" accent="mint" />
          <Stat label="CERTS" value="2" sub="AWS · CP + DA" accent="cyan" />
          <Stat label="UPTIME" value="4 YRS" sub="since 2022" accent="amber" />
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="relative mt-12 overflow-hidden border-y border-white/10 py-3" data-hero-fade>
        <div className="marquee-track flex whitespace-nowrap font-headline uppercase text-2xl sm:text-3xl tracking-wide text-dim">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex">
              {[
                "TypeScript",
                "Next.js",
                "Python",
                "Spring Boot",
                "Postgres",
                "Firestore",
                "AWS",
                "Docker",
                "React Native",
                "GSAP",
                "fMRI",
                "LLMs",
              ].map((t, i) => (
                <span key={`${k}-${i}`} className="px-6 flex items-center gap-3">
                  <span className="text-magenta">◆</span>
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  accent = "magenta",
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "magenta" | "mint" | "cyan" | "amber";
}) {
  const color =
    accent === "mint"
      ? "var(--color-mint)"
      : accent === "cyan"
      ? "var(--color-cyan)"
      : accent === "amber"
      ? "var(--color-amber)"
      : "var(--color-magenta)";
  return (
    <div className="hud bg-bg-2/40 px-4 py-3">
      <div className="text-[11px] tracking-[0.25em] text-dim">{label}</div>
      <div className="font-headline text-3xl sm:text-4xl mt-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-dim mt-1 tracking-wider">{sub}</div>
    </div>
  );
}
