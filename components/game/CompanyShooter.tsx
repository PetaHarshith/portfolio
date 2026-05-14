"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Target = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  name: string;
  width: number;
  accent: string;
  alive: boolean;
  isBomb: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

type FloatText = {
  x: number;
  y: number;
  text: string;
  vy: number;
  life: number;
  color: string;
};

type LeaderEntry = {
  name: string;
  score: number;
  combo: number;
  date: string;
};

const COMPANIES = [
  "ANTHROPIC", "OPENAI", "GOOGLE", "META", "APPLE",
  "MICROSOFT", "STRIPE", "VERCEL", "LINEAR", "NOTION",
  "FIGMA", "CLOUDFLARE", "DATADOG", "DATABRICKS", "NVIDIA",
  "NETFLIX", "SPOTIFY", "DISCORD", "GITHUB", "CURSOR",
  "PERPLEXITY", "MISTRAL", "RAMP", "BREX", "REPLIT",
  "AIRBNB", "UBER", "TESLA", "PALANTIR", "RIPPLING",
];

const ACCENTS = ["#ff4655", "#14f195", "#6ee7ff", "#ffd166"];

const GAME_DURATION = 60;
const COMBO_WINDOW = 1500;
const FLOAT_LIFE = 800;

type GameState = "idle" | "playing" | "ended";

export function CompanyShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session token issued by the server at match start; consumed on submit.
  const sessionRef = useRef<string | null>(null);

  // All game state lives in a ref so we don't re-render every frame.
  const g = useRef({
    targets: [] as Target[],
    particles: [] as Particle[],
    floats: [] as FloatText[],
    mouseX: -100,
    mouseY: -100,
    nextId: 0,
    spawnTimer: 0,
    lastTime: 0,
    width: 800,
    height: 420,
    elapsed: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    comboTimer: 0,
    rafId: null as number | null,
    shake: 0,
    flash: 0,
  });

  // Load leaderboard from the shared backend on mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { board?: LeaderEntry[] }) => {
        if (!cancelled && Array.isArray(data?.board)) {
          setLeaderboard(data.board);
        }
      })
      .catch(() => {
        // leave leaderboard empty if the API is unreachable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startGame = useCallback(() => {
    const s = g.current;
    s.targets = [];
    s.particles = [];
    s.floats = [];
    s.score = 0;
    s.combo = 0;
    s.bestCombo = 0;
    s.comboTimer = 0;
    s.elapsed = 0;
    s.spawnTimer = 0;
    s.shake = 0;
    s.flash = 0;
    s.lastTime = performance.now();
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(GAME_DURATION);
    setSubmitted(false);
    setSubmitting(false);
    setName("");
    setError(null);
    setState("playing");
    // Request a fresh proof-of-play token. Submission still works without
    // one if the call fails (server returns a clear error), but the happy
    // path attaches it.
    sessionRef.current = null;
    fetch("/api/leaderboard/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { ok?: boolean; token?: string }) => {
        if (data?.ok && typeof data.token === "string") {
          sessionRef.current = data.token;
        }
      })
      .catch(() => {
        // best-effort; submit will surface a friendly error if missing
      });
  }, []);

  const endGame = useCallback(() => {
    const s = g.current;
    if (s.rafId !== null) cancelAnimationFrame(s.rafId);
    s.rafId = null;
    setBestCombo(s.bestCombo);
    setState("ended");
  }, []);

  const submitScore = useCallback(async () => {
    if (submitting) return;
    const clean = name.trim().slice(0, 14).toUpperCase();
    if (!clean) {
      setError("Tag required.");
      return;
    }
    // Fast client-side hint: if this tag already exists at a higher score,
    // the server will reject. Show the message immediately. (Server still
    // enforces.)
    const prior = leaderboard.find((e) => e.name === clean);
    if (prior && prior.score >= Math.floor(g.current.score)) {
      setError(
        `"${clean}" already scored ${prior.score.toLocaleString()}. Beat it to update.`,
      );
      return;
    }
    if (!sessionRef.current) {
      setError("Session expired. Start a new match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clean,
          score: Math.floor(g.current.score),
          combo: Math.floor(g.current.bestCombo),
          session: sessionRef.current,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; board: LeaderEntry[] }
        | { ok: false; error: string };
      if (!res.ok || !data.ok) {
        setError(("error" in data && data.error) || "Couldn't submit. Try again.");
        return;
      }
      setLeaderboard(data.board);
      setSubmitted(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [leaderboard, name, submitting]);

  // Resize canvas with DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      g.current.width = rect.width;
      g.current.height = rect.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Pointer handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      g.current.mouseX = e.clientX - rect.left;
      g.current.mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      g.current.mouseX = -100;
      g.current.mouseY = -100;
    };
    const onDown = (e: PointerEvent) => {
      if (state !== "playing") return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const s = g.current;
      // Muzzle flash particles
      for (let i = 0; i < 5; i++) {
        s.particles.push({
          x: cx,
          y: cy,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 0,
          maxLife: 200,
          color: "#fff",
          size: 1.5 + Math.random(),
        });
      }
      // Hit test (topmost first)
      let hit: Target | null = null;
      for (let i = s.targets.length - 1; i >= 0; i--) {
        const t = s.targets[i];
        if (!t.alive) continue;
        if (
          cx >= t.x - t.width / 2 &&
          cx <= t.x + t.width / 2 &&
          cy >= t.y - 18 &&
          cy <= t.y + 18
        ) {
          hit = t;
          break;
        }
      }
      if (hit) {
        hit.alive = false;
        if (hit.isBomb) {
          // PENALTY: -1000, big shake, red flash, combo wiped.
          s.shake = 20;
          s.flash = 1;
          for (let i = 0; i < 36; i++) {
            s.particles.push({
              x: hit.x,
              y: hit.y,
              vx: (Math.random() - 0.5) * 14,
              vy: (Math.random() - 0.5) * 14,
              life: 0,
              maxLife: 700 + Math.random() * 500,
              color: "#ff003c",
              size: 2 + Math.random() * 4,
            });
          }
          s.score -= 1000;
          s.combo = 0;
          s.floats.push({
            x: hit.x,
            y: hit.y,
            text: "−1000 BOMB",
            vy: -0.55,
            life: 0,
            color: "#ff003c",
          });
          setScore(s.score);
          setCombo(0);
        } else {
          s.shake = 8;
          for (let i = 0; i < 22; i++) {
            s.particles.push({
              x: hit.x,
              y: hit.y,
              vx: (Math.random() - 0.5) * 9,
              vy: (Math.random() - 0.5) * 9,
              life: 0,
              maxLife: 600 + Math.random() * 400,
              color: hit.accent,
              size: 2 + Math.random() * 3,
            });
          }
          const base = Math.round(15 + Math.abs(hit.vx) * 7);
          s.combo += 1;
          s.bestCombo = Math.max(s.bestCombo, s.combo);
          s.comboTimer = COMBO_WINDOW;
          const mult = Math.min(s.combo, 8);
          const total = base * mult;
          s.score += total;
          s.floats.push({
            x: hit.x,
            y: hit.y,
            text: mult > 1 ? `+${total} ×${mult}` : `+${total}`,
            vy: -0.5,
            life: 0,
            color: hit.accent,
          });
          setScore(s.score);
          setCombo(s.combo);
        }
      } else {
        if (s.combo > 0) {
          s.combo = 0;
          setCombo(0);
        }
      }
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [state]);

  // Game loop
  useEffect(() => {
    if (state !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    g.current.lastTime = performance.now();

    const spawn = () => {
      const s = g.current;
      const fromLeft = Math.random() > 0.5;
      const cName = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      // ~18% chance to spawn as a bomb — these subtract 1000 if hit.
      const isBomb = Math.random() < 0.18;
      const accent = isBomb ? "#ff003c" : ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
      const width = (isBomb ? 110 : 92) + cName.length * 8.5;
      const t = Math.min(s.elapsed / 50000, 1);
      const baseSpeed = 1.1 + t * 1.6;
      const speed = (0.8 + Math.random() * 0.8) * baseSpeed;
      s.targets.push({
        id: ++s.nextId,
        x: fromLeft ? -width / 2 - 10 : s.width + width / 2 + 10,
        y: 50 + Math.random() * (s.height - 100),
        vx: fromLeft ? speed : -speed,
        vy: (Math.random() - 0.5) * 0.25,
        name: cName,
        width,
        accent,
        alive: true,
        isBomb,
      });
    };

    const drawTarget = (t: Target) => {
      const x = t.x - t.width / 2;
      const y = t.y - 18;
      const h = 36;

      if (t.isBomb) {
        // Pulsing red glow + dashed frame for bombs.
        const pulse = (Math.sin(g.current.elapsed * 0.008) + 1) / 2;
        ctx.save();
        ctx.shadowColor = t.accent;
        ctx.shadowBlur = 18 + pulse * 22;
        ctx.fillStyle = `rgba(255, 0, 60, ${0.18 + pulse * 0.18})`;
        ctx.fillRect(x, y, t.width, h);
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = t.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, t.width, h);
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        // Tiny warning chevrons
        ctx.fillStyle = t.accent;
        ctx.font = "900 14px 'Space Grotesk', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`⚠  ${t.name}  ⚠`, t.x, t.y);
        ctx.restore();
        return;
      }

      ctx.fillStyle = "rgba(10,2,26,0.85)";
      ctx.fillRect(x, y, t.width, h);
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, t.width, h);
      // Corner brackets
      const c = 6;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
      ctx.moveTo(x + t.width - c, y); ctx.lineTo(x + t.width, y); ctx.lineTo(x + t.width, y + c);
      ctx.moveTo(x, y + h - c); ctx.lineTo(x, y + h); ctx.lineTo(x + c, y + h);
      ctx.moveTo(x + t.width - c, y + h); ctx.lineTo(x + t.width, y + h); ctx.lineTo(x + t.width, y + h - c);
      ctx.stroke();
      // Mini dot indicator
      ctx.fillStyle = t.accent;
      ctx.fillRect(x + 6, y + h / 2 - 2, 3, 3);
      // Name
      ctx.fillStyle = t.accent;
      ctx.font = "700 14px 'Space Grotesk', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t.name, t.x + 6, t.y);
    };

    const loop = (now: number) => {
      const s = g.current;
      const dt = Math.min(now - s.lastTime, 50);
      s.lastTime = now;
      s.elapsed += dt;
      s.spawnTimer -= dt;
      s.comboTimer -= dt;
      if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 0.05);
      if (s.flash > 0) s.flash = Math.max(0, s.flash - dt * 0.003);
      if (s.comboTimer <= 0 && s.combo > 0) {
        s.combo = 0;
        setCombo(0);
      }

      // Spawn rate ramps up
      const rate = Math.max(420, 1400 - s.elapsed * 0.025);
      if (s.spawnTimer <= 0) {
        spawn();
        if (s.elapsed > 25000 && Math.random() > 0.6) spawn();
        s.spawnTimer = rate * (0.7 + Math.random() * 0.7);
      }

      // Update targets
      for (const t of s.targets) {
        t.x += t.vx * dt * 0.06;
        t.y += t.vy * dt * 0.06;
        if (t.alive && (t.x < -300 || t.x > s.width + 300)) t.alive = false;
      }
      s.targets = s.targets.filter((t) => t.alive);

      // Update particles
      for (const p of s.particles) {
        p.x += p.vx * dt * 0.1;
        p.y += p.vy * dt * 0.1;
        p.vy += 0.008 * dt;
        p.life += dt;
      }
      s.particles = s.particles.filter((p) => p.life < p.maxLife);

      // Update floats
      for (const f of s.floats) {
        f.y += f.vy * dt * 0.1;
        f.life += dt;
      }
      s.floats = s.floats.filter((f) => f.life < FLOAT_LIFE);

      // Draw
      ctx.save();
      if (s.shake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * s.shake,
          (Math.random() - 0.5) * s.shake,
        );
      }
      ctx.fillStyle = "#070b16";
      ctx.fillRect(0, 0, s.width, s.height);
      // Grid
      ctx.strokeStyle = "rgba(245,233,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < s.width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, s.height);
      }
      for (let y = 0; y < s.height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(s.width, y);
      }
      ctx.stroke();
      // Radial vignette
      const grad = ctx.createRadialGradient(
        s.width / 2,
        s.height / 2,
        Math.min(s.width, s.height) / 3,
        s.width / 2,
        s.height / 2,
        Math.max(s.width, s.height) / 1.2,
      );
      grad.addColorStop(0, "rgba(255,70,85,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s.width, s.height);

      // Red flash overlay when a bomb is hit
      if (s.flash > 0) {
        ctx.fillStyle = `rgba(255, 0, 60, ${s.flash * 0.35})`;
        ctx.fillRect(0, 0, s.width, s.height);
      }

      // Particles
      for (const p of s.particles) {
        const a = Math.max(0, 1 - p.life / p.maxLife);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Targets
      for (const t of s.targets) {
        if (!t.alive) continue;
        drawTarget(t);
      }

      // Floats
      for (const f of s.floats) {
        const a = Math.max(0, 1 - f.life / FLOAT_LIFE);
        ctx.globalAlpha = a;
        ctx.fillStyle = f.color;
        ctx.font = "700 20px 'Bebas Neue', 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(f.text, f.x, f.y - 4);
      }
      ctx.globalAlpha = 1;

      // Crosshair
      const mx = s.mouseX;
      const my = s.mouseY;
      if (mx >= 0 && my >= 0) {
        ctx.strokeStyle = "#ff4655";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#14f195";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mx - 24, my);
        ctx.lineTo(mx - 10, my);
        ctx.moveTo(mx + 10, my);
        ctx.lineTo(mx + 24, my);
        ctx.moveTo(mx, my - 24);
        ctx.lineTo(mx, my - 10);
        ctx.moveTo(mx, my + 10);
        ctx.lineTo(mx, my + 24);
        ctx.stroke();
        ctx.fillStyle = "#14f195";
        ctx.beginPath();
        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Time
      const remaining = Math.max(0, GAME_DURATION - s.elapsed / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        endGame();
        return;
      }
      s.rafId = requestAnimationFrame(loop);
    };

    g.current.rafId = requestAnimationFrame(loop);
    return () => {
      if (g.current.rafId !== null) cancelAnimationFrame(g.current.rafId);
      g.current.rafId = null;
    };
  }, [state, endGame]);

  // Format helpers
  const fmtTime = (t: number) => {
    const sec = Math.ceil(t);
    return `0:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <section id="range" className="relative px-5 sm:px-10 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="05 · FIRING_RANGE"
          title="SHOOT THE COMPANIES."
          sub="60 seconds. Click company names to take them down. Hit them fast for combo multipliers. Top 10 scores stick around, so leave your tag."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          {/* GAME PANEL */}
          <div className="hud bg-bg-2/40 p-4 sm:p-5 flex flex-col">
            {/* HUD bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 font-mono text-xs">
              <HudStat label="TIME" value={fmtTime(timeLeft)} accent="magenta" pulse={timeLeft < 10 && state === "playing"} />
              <HudStat label="SCORE" value={score.toLocaleString()} accent="mint" />
              <HudStat label="COMBO" value={combo > 0 ? `×${Math.min(combo, 8)}` : "—"} accent="cyan" />
              <HudStat label="BEST" value={(leaderboard[0]?.score ?? 0).toLocaleString()} accent="amber" />
            </div>

            {/* Canvas wrapper */}
            <div
              className="relative w-full"
              style={{ aspectRatio: "16 / 9", minHeight: 320, maxHeight: 520 }}
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
                style={{
                  cursor: state === "playing" ? "none" : "default",
                  // Only steal touch when actively playing — otherwise let the
                  // user scroll the page by panning over the canvas area.
                  touchAction: state === "playing" ? "none" : "auto",
                  border: "1px solid var(--color-line)",
                  background: "#070b16",
                }}
              />

              {/* Overlays */}
              {state === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#070b16]/80 backdrop-blur-sm">
                  <div className="text-center px-6">
                    <div className="font-mono text-xs tracking-[0.3em] text-magenta mb-3">
                      ▰ READY TO QUEUE
                    </div>
                    <h3 className="font-headline uppercase text-4xl sm:text-6xl leading-none tracking-wide">
                      Firing Range
                    </h3>
                    <p className="mt-4 max-w-md mx-auto font-mono text-sm text-dim">
                      60 seconds. Aim. Click. Build combos for bigger multipliers.
                      <span className="block mt-1 text-[#ff003c]">
                        ⚠ Avoid the red pulsing ones. Bombs cost you −1000.
                      </span>
                    </p>
                    <button
                      onClick={startGame}
                      data-magnetic
                      className="mt-7 font-headline uppercase tracking-wider text-xl sm:text-2xl px-9 py-3 bg-mint text-[#070b16] hover:bg-mint/90 transition-colors"
                      style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
                    >
                      ▸ START MATCH
                    </button>
                  </div>
                </div>
              )}

              {state === "ended" && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#070b16]/85 backdrop-blur-sm overflow-y-auto">
                  <div className="text-center px-6 py-4 max-w-md">
                    <div className="font-mono text-xs tracking-[0.3em] text-magenta mb-3">
                      ▰ TIME UP · MATCH ENDED
                    </div>
                    <div className="font-headline uppercase text-5xl sm:text-7xl text-mint leading-none">
                      {score.toLocaleString()}
                    </div>
                    <div className="font-mono text-xs text-dim mt-2 tracking-widest">
                      BEST COMBO ×{Math.min(bestCombo, 8)}
                    </div>

                    {!submitted ? (
                      <div className="mt-6">
                        <div className="font-mono text-[10px] tracking-[0.3em] text-dim mb-2">
                          ENTER YOUR TAG
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitScore();
                          }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="flex gap-2 justify-center">
                            <input
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError(null);
                              }}
                              maxLength={14}
                              spellCheck={false}
                              autoComplete="off"
                              placeholder="PLAYER_02"
                              className="bg-[#070b16] font-mono text-base px-3 py-2 outline-none w-44 uppercase tracking-widest text-magenta border focus:border-mint"
                              style={{
                                borderColor: error
                                  ? "#ff003c"
                                  : "rgba(255,70,85,0.6)",
                              }}
                            />
                            <button
                              type="submit"
                              disabled={!name.trim() || submitting}
                              className="font-headline uppercase tracking-wider text-lg px-5 py-2 bg-magenta text-[#070b16] disabled:opacity-40 hover:bg-magenta/90 transition-colors"
                            >
                              {submitting ? "SUBMITTING…" : "SUBMIT"}
                            </button>
                          </div>
                          {error && (
                            <div
                              role="alert"
                              className="font-mono text-xs tracking-widest uppercase mt-1"
                              style={{ color: "#ff003c" }}
                            >
                              ▰ {error}
                            </div>
                          )}
                        </form>
                      </div>
                    ) : (
                      <div className="mt-6 font-mono text-mint text-sm tracking-widest">
                        ▰ TAG REGISTERED
                      </div>
                    )}

                    <button
                      onClick={startGame}
                      className="mt-6 font-headline uppercase tracking-wider text-lg px-7 py-2.5 border border-mint text-mint hover:bg-mint/10 transition-colors"
                      style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
                    >
                      ↻ PLAY AGAIN
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[11px] tracking-widest text-dim">
              <span>▰ click targets · combo within 1.5s · <span style={{ color: "#ff003c" }}>bombs −1000</span></span>
              <span>v0.1</span>
            </div>
          </div>

          {/* LEADERBOARD */}
          <div className="hud hud-mint bg-bg-2/40 p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-xs tracking-widest text-mint">
                ▰ LEADERBOARD
              </div>
              <div className="font-mono text-[10px] tracking-widest text-dim">
                TOP 10 · LOCAL
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center px-4 min-h-[280px]">
                <div>
                  <div className="font-headline uppercase text-2xl text-dim leading-none">
                    Empty Server.
                  </div>
                  <div className="mt-2 font-mono text-xs text-dim tracking-widest">
                    Be the first to leave a tag.
                  </div>
                </div>
              </div>
            ) : (
              <ol className="flex flex-col gap-1.5 font-mono">
                {leaderboard.map((e, i) => (
                  <li
                    key={`${e.name}-${e.date}`}
                    className="flex items-baseline gap-3 px-2.5 py-2 hud"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(90deg, rgba(20,241,149,0.18), transparent)"
                          : i < 3
                          ? "rgba(255,255,255,0.02)"
                          : "transparent",
                      borderColor:
                        i === 0 ? "var(--color-mint)" : "var(--color-line)",
                    }}
                  >
                    <span
                      className="text-xs tabular-nums w-6 text-right tracking-widest"
                      style={{
                        color:
                          i === 0
                            ? "var(--color-mint)"
                            : i < 3
                            ? "var(--color-magenta)"
                            : "var(--color-ink-dim)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex-1 truncate text-sm tracking-widest"
                      style={{
                        color:
                          i === 0 ? "var(--color-ink)" : "var(--color-ink-dim)",
                      }}
                    >
                      {e.name}
                    </span>
                    <span className="text-[10px] text-dim tracking-widest">
                      ×{Math.min(e.combo, 8)}
                    </span>
                    <span
                      className="text-base tabular-nums font-bold"
                      style={{
                        color:
                          i === 0
                            ? "var(--color-mint)"
                            : "var(--color-ink)",
                      }}
                    >
                      {e.score.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HudStat({
  label,
  value,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  accent: "magenta" | "mint" | "cyan" | "amber";
  pulse?: boolean;
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
    <div className="hud bg-bg-2/60 px-3 py-2">
      <div className="text-[10px] tracking-[0.25em] text-dim">{label}</div>
      <div
        className={`font-headline text-2xl sm:text-3xl tracking-wide leading-none mt-0.5 tabular-nums ${pulse ? "animate-pulse" : ""}`}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
