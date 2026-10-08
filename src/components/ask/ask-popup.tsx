"use client";

import { cn } from "cn";
import { X } from "lucide-react";
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

/** A lightweight launcher; reader intent mounts the persistent chat panel. */
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
        className="fixed inset-0 z-40 flex flex-col bg-card text-card-foreground sm:inset-auto sm:inset-e-5 sm:bottom-5 sm:h-popup sm:w-popup sm:border-2 sm:border-foreground"
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
      aria-label={open ? "Close" : "Ask about my work"}
      title={open ? "Close" : "Ask about my work"}
      onClick={open ? close : show}
      onPointerEnter={preload}
      onFocus={preload}
      style={{ viewTransitionName: open ? "ask-launcher" : "ask-surface" }}
      variant="ghost"
      className={cn("ask-launcher relative z-40", open && "max-sm:hidden")}
    >
      {open ? (
        <X aria-hidden="true" className="size-5" />
      ) : (
        <>
          <PeakGlyph printing={isLoading} className="h-2.5 w-3.75" />
          Ask
        </>
      )}
    </Button>
  );
}
