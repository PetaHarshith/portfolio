# PLAYER_01 — Portfolio

Single-page portfolio for **Harshith Reddy Peta**. Built as a Valorant-style player profile: career = match history, skills = loadout, live Spotify + Valorant widgets prove the site is alive.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP 3 + ScrollTrigger · Lenis smooth scroll · Bun.

## Develop

```bash
bun install
bun dev          # http://localhost:3000
bun run build    # production build
```

## Live widgets (optional — site works without them)

Copy `.env.local.example` → `.env.local` and fill in what you have. Widgets fall back to a `[ DEMO ]` mock when env vars are missing — the site never breaks.

### Spotify now-playing

1. Create an app at https://developer.spotify.com/dashboard.
2. Set redirect URI to `http://localhost:3000`.
3. Visit (replacing `<CLIENT_ID>`):
   `https://accounts.spotify.com/authorize?client_id=<CLIENT_ID>&response_type=code&redirect_uri=http://localhost:3000&scope=user-read-currently-playing`
4. After approving, copy the `?code=...` query param.
5. Exchange it for a refresh token:
   ```bash
   curl -X POST -H "Authorization: Basic $(echo -n CLIENT_ID:CLIENT_SECRET | base64)" \
     -d grant_type=authorization_code -d code=THE_CODE -d redirect_uri=http://localhost:3000 \
     https://accounts.spotify.com/api/token
   ```
6. Drop `refresh_token` into `.env.local`.

### Valorant rank

Set `NEXT_PUBLIC_RIOT_NAME` / `NEXT_PUBLIC_RIOT_TAG` / `NEXT_PUBLIC_RIOT_REGION` (already pre-filled in `.env.local` for `rasam ninja#beta`). Henrik Dev API requires an API key now — grab a free one at https://docs.henrikdev.xyz and drop into `HENRIK_API_KEY`. Without a key the widget shows pre-filled mock data with the real Riot ID.

## Easter eggs

- Press `` ` `` (backtick) anywhere → fullscreen CRT terminal. Try: `help`, `about`, `work`, `valorant`, `spotify`, `gg`.
- Konami code: `↑↑↓↓←→←→BA` → confetti + RANK UP flash.

## Structure

```
app/             # layout, page, providers, /api routes
components/
  boot/          # first-visit boot animation
  hero/          # main hero + grain overlay
  widgets/       # live Spotify + Valorant cards
  loadout/       # skills bars
  timeline/      # horizontal scroll-pinned match history
  work/          # featured drops
  achievements/  # trophies
  connect/       # contact links
  terminal/      # fullscreen CRT terminal
  ui/            # cursor, nav, magnetic button, etc.
content/         # data from resume (experience, projects, skills)
lib/             # gsap, env, spotify, valorant, konami
hooks/           # useReducedMotion, useKonami
```

## Out of scope (next session)

- Vercel deploy
- `/work/[slug]` case-study pages
- Resend-backed contact form
- GitHub contribution heatmap
- Football fixtures widget
- Light mode
