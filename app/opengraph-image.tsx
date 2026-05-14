import { ImageResponse } from "next/og";

export const alt =
  "Harshith Reddy Peta · Engineer · Builder · CS @ UW–Madison · Graduating May 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0a0f1c";
const RED = "#ff4655";
const MINT = "#14f195";
const INK = "#eaf4ff";
const DIM = "#7e8fb0";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          color: INK,
          background: BG,
          backgroundImage:
            "radial-gradient(ellipse 60% 80% at 80% 18%, rgba(255,70,85,0.22), transparent 60%), radial-gradient(ellipse 60% 70% at 18% 82%, rgba(20,241,149,0.12), transparent 60%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* HUD corners */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            width: 22,
            height: 22,
            borderTop: `3px solid ${RED}`,
            borderLeft: `3px solid ${RED}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 30,
            width: 22,
            height: 22,
            borderTop: `3px solid ${RED}`,
            borderRight: `3px solid ${RED}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            width: 22,
            height: 22,
            borderBottom: `3px solid ${MINT}`,
            borderLeft: `3px solid ${MINT}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            width: 22,
            height: 22,
            borderBottom: `3px solid ${MINT}`,
            borderRight: `3px solid ${MINT}`,
            display: "flex",
          }}
        />

        {/* Top status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "monospace",
            fontSize: 24,
            letterSpacing: "0.3em",
            color: MINT,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              background: MINT,
              borderRadius: 999,
              display: "flex",
            }}
          />
          <div style={{ display: "flex" }}>PLAYER_01 · ONLINE</div>
        </div>

        {/* Name + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 0.92,
              color: INK,
              display: "flex",
            }}
          >
            HARSHITH
          </div>
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 0.92,
              color: RED,
              display: "flex",
            }}
          >
            REDDY PETA
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 26,
              color: DIM,
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              display: "flex",
            }}
          >
            ENGINEER · BUILDER · CS @ UW–MADISON · GRAD MAY 2026
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: 22,
            letterSpacing: "0.22em",
          }}
        >
          <div style={{ display: "flex", color: MINT }}>▰ harshithpeta.com</div>
          <div style={{ display: "flex", color: DIM }}>↳ AVAILABLE FOR HIRE</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
