"use client";

import { useImperativeHandle, useState, type Ref } from "react";

import { useAsk } from "@/components/ask/ask-context";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useAskRuntime } from "@/components/ask/ask-runtime-context";
import { ASK_LIMITS } from "@/lib/ask-config";

/** The question box at the bottom of the Ask panel, with Ask or, mid-answer, Stop. */
export type ComposerDraft = { setInput: (input: string) => void };

export function Composer({ id, ref }: { id: string; ref: Ref<ComposerDraft> }) {
  const [input, setInput] = useState("");
  const { inputRef } = useAsk();
  const { send } = useAskRuntime();
  useImperativeHandle(ref, () => ({ setInput }), []);

  return (
    <form
      className="border-t px-4 pt-3 pb-4"
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
          maxLength={ASK_LIMITS.questionChars}
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
        <InputGroupAddon align="inline-end" className="self-end pb-1.5">
          <ComposerAction input={input} />
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

function ComposerAction({ input }: { input: string }) {
  const { chat, isLoading, isFull } = useAskRuntime();

  if (isLoading) {
    return (
      <InputGroupButton
        variant="outline"
        size="sm"
        className="min-h-11"
        onClick={() => {
          void chat.stop();
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
      disabled={input.trim() === "" || isFull}
    >
      Ask
    </InputGroupButton>
  );
}
