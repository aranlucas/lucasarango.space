import { readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Light receipt palette from globals.css; the image renderer has no CSS variables.
const INK = "#111111";

const PAPER = "#f7f7f3";

const MUTED = "#5a5a56";

async function font(file: string) {
  "use cache";
  cacheLife("max");

  const data = await readFile(path.join(process.cwd(), "assets", "fonts", file));

  return Uint8Array.from(data).buffer;
}

// The site's dithered peak (components/receipt-art.tsx) as a standalone image,
// since the card renderer only draws patterns inside an <img>.
const PEAK = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="640" height="240" shape-rendering="crispEdges">
<defs>
<pattern id="a" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${INK}"/><rect x="2" y="2" width="1" height="1" fill="${INK}"/></pattern>
<pattern id="b" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${INK}"/><rect x="1" y="1" width="1" height="1" fill="${INK}"/></pattern>
<pattern id="c" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${INK}"/><rect x="1" y="1" width="1" height="1" fill="${PAPER}"/></pattern>
</defs>
<path d="M0 120V96L40 78 70 86 104 60 128 70 160 18 184 44 198 40 232 72 262 62 296 80 320 74V120Z" fill="url(#a)" stroke="${INK}" stroke-width="1.5" shape-rendering="geometricPrecision"/>
<path d="M160 18 184 44 176 46 170 40 162 50 154 42 146 48 140 44Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" shape-rendering="geometricPrecision"/>
<path d="M0 120V104L60 92 120 100 200 84 260 96 320 90V120Z" fill="url(#b)"/>
<g fill="url(#c)"><path d="M14 120 22 98 30 120Z"/><path d="M34 120 44 88 54 120Z"/><path d="M58 120 64 102 70 120Z"/><path d="M240 120 250 90 260 120Z"/><path d="M262 120 270 98 278 120Z"/><path d="M282 120 294 84 306 120Z"/><path d="M304 120 310 104 316 120Z"/></g>
<rect y="118" width="320" height="2" fill="${INK}"/>
</svg>`,
).toString("base64")}`;

/** A share card printed like the site: the peak, a bitmap title, and a receipt meta line. */
export async function ogImage(card: CardText) {
  const [pixel, mono] = await Promise.all([
    font("PixelifySans-700.ttf"),
    font("MartianMono-400.ttf"),
  ]);

  return new ImageResponse(<Card {...card} />, {
    ...OG_SIZE,
    fonts: [
      { name: "Pixelify Sans", data: pixel, weight: 700, style: "normal" },
      { name: "Martian Mono", data: mono, weight: 400, style: "normal" },
    ],
  });
}

type CardText = { eyebrow: string; title: string; footer: string };

const META = {
  display: "flex",
  fontSize: 22,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
} as const;

const PAGE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "100%",
  padding: "56px 120px",
  background: PAPER,
  color: INK,
  fontFamily: "Martian Mono",
  textAlign: "center",
} as const;

const RULE = {
  ...META,
  marginTop: "auto",
  width: "100%",
  justifyContent: "center",
  paddingTop: 20,
  borderTop: `3px dashed ${INK}`,
} as const;

function Card({ eyebrow, title, footer }: CardText) {
  return (
    <div style={PAGE}>
      <img src={PEAK} width={480} height={180} alt="" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          maxWidth: 960,
          marginTop: 28,
          fontFamily: "Pixelify Sans",
          fontSize: title.length > 48 ? 58 : 76,
          lineHeight: 1.05,
        }}
      >
        {title}
      </div>
      <div style={{ ...META, marginTop: 24, color: MUTED }}>{footer}</div>
      <div style={RULE}>{eyebrow}</div>
    </div>
  );
}
