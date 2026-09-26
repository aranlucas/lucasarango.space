import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { CONTOURS } from "@/components/ridgeline";

export const OG_SIZE = { width: 1200, height: 630 };

// Light Cascades palette from globals.css; the image renderer has no CSS variables.
const INK = "#17242c";
const PAPER = "#e8edee";
const FIR = "#2c6654";
const RIDGE = "#7f9aa3";
const MUTED = "#56666e";

const font = (weight: 400 | 600) =>
  readFile(path.join(process.cwd(), "assets", "fonts", `Literata-${weight}.woff`));

/** A share card: small eyebrow, big serif title, a meta line, and the ridge along the bottom. */
export async function ogImage({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}) {
  const [regular, semibold] = await Promise.all([font(400), font(600)]);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "72px 80px",
        background: PAPER,
        color: INK,
        fontFamily: "Literata",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: FIR }}>{eyebrow}</div>
      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontSize: title.length > 48 ? 64 : 80,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", marginTop: 32, fontSize: 28, color: MUTED }}>{footer}</div>
      <Ridge />
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Literata", data: regular, weight: 400, style: "normal" },
        { name: "Literata", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}

function Ridge() {
  return (
    <svg
      width="1200"
      height="200"
      viewBox="0 20 600 132"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, bottom: -40 }}
    >
      {CONTOURS.map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={i === 0 ? FIR : RIDGE}
          strokeWidth={i === 0 ? 1.4 : 1}
          strokeOpacity={i === 0 ? 1 : 0.6}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
