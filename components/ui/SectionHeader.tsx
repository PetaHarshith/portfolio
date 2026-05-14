"use client";

import { SplitTextReveal } from "./SplitTextReveal";

type Props = {
  eyebrow: string;
  title: string;
  sub?: string;
};

export function SectionHeader({ eyebrow, title, sub }: Props) {
  return (
    <div>
      <div className="font-mono text-xs sm:text-sm tracking-[0.35em] text-magenta">
        {eyebrow}
      </div>
      <SplitTextReveal
        as="h2"
        className="mt-3 font-headline uppercase text-balance leading-[0.9] tracking-wide text-5xl sm:text-7xl lg:text-8xl"
      >
        {title}
      </SplitTextReveal>
      {sub && (
        <p
          className="mt-5 max-w-2xl text-lg sm:text-xl leading-relaxed"
          style={{ color: "var(--color-ink-dim)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
