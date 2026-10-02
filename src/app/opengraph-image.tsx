import { ogImage, OG_SIZE } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}, software engineer in Seattle`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "lucasarango.space",
    title: SITE.name,
    footer: "Software engineer · Seattle, WA",
  });
}
