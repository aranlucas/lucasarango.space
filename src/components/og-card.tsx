import { FIR_PATHS, FOREGROUND_PATH, PEAK_PATH, SNOW_PATH } from "@/lib/receipt-geometry";

// Light receipt palette from globals.css; the image renderer has no CSS variables.
const INK = "#111111";

const PAPER = "#f7f7f3";

const MUTED = "#5a5a56";

// The site's dithered peak (components/receipt-art.tsx) as a standalone image,
// since the card renderer only draws patterns inside an <img>.
const PEAK = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="640" height="240" shape-rendering="crispEdges">
<defs>
<pattern id="a" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${INK}"/><rect x="2" y="2" width="1" height="1" fill="${INK}"/></pattern>
<pattern id="b" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${INK}"/><rect x="1" y="1" width="1" height="1" fill="${INK}"/></pattern>
<pattern id="c" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${INK}"/><rect x="1" y="1" width="1" height="1" fill="${PAPER}"/></pattern>
</defs>
<path d="${PEAK_PATH}" fill="url(#a)" stroke="${INK}" stroke-width="1.5" shape-rendering="geometricPrecision"/>
<path d="${SNOW_PATH}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" shape-rendering="geometricPrecision"/>
<path d="${FOREGROUND_PATH}" fill="url(#b)"/>
<g fill="url(#c)">${FIR_PATHS.map((path) => `<path d="${path}"/>`).join("")}</g>
<rect y="118" width="320" height="2" fill="${INK}"/>
</svg>`,
).toString("base64")}`;

export type CardText = { eyebrow: string; title: string; footer: string };

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

export function Card({ eyebrow, title, footer }: CardText) {
  return (
    <div style={PAGE}>
      {/* oxlint-disable-next-line nextjs/no-img-element -- the card renderer only accepts <img> */}
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
