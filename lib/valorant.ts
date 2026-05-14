import { publicEnv, serverEnv } from "./env";

const BASE = "https://api.henrikdev.xyz/valorant";

export type ValorantSnapshot = {
  account: { name: string; tag: string; level: number; cardUrl?: string };
  rank: { tier: string; rr: number; elo: number; tierIconUrl?: string };
  lastMatch?: {
    map: string;
    mode: string;
    agent: string;
    kills: number;
    deaths: number;
    assists: number;
    result: "WIN" | "LOSS" | "DRAW";
    score: string;
  };
};

function authHeaders() {
  const key = serverEnv.HENRIK_API_KEY;
  return key ? { Authorization: key } : undefined;
}

export async function fetchValorant(): Promise<ValorantSnapshot | null> {
  const name = publicEnv.NEXT_PUBLIC_RIOT_NAME;
  const tag = publicEnv.NEXT_PUBLIC_RIOT_TAG;
  const region = publicEnv.NEXT_PUBLIC_RIOT_REGION;
  if (!name || !tag) return null;

  const safeName = encodeURIComponent(name);
  const safeTag = encodeURIComponent(tag);
  const headers = authHeaders();

  try {
    const [accRes, mmrRes, matchesRes] = await Promise.all([
      fetch(`${BASE}/v1/account/${safeName}/${safeTag}`, {
        next: { revalidate: 600 },
        headers,
      }),
      fetch(`${BASE}/v2/mmr/${region}/${safeName}/${safeTag}`, {
        next: { revalidate: 300 },
        headers,
      }),
      fetch(`${BASE}/v3/matches/${region}/${safeName}/${safeTag}?size=1`, {
        next: { revalidate: 600 },
        headers,
      }),
    ]);

    if (!accRes.ok || !mmrRes.ok) return null;
    const accJson = await accRes.json();
    const mmrJson = await mmrRes.json();
    const matchesJson = matchesRes.ok ? await matchesRes.json() : null;

    const acc = accJson.data;
    const mmr = mmrJson.data?.current_data ?? mmrJson.data;

    const snapshot: ValorantSnapshot = {
      account: {
        name: acc?.name ?? name,
        tag: acc?.tag ?? tag,
        level: acc?.account_level ?? 0,
        cardUrl: acc?.card?.small,
      },
      rank: {
        tier: mmr?.currenttierpatched ?? "Unranked",
        rr: mmr?.ranking_in_tier ?? 0,
        elo: mmr?.elo ?? 0,
        tierIconUrl: mmr?.images?.small,
      },
    };

    const match = matchesJson?.data?.[0];
    if (match) {
      const me = match.players?.all_players?.find(
        (p: { name: string; tag: string }) =>
          p.name?.toLowerCase() === name.toLowerCase() && p.tag?.toLowerCase() === tag.toLowerCase(),
      );
      if (me) {
        const teamColor = me.team?.toLowerCase();
        const team = match.teams?.[teamColor];
        const enemy = match.teams?.[teamColor === "blue" ? "red" : "blue"];
        const result: "WIN" | "LOSS" | "DRAW" = team?.has_won
          ? "WIN"
          : enemy?.has_won
          ? "LOSS"
          : "DRAW";
        snapshot.lastMatch = {
          map: match.metadata?.map ?? "Unknown",
          mode: match.metadata?.mode ?? "Unrated",
          agent: me.character ?? "Unknown",
          kills: me.stats?.kills ?? 0,
          deaths: me.stats?.deaths ?? 0,
          assists: me.stats?.assists ?? 0,
          result,
          score: `${team?.rounds_won ?? 0}–${enemy?.rounds_won ?? 0}`,
        };
      }
    }

    return snapshot;
  } catch {
    return null;
  }
}
