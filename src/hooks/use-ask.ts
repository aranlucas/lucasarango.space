"use client";

import { createContext, use } from "react";

export type PendingQuestion = { id: number; text: string };

/** Whether Ask is open, and questions waiting for the chat to mount. Kept across navigation. */
export type AskState = {
  open: boolean;
  activated: boolean;
  /** False until the deferred chat reports its status. */
  isLoading: boolean;
  questions: PendingQuestion[];
  launcherRef: React.RefObject<HTMLButtonElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Opens Ask and queues a question until the chat mounts. */
  ask: (question: string) => void;
  show: () => void;
  close: () => void;
  /** Collapses without moving focus as a linked page loads. */
  hide: () => void;
  preload: () => void;
  consume: (id: number) => void;
  setLoading: (loading: boolean) => void;
};

export const AskContext = createContext<AskState | null>(null);

export function useAsk(): AskState {
  const value = use(AskContext);

  if (value === null) {
    throw new Error("useAsk must be used inside <AskProvider>");
  }

  return value;
}
