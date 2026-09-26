"use client";

import { useAsk } from "@/components/ask/ask-context";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ASK_LIMITS } from "@/lib/ask-config";

/** The question box at the bottom of the Ask panel, with Ask or, mid-answer, Stop. */
export function Composer({ id }: { id: string }) {
  const { input, setInput, inputRef, send } = useAsk();
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
      <InputGroup className="bg-background">
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
          <ComposerAction />
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        A free AI model writes these answers, and it can be wrong.
      </p>
    </form>
  );
}

function ComposerAction() {
  const { chat, input, isLoading, isFull } = useAsk();
  if (isLoading) {
    return (
      <InputGroupButton
        variant="outline"
        size="sm"
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
      disabled={input.trim() === "" || isFull}
    >
      Ask
    </InputGroupButton>
  );
}
