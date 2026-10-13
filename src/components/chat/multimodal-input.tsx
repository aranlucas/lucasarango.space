"use client";

import { useChat } from "@ai-sdk/react";

import { useAsk } from "@/components/chat/ask-provider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { isAnswering, isFull, useActiveChat } from "@/hooks/use-active-chat";
import { CHAT_LIMITS } from "@/lib/constants";

type MultimodalInputProps = { id: string };

type SubmitButtonProps = { input: string };

/** The question box at the bottom of the Ask panel, with Ask or, mid-answer, Stop. Text only. */
export function MultimodalInput({ id }: MultimodalInputProps) {
  const { inputRef } = useAsk();
  const { input, setInput, send } = useActiveChat();

  return (
    <form
      className="border-bs px-4 pbs-3 pbe-4"
      onSubmit={(e) => {
        e.preventDefault();
        send(input);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Your question
      </label>
      {/* An empty question disables only Ask; the editable field stays legible. */}
      <InputGroup className="bg-background has-disabled:bg-background has-disabled:opacity-100 dark:has-disabled:bg-background">
        <InputGroupTextarea
          ref={inputRef}
          id={id}
          rows={1}
          maxLength={CHAT_LIMITS.questionChars}
          placeholder="Ask a question"
          className="max-h-32 min-h-11 px-3 text-base md:text-base"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          autoComplete="off"
        />
        <InputGroupAddon align="inline-end" className="self-end pbe-1.5">
          <SubmitButton input={input} />
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

function SubmitButton({ input }: SubmitButtonProps) {
  const { chat } = useActiveChat();
  const { messages, status, stop } = useChat({ chat });

  if (isAnswering(status)) {
    return (
      <InputGroupButton
        variant="outline"
        size="sm"
        className="min-h-11"
        onClick={() => {
          stop().catch(() => null);
        }}
      >
        Stop
      </InputGroupButton>
    );
  }

  return (
    <InputGroupButton
      type="submit"
      variant="default"
      size="sm"
      className="min-h-11"
      disabled={input.trim() === "" || isFull(messages)}
    >
      Ask
    </InputGroupButton>
  );
}
