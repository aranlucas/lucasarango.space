"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { createContext, use } from "react";

export type AskState = {
  chat: UseChatHelpers<UIMessage>;
  open: boolean;
  isLoading: boolean;
  isFull: boolean;
  input: string;
  setInput: (input: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  launcherRef: React.RefObject<HTMLButtonElement | null>;
  /** Sends a question now; false when it can't be sent yet. */
  send: (text: string) => boolean;
  /** Opens the popup and asks, or leaves the question in the box mid-answer. */
  ask: (question: string) => void;
  show: () => void;
  close: () => void;
  /** Collapses to the launcher without moving focus, as a linked page loads. */
  hide: () => void;
};

export const AskContext = createContext<AskState | null>(null);

export function useAsk(): AskState {
  const value = use(AskContext);
  if (value === null) throw new Error("useAsk must be used inside <AskProvider>");
  return value;
}
