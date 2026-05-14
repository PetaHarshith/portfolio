import type { NextRequest } from "next/server";

// Vercel sets `x-real-ip` to the true client address after stripping any
// client-supplied value, so it can't be spoofed the way `x-forwarded-for[0]`
// can. Fall back to the last XFF entry (closest to the edge) for non-Vercel
// hosts, and finally to a literal so the rate-limit key isn't empty.
export function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}
