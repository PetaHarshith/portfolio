"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  delay?: number;
  stagger?: number;
};

export function SplitTextReveal({
  children,
  className,
  as = "h2",
  delay = 0,
  stagger = 0.03,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const text = el.textContent ?? "";
      el.textContent = "";
      const chars: HTMLSpanElement[] = [];
      for (const char of text) {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity, filter";
        if (char === " ") span.innerHTML = "&nbsp;";
        el.appendChild(span);
        chars.push(span);
      }

      gsap.fromTo(
        chars,
        { yPercent: 110, opacity: 0, filter: "blur(8px)" },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "expo.out",
          stagger,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      return () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === el) t.kill();
        });
      };
    },
    { scope: ref },
  );

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
      {children}
    </Tag>
  );
}
