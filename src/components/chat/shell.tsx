"use client";

import { useEffect } from "react";

import { useAsk } from "@/components/chat/ask-provider";
import { ChatHeader } from "@/components/chat/chat-header";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { Messages } from "@/components/chat/messages";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { ActiveChatProvider, useActiveChat } from "@/hooks/use-active-chat";

type ShellProps = { titleId: string; inputId: string };

/** The Ask panel's contents, loaded when a reader first shows intent to ask. */
export function ChatShell(props: ShellProps) {
  return (
    <DataStreamProvider>
      <ActiveChatProvider>
        <Shell {...props} />
      </ActiveChatProvider>
    </DataStreamProvider>
  );
}

function Shell({ titleId, inputId }: ShellProps) {
  const { open, inputRef, setLoading } = useAsk();
  const { isLoading } = useActiveChat();

  // The launcher, outside the panel, shows when an answer is on its way.
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, inputRef]);

  return (
    <>
      <ChatHeader titleId={titleId} />
      <Messages />
      <MultimodalInput id={inputId} />
    </>
  );
}
