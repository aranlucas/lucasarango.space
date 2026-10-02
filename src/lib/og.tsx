import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Share images use the same condensed typography and route geometry as the portfolio. */
export async function ogImage({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}) {
  const font = await readFile(
    path.join(process.cwd(), "assets", "fonts", "BarlowCondensed-600.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "65px 80px",
        background: "#273bc4",
        color: "#ffffff",
        fontFamily: "Barlow Condensed",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: title.length > 48 ? 70 : 100,
          fontWeight: 600,
          lineHeight: 1.04,
          textTransform: "uppercase",
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      <div
        style={{ display: "flex", marginTop: 28, fontSize: 30, maxWidth: 850, color: "#e6f28b" }}
      >
        {footer}
      </div>
      <div style={{ display: "flex", marginTop: "auto", fontSize: 25, color: "#d2d9ff" }}>
        {eyebrow}
      </div>
      <RouteGraphic />
    </div>,
    { ...OG_SIZE, fonts: [{ name: "Barlow Condensed", data: font, weight: 600, style: "normal" }] },
  );
}

function RouteGraphic() {
  return (
    <svg
      width="350"
      height="140"
      viewBox="0 0 350 140"
      style={{ position: "absolute", right: 40, bottom: 20 }}
    >
      <path
        d="M15 20H150Q175 20 175 45V95Q175 120 200 120H335"
        fill="none"
        stroke="#e6f28b"
        strokeWidth="5"
      />
      <circle cx="15" cy="20" r="9" fill="#e6f28b" />
      <circle cx="175" cy="70" r="9" fill="#e6f28b" />
      <circle cx="335" cy="120" r="9" fill="#e6f28b" />
    </svg>
  );
}
