"use client";

import { useEffect, useState } from "react";

type Props = {
  words: string[];
  interval?: number;
  className?: string;
};

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function GlitchText({ words, interval = 2600, className }: Props) {
  const [text, setText] = useState(words[0] ?? "");

  useEffect(() => {
    let idx = 0;
    let frame = 0;
    let rafId: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const transition = (from: string, to: string) => {
      const length = Math.max(from.length, to.length);
      const queue: { from: string; to: string; start: number; end: number }[] = [];
      for (let i = 0; i < length; i++) {
        queue.push({
          from: from[i] ?? "",
          to: to[i] ?? "",
          start: Math.floor(Math.random() * 20),
          end: 20 + Math.floor(Math.random() * 24),
        });
      }
      frame = 0;
      const step = () => {
        let output = "";
        let complete = 0;
        for (const q of queue) {
          if (frame >= q.end) {
            complete += 1;
            output += q.to;
          } else if (frame >= q.start) {
            output += CHARS[Math.floor(Math.random() * CHARS.length)];
          } else {
            output += q.from;
          }
        }
        setText(output);
        if (complete < queue.length) {
          frame += 1;
          rafId = requestAnimationFrame(step);
        } else {
          timer = setTimeout(loop, interval);
        }
      };
      step();
    };

    const loop = () => {
      const next = (idx + 1) % words.length;
      transition(words[idx], words[next]);
      idx = next;
    };

    timer = setTimeout(loop, interval);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timer) clearTimeout(timer);
    };
  }, [words, interval]);

  return <span className={className}>{text}</span>;
}
