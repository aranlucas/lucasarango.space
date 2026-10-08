"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { useAsk } from "@/components/ask/ask-context";
import { PeakGlyph } from "@/components/ask/peak-glyph";

const AskRuntime = dynamic(
  () => import("@/components/ask/ask-runtime").then((module) => module.AskRuntime),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-end px-5 py-6 text-muted-foreground" role="status">
        Opening conversation…
      </div>
    ),
  },
);

/** A floating bar anchors the persistent conversation independently of navigation. */
export function AskPopup() {
  const { open, activated } = useAsk();
  const panelId = useId();
  const titleId = useId();

  return (
    <div className="print:hidden">
      {/* The panel and launcher share a view-transition name while changing visibility. */}
      <section
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        hidden={!open}
        style={open ? { viewTransitionName: "ask-surface" } : undefined}
        className="ask-panel flex flex-col bg-card text-card-foreground"
      >
        {activated && <AskRuntime titleId={titleId} inputId={`${panelId}-question`} />}
      </section>
      <Launcher panelId={panelId} />
    </div>
  );
}

function Launcher({ panelId }: { panelId: string }) {
  const { open, isLoading, launcherRef, show, close, preload } = useAsk();

  return (
    <Button
      ref={launcherRef}
      aria-expanded={open}
      aria-controls={panelId}
      aria-haspopup="dialog"
      aria-label={open ? "Hide conversation" : "Ask about my work"}
      onClick={open ? close : show}
      onPointerEnter={preload}
      onFocus={preload}
      style={{ viewTransitionName: open ? "ask-launcher" : "ask-surface" }}
      variant="ghost"
      className="ask-launcher"
    >
      <PeakGlyph printing={isLoading} className="h-2.5 w-3.75" />
      <span>{open ? "Hide conversation" : isLoading ? "Answering…" : "Ask about my work"}</span>
      {open ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
    </Button>
  );
}
