import { readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

import { Card, type CardText } from "@/components/og-card";

export const OG_SIZE = { width: 1200, height: 630 };

async function font(file: string) {
  "use cache";
  cacheLife("max");

  const data = await readFile(path.join(process.cwd(), "assets", "fonts", file));

  return Uint8Array.from(data).buffer;
}

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
