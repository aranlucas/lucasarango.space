import { getImageProps } from "next/image";
import { defaultHandlers } from "remark-rehype";

// The screenshots embedded in this site's posts, at their original dimensions.
const SCREENSHOTS = new Map([
  ["/case-studies/system-design-entry.webp", { width: 1280, height: 720 }],
  ["/case-studies/roomform-studio.webp", { width: 1280, height: 1000 }],
]);

/** Keep Markdown's image semantics while sizing and deferring our local screenshots. */
export const markdownImage: typeof defaultHandlers.image = (state, node) => {
  const element = defaultHandlers.image(state, node);
  const dimensions = SCREENSHOTS.get(node.url);

  if (dimensions === undefined) {
    return element;
  }

  const { props } = getImageProps({
    src: node.url,
    // Preserve the public URL and the existing screenshot styles keyed on it.
    overrideSrc: node.url,
    alt: node.alt ?? "",
    ...dimensions,
    sizes: "(min-width: 36rem) 34rem, calc(100vw - 2rem)",
    loading: "lazy",
    decoding: "async",
  });

  // HAST properties accept HTML values, not React's style object.
  const { src, srcSet, sizes, width, height, loading, decoding } = props;
  Object.assign(element.properties, { src, srcSet, sizes, width, height, loading, decoding });

  return element;
};
