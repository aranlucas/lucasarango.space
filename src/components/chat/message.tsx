"use client";

import { cn } from "cn";
import { useEffect, useState } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import { useAsk } from "@/components/chat/ask-provider";
import { PeakGlyph } from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { WAITING_MESSAGE } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

// Rotated while the model reasons, so a long wait still shows progress.
const REASONING_LABELS = ["Thinking it over", "Connecting the dots", "Picking the best examples"];

type MessageProps = {
  message: ChatMessage;
  isLoading: boolean;
  /** Asks again for this answer; only the latest finished answer has it. */
  onRetry?: () => void;
};

type MessagePart = ChatMessage["parts"][number];

const TOOL_LABELS = {
  "tool-listPosts": "Looking through the posts",
  "tool-readPost": "Reading a post",
} as const;

/** Whether a part has anything to show yet. */
function hasContent(part: MessagePart): boolean {
  switch (part.type) {
    case "text":
    case "reasoning":
      return part.text.trim() !== "";
    case "tool-listPosts":
    case "tool-readPost":
      return true;
    // Parts this agent doesn't produce, or that the popup doesn't show.
    case "custom":
    case "dynamic-tool":
    case "file":
    case "reasoning-file":
    case "source-document":
    case "source-url":
    case "step-start":
      break;
  }

  return false;
}

/** Questions read as the headings of an interview transcript; answers follow part by part. */
export function PreviewMessage({ message, isLoading, onRetry }: MessageProps) {
  const { hide } = useAsk();

  // Full screen on phones, so step aside to show the linked page.
  const onNavigate = () => {
    if (!window.matchMedia("(min-width: 40rem)").matches) hide();
  };

  if (message.role === "assistant" && isLoading && !message.parts.some(hasContent)) {
    return (
      <Message className="mbs-2 text-base/relaxed">
        <Thinking labels={[WAITING_MESSAGE]} />
      </Message>
    );
  }

  const parts = message.parts.map((part, index) => (
    <PreviewPart
      // Parts only ever append, so their index is stable.
      // oxlint-disable-next-line react/no-array-index-key
      key={index}
      part={part}
      role={message.role}
      // Only the last part can be between steps.
      isLoading={isLoading && index === message.parts.length - 1}
      onNavigate={onNavigate}
    />
  ));

  if (message.role === "user") {
    return (
      <Message className="text-base">
        <MessageContent className="gap-0">{parts}</MessageContent>
      </Message>
    );
  }

  return (
    <Message className="mbs-2 text-base/relaxed">
      <MessageContent className="gap-2">
        <div>{parts}</div>
        {!isLoading && <AnswerActions answer={answerText(message)} onRetry={onRetry} />}
      </MessageContent>
    </Message>
  );
}

/** Copy, and Retry on the latest answer, once it has finished printing. */
function AnswerActions({ answer, onRetry }: { answer: string; onRetry?: () => void }) {
  if (answer === "") return null;

  return (
    <MessageFooter className="-ms-1.5 gap-1 px-0">
      <CopyAction text={answer} />
      {onRetry !== undefined && (
        <Button variant="ghost" onClick={onRetry} className="answer-action">
          Retry
        </Button>
      )}
    </MessageFooter>
  );
}

/** The answer's Markdown, as the reader would paste it elsewhere. */
function answerText(message: ChatMessage): string {
  return message.parts
    .flatMap((part) => (part.type === "text" ? [part.text.trim()] : []))
    .join("\n\n")
    .trim();
}

const COPIED_MS = 2000;

/** Copies the answer and says so for a moment. */
function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = copied
      ? setTimeout(() => {
          setCopied(false);
        }, COPIED_MS)
      : undefined;

    return () => {
      clearTimeout(id);
    };
  }, [copied]);

  return (
    <Button
      variant="ghost"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
        });
      }}
      className="answer-action"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

type PreviewPartProps = {
  part: MessagePart;
  role: ChatMessage["role"];
  isLoading: boolean;
  onNavigate: () => void;
};

/** One part, narrowed by its type: text streams with a caret, reasoning shows a thinking label. */
function PreviewPart({ part, role, isLoading, onNavigate }: PreviewPartProps) {
  switch (part.type) {
    case "text":
      return role === "user" ? (
        <h3 className="text-lg/snug font-semibold text-pretty text-primary">{part.text}</h3>
      ) : (
        <MessageResponse
          onNavigate={onNavigate}
          className={cn(part.state === "streaming" && "caret")}
        >
          {part.text}
        </MessageResponse>
      );
    case "reasoning":
      return part.state === "streaming" ? <Thinking labels={REASONING_LABELS} /> : null;
    case "tool-listPosts":
    case "tool-readPost":
      return <ToolPart part={part} isLoading={isLoading} />;
    // Parts this agent doesn't produce, or that the popup doesn't show.
    case "custom":
    case "dynamic-tool":
    case "file":
    case "reasoning-file":
    case "source-document":
    case "source-url":
    case "step-start":
      break;
  }

  return null;
}

type ToolPartProps = {
  part: Extract<MessagePart, { type: keyof typeof TOOL_LABELS }>;
  isLoading: boolean;
};

/** A tool call, narrowed by its state: what it's doing while it runs, nothing once it's done. */
function ToolPart({ part, isLoading }: ToolPartProps) {
  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return <Thinking labels={[TOOL_LABELS[part.type]]} />;
    case "output-available":
      // Between steps: the tool is done and the next model call hasn't streamed yet.
      return isLoading ? <Thinking labels={REASONING_LABELS} /> : null;
    case "approval-requested":
    case "approval-responded":
    case "output-denied":
    case "output-error":
      break;
  }

  return null;
}

/** Shown after a question is sent, before the reply exists. */
export function ThinkingMessage() {
  return (
    <Message className="mbs-2 text-base/relaxed">
      <Thinking labels={[WAITING_MESSAGE]} />
    </Message>
  );
}

function Thinking({ labels }: { labels: readonly string[] }) {
  const [tick, setTick] = useState(0);
  const count = labels.length;
  useEffect(() => {
    const id =
      count > 1
        ? setInterval(() => {
            setTick((t) => t + 1);
          }, 2400)
        : undefined;

    return () => {
      clearInterval(id);
    };
  }, [count]);

  const label = labels[tick % labels.length];

  return (
    <div className="flex items-center gap-3 text-muted-foreground" role="status">
      <PeakGlyph printing className="h-4 w-6" />
      <span key={label} className="ask-fade-in">
        {label}
      </span>
    </div>
  );
}
