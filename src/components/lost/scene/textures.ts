import { CanvasTexture, SRGBColorSpace, type Texture } from "three";

import type { CritterKind } from "../game";
import { LAMP, SILHOUETTE } from "./palette";

// Everything is painted onto 2D canvases: no model or font files to download.
// Silhouettes face the viewer (that's why you can see their eyes) and are
// drawn 256px wide, eyes centred at x = 128.

interface Silhouette {
  /** Canvas height in px (width is always 256). */
  height: number;
  /** World width of the sprite; its height follows the canvas aspect. */
  width: number;
  /** Eye line in canvas px from the top. */
  eyeY: number;
  /** Distance between the eyes in canvas px. */
  eyeGap: number;
  /** Eye glint radius in world units. */
  eyeRadius: number;
  eyeColor: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export const SILHOUETTES: Record<CritterKind, Silhouette> = {
  deer: {
    height: 256,
    width: 1.5,
    eyeY: 76,
    eyeGap: 20,
    eyeRadius: 0.03,
    eyeColor: "#d8ffe8",
    draw(ctx) {
      for (const x of [100, 114, 136, 150]) ctx.fillRect(x, 186, 7, 70);
      ellipse(ctx, 128, 168, 44, 30);
      ctx.beginPath();
      ctx.moveTo(112, 158);
      ctx.lineTo(144, 158);
      ctx.lineTo(138, 92);
      ctx.lineTo(118, 92);
      ctx.fill();
      ellipse(ctx, 128, 84, 15, 26);
      ellipse(ctx, 100, 66, 17, 7, 0.35);
      ellipse(ctx, 156, 66, 17, 7, -0.35);
      ctx.lineWidth = 5;
      ctx.lineCap = "round";

      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(128 + side * 8, 62);
        ctx.lineTo(128 + side * 26, 20);
        ctx.moveTo(128 + side * 17, 42);
        ctx.lineTo(128 + side * 38, 36);
        ctx.moveTo(128 + side * 22, 30);
        ctx.lineTo(128 + side * 16, 8);
        ctx.stroke();
      }
    },
  },
  owl: {
    height: 256,
    width: 0.75,
    eyeY: 108,
    eyeGap: 46,
    eyeRadius: 0.028,
    eyeColor: "#ffb347",
    draw(ctx) {
      ctx.fillRect(0, 226, 256, 14);
      ellipse(ctx, 128, 150, 62, 84);
      ctx.beginPath();
      ctx.moveTo(72, 110);
      ctx.lineTo(82, 44);
      ctx.lineTo(112, 84);
      ctx.moveTo(184, 110);
      ctx.lineTo(174, 44);
      ctx.lineTo(144, 84);
      ctx.fill();
    },
  },
  marmot: {
    height: 256,
    width: 0.6,
    eyeY: 82,
    eyeGap: 30,
    eyeRadius: 0.018,
    eyeColor: "#ffe066",
    draw(ctx) {
      ellipse(ctx, 128, 176, 56, 72);
      ellipse(ctx, 128, 90, 40, 34);
      ellipse(ctx, 96, 60, 10, 9);
      ellipse(ctx, 160, 60, 10, 9);
      ellipse(ctx, 96, 150, 12, 26, 0.4);
      ellipse(ctx, 160, 150, 12, 26, -0.4);
    },
  },
  sasquatch: {
    height: 416,
    width: 1.6,
    eyeY: 66,
    eyeGap: 24,
    eyeRadius: 0.03,
    eyeColor: "#ff4a3d",
    draw(ctx) {
      ctx.beginPath();
      ctx.moveTo(128, 22);
      ctx.quadraticCurveTo(164, 32, 160, 76);
      ctx.lineTo(96, 76);
      ctx.quadraticCurveTo(92, 32, 128, 22);
      ctx.fill();
      ellipse(ctx, 128, 82, 32, 26);
      ctx.beginPath();
      ctx.roundRect(64, 100, 128, 190, 44);
      ctx.fill();
      ellipse(ctx, 50, 200, 20, 96, 0.08);
      ellipse(ctx, 206, 200, 20, 96, -0.08);
      ctx.beginPath();
      ctx.roundRect(82, 270, 38, 146, 14);
      ctx.roundRect(136, 270, 38, 146, 14);
      ctx.fill();
    },
  },
};

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation = 0,
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
}

function paint(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) draw(ctx);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;

  return texture;
}

/** The page's serif, so the sign and labels match the site. */
function serif() {
  return getComputedStyle(document.body).fontFamily || "Georgia, serif";
}

export interface Textures {
  silhouettes: Record<CritterKind, Texture>;
  /** "+1", "+2", "+5" labels, keyed by points. */
  points: Map<number, Texture>;
  /** Soft round glow for the beam scattering in the fog. */
  glow: Texture;
  home: Texture;
  writing: Texture;
}

function paintGlow() {
  return paint(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255, 226, 176, 1)");
    g.addColorStop(0.4, "rgba(255, 226, 176, 0.35)");
    g.addColorStop(1, "rgba(255, 226, 176, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}

const silhouette = (kind: CritterKind) =>
  paint(256, SILHOUETTES[kind].height, (ctx) => {
    ctx.fillStyle = SILHOUETTE;
    ctx.strokeStyle = SILHOUETTE;
    SILHOUETTES[kind].draw(ctx);
  });

export function createTextures(): Textures {
  const font = serif();

  const silhouettes = {
    deer: silhouette("deer"),
    owl: silhouette("owl"),
    marmot: silhouette("marmot"),
    sasquatch: silhouette("sasquatch"),
  };

  const points = new Map<number, Texture>();

  for (const value of [1, 2, 5]) {
    points.set(
      value,
      paint(128, 64, (ctx) => {
        ctx.font = `600 44px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = LAMP;
        ctx.fillText(`+${value}`, 64, 34);
      }),
    );
  }

  const glow = paintGlow();

  const sign = (label: string) =>
    paint(512, 128, (ctx) => {
      ctx.font = `600 64px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f6ecd9";
      ctx.fillText(label, 256, 70);
    });

  return { silhouettes, points, glow, home: sign("◀ HOME"), writing: sign("WRITING ▶") };
}

export function disposeTextures(textures: Textures) {
  for (const t of Object.values(textures.silhouettes)) t.dispose();

  for (const t of textures.points.values()) t.dispose();
  textures.glow.dispose();
  textures.home.dispose();
  textures.writing.dispose();
}
