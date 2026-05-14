"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Line = { kind: "in" | "out"; text: string };

const HELP = `available commands:
  help          list commands
  about         who is harshith
  availability  current status, role, location
  work          recent projects
  skills        tech loadout
  contact       ways to reach me
  resume        download resume pdf
  valorant      current rank
  spotify       now playing
  gg            good game
  clear         clear screen
  exit          close terminal`;

const ABOUT = `harshith reddy peta · cs @ uw-madison · grad may 2026
4 roles shipped across research, ai/ml, full-stack, and backend.
currently building truthgap, running behavioral pipelines for
prof. moreira's lab at uw, and probably listening to something
right now. v hard to find offline. queue up in valorant if you do.`;

const AVAILABILITY = `[ status     ] available
[ grad       ] may 2026
[ roles      ] new grad swe · founding engineer
[ location   ] open to relocate
[ best email ] harshithapps47@gmail.com`;

const WORK = `▰ truthgap      ai doc checker · ts/next/llms (wip, started may 2026)
▰ idea-fund     sales-to-finance workflow · hackathon · spring 2026 (shipped)
▰ apptrack      full-stack job tracker · ec2 + postgres (live)
▰ uw-research   behavioral analysis framework · python (ongoing)`;

const SKILLS = `primary:   typescript · python · java · sql · javascript · c · bash
secondary: react · react native · next.js · spring boot · flask · docker · gsap
utility:   postgres · firestore · mongodb · rest/websockets · aws · gcp · linux · ci-cd`;

const CONTACT = `email     harshithapps47@gmail.com
phone     +1 (608) 419-3565
linkedin  linkedin.com/in/harshithpeta
github    github.com/PetaHarshith
web       harshithpeta.com`;

const RESUME = `↓ resume.pdf  150 kb  ·  https://harshithpeta.com/resume.pdf
opening in a new tab...`;

const BANNER = ` ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
   HARSHITH_OS shell v0.1.0 · type \`help\` to begin
 ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰`;

export function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: BANNER },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const print = useCallback((text: string) => {
    setLines((prev) => [...prev, { kind: "out", text }]);
  }, []);

  const onSubmit = useCallback(
    async (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      setLines((prev) => [...prev, { kind: "in", text: raw }]);
      switch (cmd) {
        case "":
          break;
        case "help":
          print(HELP);
          break;
        case "about":
          print(ABOUT);
          break;
        case "availability":
        case "status":
          print(AVAILABILITY);
          break;
        case "work":
          print(WORK);
          break;
        case "skills":
          print(SKILLS);
          break;
        case "contact":
          print(CONTACT);
          break;
        case "resume":
        case "cv":
          print(RESUME);
          window.open("/resume.pdf", "_blank", "noopener,noreferrer");
          break;
        case "valorant":
          print("fetching valorant...");
          try {
            const res = await fetch("/api/valorant", { cache: "no-store" });
            const j = await res.json();
            print(
              `rank: ${j?.rank?.tier ?? "?"} (${j?.rank?.rr ?? 0} rr)\nlast: ${j?.lastMatch?.map ?? "?"} · ${j?.lastMatch?.kills}/${j?.lastMatch?.deaths}/${j?.lastMatch?.assists} · ${j?.lastMatch?.result}`,
            );
          } catch {
            print("[error] valorant api unavailable");
          }
          break;
        case "spotify":
          print("fetching spotify...");
          try {
            const res = await fetch("/api/spotify", { cache: "no-store" });
            const j = await res.json();
            if (j.isPlaying) {
              print(`▶ ${j.title} · ${j.artist}`);
            } else if (j.lastPlayed) {
              const label = j.source === "paused" ? "❚❚ paused" : "● last played";
              print(`${label}: ${j.lastPlayed.title} · ${j.lastPlayed.artist}`);
            } else {
              print("● standby. Nothing in the queue.");
            }
          } catch {
            print("[error] spotify api unavailable");
          }
          break;
        case "gg":
          print("gg wp. you found the secret command. enjoy the confetti.");
          setTimeout(() => {
            setOpen(false);
            window.dispatchEvent(new CustomEvent("portfolio:gg"));
          }, 400);
          break;
        case "clear":
          setLines([{ kind: "out", text: BANNER }]);
          break;
        case "exit":
        case "quit":
          setOpen(false);
          break;
        case "whoami":
          print("PLAYER_01");
          break;
        case "ls":
          print("hero/  career/  store/  live/  range/  connect/");
          break;
        case "date":
          print(new Date().toString());
          break;
        default:
          print(`command not found: ${cmd}\ntry 'help'`);
      }
    },
    [print],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        if (
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        )
          return;
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("portfolio:lock-scroll"));
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("portfolio:unlock-scroll"));
    }
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("portfolio:unlock-scroll"));
    };
  }, [open]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [lines]);

  // listen to gg from terminal → trigger konami-style confetti via window event
  useEffect(() => {
    const onGG = () => {
      const evt = new KeyboardEvent("keydown", { key: "g" });
      // simplest: just dispatch a custom event the Konami listener can intercept
      window.dispatchEvent(new CustomEvent("portfolio:celebrate"));
      void evt;
    };
    window.addEventListener("portfolio:gg", onGG);
    return () => window.removeEventListener("portfolio:gg", onGG);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] bg-[#0a0f1c]/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="hud bg-[#03070f]/95 w-full max-w-3xl h-[78vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 font-mono text-sm tracking-widest">
          <span className="text-magenta">▰▰ HARSHITH@OS:~/portfolio$</span>
          <button
            onClick={() => setOpen(false)}
            className="text-dim hover:text-mint transition-colors"
            aria-label="close terminal"
          >
            [ ESC ]
          </button>
        </div>
        <div
          ref={scrollerRef}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 font-mono text-base sm:text-lg text-mint leading-relaxed"
        >
          {lines.map((l, i) => (
            <pre
              key={i}
              className="whitespace-pre-wrap break-words"
              style={{ color: l.kind === "in" ? "var(--color-magenta)" : "var(--color-mint)" }}
            >
              {l.kind === "in" ? `> ${l.text}` : l.text}
            </pre>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(input);
            setInput("");
          }}
          className="border-t border-white/10 px-4 py-3 flex items-center gap-2 font-mono text-base sm:text-lg"
        >
          <span className="text-magenta">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-mint placeholder:text-dim"
            placeholder="type 'help' and press enter"
          />
          <span className="text-dim animate-pulse">_</span>
        </form>
      </div>
    </div>
  );
}
