"use client";

import { useEffect } from "react";
import { KONAMI } from "@/lib/konami";

export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const expected = KONAMI[idx];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        idx += 1;
        if (idx === KONAMI.length) {
          idx = 0;
          onUnlock();
        }
      } else {
        idx = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock]);
}
