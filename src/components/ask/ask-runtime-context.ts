"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { createContext, use } from "react";

import type { AskMessage, WaitingStatus } from "@/lib/ask-types";

export type AskRuntimeState = {
  chat: UseChatHelpers<AskMessage>;
  waitingStatus: WaitingStatus | undefined;
  isLoading: boolean;
  isFull: boolean;
  send: (text: string) => boolean;
};

export const AskRuntimeContext = createContext<AskRuntimeState | null>(null);

export function useAskRuntime(): AskRuntimeState {
  const value = use(AskRuntimeContext);

  if (value === null) throw new Error("useAskRuntime must be used inside <AskRuntime>");

  return value;
}
