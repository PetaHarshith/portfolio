import type { Metadata, Viewport } from "next";
import { Space_Grotesk, VT323, Bebas_Neue } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";
import { GrainOverlay } from "@/components/hero/GrainOverlay";
import { Cursor } from "@/components/ui/Cursor";
import { Nav } from "@/components/ui/Nav";
import { Terminal } from "@/components/terminal/Terminal";
import { BootScreen } from "@/components/boot/BootScreen";
import { KonamiListener } from "@/components/ui/KonamiListener";
import { ProjectSheet } from "@/components/work/ProjectSheet";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harshith Reddy Peta · PLAYER_01",
  description:
    "Engineer, researcher, and builder. CS @ UW–Madison. Shipping side quests since 2022.",
  metadataBase: new URL("https://www.harshithpeta.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Harshith Reddy Peta · PLAYER_01",
    description:
      "Engineer, researcher, and builder. CS @ UW–Madison. Shipping side quests since 2022.",
    url: "https://www.harshithpeta.com",
    siteName: "PLAYER_01",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harshith Reddy Peta · PLAYER_01",
    description:
      "Engineer, researcher, and builder. CS @ UW–Madison. Shipping side quests since 2022.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${vt323.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <BootScreen />
          <Cursor />
          <Nav />
          {children}
          <Terminal />
          <ProjectSheet />
          <KonamiListener />
          <GrainOverlay />
          <div className="scanlines" aria-hidden />
          <div className="vignette" aria-hidden />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
