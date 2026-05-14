import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "media.valorant-api.com" },
      { protocol: "https", hostname: "media.henrikdev.xyz" },
    ],
  },
};

export default nextConfig;
