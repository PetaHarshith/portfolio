"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { MagneticButton } from "@/components/ui/MagneticButton";

const LINKS = [
  {
    label: "EMAIL",
    value: "harshithapps47@gmail.com",
    href: "mailto:harshithapps47@gmail.com",
    accent: "magenta",
  },
  {
    label: "LINKEDIN",
    value: "/in/harshithpeta",
    href: "https://www.linkedin.com/in/harshithpeta/",
    accent: "cyan",
  },
  {
    label: "GITHUB",
    value: "/PetaHarshith",
    href: "https://github.com/PetaHarshith",
    accent: "mint",
  },
  {
    label: "PHONE",
    value: "+1 (608) 419-3565",
    href: "tel:+16084193565",
    accent: "amber",
  },
] as const;

const ACCENT = {
  magenta: "var(--color-magenta)",
  mint: "var(--color-mint)",
  cyan: "var(--color-cyan)",
  amber: "var(--color-amber)",
} as const;

export function Connect() {
  return (
    <section id="connect" className="relative px-5 sm:px-10 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="06 · CONNECT"
          title="OPEN TO ROLES."
          sub="If you're hiring engineers who actually like shipping — or building something weird and ambitious — reach out. I'm fastest on email."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LINKS.map((l) => (
            <MagneticButton
              key={l.label}
              as="a"
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="hud bg-bg-2/40 p-7 sm:p-8 flex items-center justify-between gap-4 group transition-colors hover:bg-bg-2/80"
            >
              <div className="text-left">
                <div
                  className="font-mono text-xs tracking-[0.3em]"
                  style={{ color: ACCENT[l.accent] }}
                >
                  ▰ {l.label}
                </div>
                <div className="font-headline uppercase tracking-wide text-2xl sm:text-3xl mt-2 truncate">
                  {l.value}
                </div>
              </div>
              <div
                className="font-headline text-3xl sm:text-4xl"
                style={{ color: ACCENT[l.accent] }}
              >
                →
              </div>
            </MagneticButton>
          ))}
        </div>

        <div className="mt-10 font-mono text-sm text-dim tracking-widest flex flex-wrap gap-x-6 gap-y-2">
          <span>▰ press <span className="text-magenta">`</span> to open the terminal</span>
          <span>▰ try the konami code <span className="text-mint">↑↑↓↓←→←→BA</span></span>
        </div>
      </div>
    </section>
  );
}
