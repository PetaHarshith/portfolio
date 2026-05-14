import { z } from "zod";

const serverSchema = z.object({
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REFRESH_TOKEN: z.string().optional(),
  HENRIK_API_KEY: z.string().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_RIOT_NAME: z.string().optional(),
  NEXT_PUBLIC_RIOT_TAG: z.string().optional(),
  NEXT_PUBLIC_RIOT_REGION: z.string().default("na"),
});

export const serverEnv = serverSchema.parse({
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
  HENRIK_API_KEY: process.env.HENRIK_API_KEY,
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_RIOT_NAME: process.env.NEXT_PUBLIC_RIOT_NAME,
  NEXT_PUBLIC_RIOT_TAG: process.env.NEXT_PUBLIC_RIOT_TAG,
  NEXT_PUBLIC_RIOT_REGION: process.env.NEXT_PUBLIC_RIOT_REGION,
});

export const hasSpotify = Boolean(
  serverEnv.SPOTIFY_CLIENT_ID &&
    serverEnv.SPOTIFY_CLIENT_SECRET &&
    serverEnv.SPOTIFY_REFRESH_TOKEN,
);

export const hasValorant = Boolean(
  publicEnv.NEXT_PUBLIC_RIOT_NAME && publicEnv.NEXT_PUBLIC_RIOT_TAG,
);
