import { serverEnv } from "./env";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

export type NowPlaying =
  | {
      isPlaying: true;
      title: string;
      artist: string;
      album: string;
      albumArt: string;
      progressMs: number;
      durationMs: number;
      url: string;
    }
  | {
      isPlaying: false;
      source?: "paused" | "recent";
      lastPlayed?: {
        title: string;
        artist: string;
        album: string;
        albumArt: string;
        url: string;
        playedAt?: string;
      };
    };

async function getAccessToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = serverEnv;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

async function fetchRecentlyPlayed(token: string): Promise<NowPlaying> {
  const res = await fetch(RECENT_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { isPlaying: false };
  const data = await res.json();
  const item = data?.items?.[0];
  if (!item?.track) return { isPlaying: false };
  return {
    isPlaying: false,
    source: "recent",
    lastPlayed: {
      title: item.track.name as string,
      artist: (item.track.artists as { name: string }[]).map((a) => a.name).join(", "),
      album: item.track.album?.name as string,
      albumArt: item.track.album?.images?.[0]?.url as string,
      url: item.track.external_urls?.spotify as string,
      playedAt: item.played_at as string,
    },
  };
}

export async function fetchNowPlaying(): Promise<NowPlaying> {
  const token = await getAccessToken();
  if (!token) return { isPlaying: false };

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // 204 = no track currently playing → fall back to recently played
  if (res.status === 204) {
    return fetchRecentlyPlayed(token);
  }
  if (res.status > 400) return { isPlaying: false };

  const data = await res.json();
  if (!data?.item) {
    return fetchRecentlyPlayed(token);
  }

  const track = {
    title: data.item.name as string,
    artist: (data.item.artists as { name: string }[]).map((a) => a.name).join(", "),
    album: data.item.album?.name as string,
    albumArt: data.item.album?.images?.[0]?.url as string,
    url: data.item.external_urls?.spotify as string,
  };

  if (!data.is_playing) {
    return { isPlaying: false, source: "paused", lastPlayed: track };
  }

  return {
    isPlaying: true,
    ...track,
    progressMs: data.progress_ms as number,
    durationMs: data.item.duration_ms as number,
  };
}
