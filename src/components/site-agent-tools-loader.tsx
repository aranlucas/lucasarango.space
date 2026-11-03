"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const SiteAgentTools = dynamic(
  () => import("./site-agent-tools").then((module) => module.SiteAgentTools),
  { ssr: false },
);

function hasWebMCP() {
  return Boolean(document.modelContext);
}

/** Match use-webmcp-tool's ten-second window for late browser-extension injection. */
function subscribe(onChange: () => void) {
  if (hasWebMCP()) {
    return () => {};
  }

  let attempts = 0;

  const timer = setInterval(() => {
    if (hasWebMCP()) {
      clearInterval(timer);
      onChange();
    } else if (++attempts >= 20) {
      clearInterval(timer);
    }
  }, 500);

  return () => {
    clearInterval(timer);
  };
}

/** Browsers without WebMCP do not need its tools, schemas, or validation code. */
export function SiteAgentToolsLoader() {
  const supported = useSyncExternalStore(subscribe, hasWebMCP, () => false);

  return supported ? <SiteAgentTools /> : null;
}
