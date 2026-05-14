import { NextResponse } from "next/server";
import { fetchValorant } from "@/lib/valorant";
import { hasValorant } from "@/lib/env";

export const revalidate = 300;

const MOCK = {
  account: { name: "rasam ninja", tag: "beta", level: 142 },
  rank: { tier: "Diamond 2", rr: 67, elo: 1867 },
  lastMatch: {
    map: "Ascent",
    mode: "Competitive",
    agent: "Jett",
    kills: 24,
    deaths: 14,
    assists: 7,
    result: "WIN" as const,
    score: "13–9",
  },
  mock: true,
};

export async function GET() {
  if (!hasValorant) {
    return NextResponse.json(MOCK, { status: 200 });
  }
  const snapshot = await fetchValorant();
  if (!snapshot) {
    return NextResponse.json(MOCK, { status: 200 });
  }
  return NextResponse.json(snapshot, { status: 200 });
}
