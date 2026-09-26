"use client";

import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { cn } from "cn";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAsk } from "@/components/ask/ask-context";
import { MessageResponse } from "@/components/ask/message-response";
import { RidgeGlyph } from "@/components/ask/ridge-glyph";
import { STARTERS } from "@/lib/ask-config";
import { knownLinks } from "@/lib/ask-links";

// Free models often take several seconds to start, so a long silence gets
// its own message, as in the AI SDK chatbot template's waiting status.
const STILL_WAITING_AFTER_MS = 9000;
const WAITING_LABEL = "Reading the résumé";
const STILL_WAITING_LABEL = "Still waiting. Free models can be slow.";
// Rotated while the model reasons, so a long wait still shows progress.
const REASONING_LABELS = ["Thinking it over", "Connecting the dots", "Picking the best examples"];

/** Suggested questions, shown before the first message. */
export function Starters() {
  const { send } = useAsk();
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto px-5 pt-6 pb-2">
      <p className="text-base/relaxed text-muted-foreground">
        This is an agent that has read my résumé and everything I’ve written here. Ask it what you’d
        ask me in a first call.
      </p>
      <ul className="mt-4 border-t">
        {STARTERS.map((question) => (
          <li key={question} className="border-b">
            <Button
              variant="ghost"
              onClick={() => {
                send(question);
              }}
              className="-mx-2 h-auto w-full justify-start px-2 py-3 text-start text-base/snug font-semibold text-pretty whitespace-normal hover:bg-transparent hover:text-primary"
            >
              {question}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Transcript() {
  const { chat, isFull } = useAsk();
  const { messages, status, error } = chat;
  const links = useMemo(() => knownLinks(messages), [messages]);
  return (
    <div className="flex flex-col pt-4 pb-6">
      {messages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          isFirst={index === 0}
          isStreaming={status === "streaming" && index === messages.length - 1}
          links={links}
        />
      ))}
      {isWaiting(status, messages.at(-1)) && (
        <div className="mt-2">
          <Waiting />
        </div>
      )}
      {error !== undefined && (
        <p className="mt-4 text-base text-destructive" role="alert">
          {error.message === "" ? "The answer didn’t come through." : error.message}{" "}
          <Button
            variant="link"
            onClick={() => {
              void chat.regenerate();
            }}
            className="h-auto p-0 text-base font-semibold text-destructive underline"
          >
            Try again
          </Button>
        </p>
      )}
      {isFull && (
        <p className="mt-6 text-sm text-muted-foreground" role="status">
          This conversation is full. Start a new conversation to keep asking.
        </p>
      )}
    </div>
  );
}

type MessageProps = {
  message: UIMessage;
  isFirst: boolean;
  isStreaming: boolean;
  links: ReadonlyMap<string, string>;
};

function Message({ message, isFirst, isStreaming, links }: MessageProps) {
  // Questions read as the headings of an interview transcript.
  if (message.role === "user") {
    const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
    return (
      <h3
        className={cn(
          "text-lg/snug font-semibold text-pretty text-primary",
          !isFirst && "mt-6 border-t pt-6",
        )}
      >
        {text}
      </h3>
    );
  }
  // Until the model does anything, the transcript's waiting indicator stands in.
  if (!hasActivity(message)) return null;
  return (
    <div className="mt-2 text-base/relaxed">
      <AnswerParts message={message} isStreaming={isStreaming} links={links} />
    </div>
  );
}

/** Whether the model has started: reasoning, a tool call, or text. */
function hasActivity(message: UIMessage) {
  return message.parts.some(
    (part) =>
      isToolUIPart(part) ||
      ((part.type === "text" || part.type === "reasoning") && part.text.trim() !== ""),
  );
}

/** From sending a question until the model's first output. */
function isWaiting(status: string, last: UIMessage | undefined) {
  if (status === "submitted") return true;
  return status === "streaming" && last?.role === "assistant" && !hasActivity(last);
}

/**
 * One indicator for the whole wait, so its timer keeps running while the
 * request is sent and the empty reply arrives.
 */
function Waiting() {
  const [stillWaiting, setStillWaiting] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => {
      setStillWaiting(true);
    }, STILL_WAITING_AFTER_MS);
    return () => {
      clearTimeout(id);
    };
  }, []);
  return <Thinking labels={[stillWaiting ? STILL_WAITING_LABEL : WAITING_LABEL]} />;
}

/** What the agent is doing with a tool, in the reader's terms. */
function toolLabel(part: UIMessage["parts"][number], links: ReadonlyMap<string, string>) {
  if (!isToolUIPart(part) || getToolName(part) !== "readPost") return "Looking through the posts";
  const url =
    typeof part.input === "object" && part.input !== null && "url" in part.input
      ? part.input.url
      : undefined;
  const title = typeof url === "string" ? links.get(url) : undefined;
  return title === undefined ? "Reading a post" : `Reading “${title}”`;
}

function AnswerParts({ message, isStreaming, links }: Omit<MessageProps, "isFirst">) {
  const { hide } = useAsk();
  // Full screen on phones, so step aside to show the linked page.
  const onNavigate = () => {
    if (!window.matchMedia("(min-width: 40rem)").matches) hide();
  };
  const last = message.parts.at(-1);
  const betweenSteps =
    isStreaming && last !== undefined && isToolUIPart(last) && last.state === "output-available";
  const parts = message.parts.map((part, index) => {
    const key = `${message.id}-${index}`;
    // Tool calls and reasoning aren't shown, only what's happening right now.
    if (isToolUIPart(part)) {
      return isStreaming &&
        (part.state === "input-streaming" || part.state === "input-available") ? (
        <Thinking key={key} labels={[toolLabel(part, links)]} />
      ) : null;
    }
    if (part.type === "reasoning") {
      return isStreaming && part.state === "streaming" ? (
        <Thinking key={key} labels={REASONING_LABELS} />
      ) : null;
    }
    if (part.type !== "text") return null;
    return (
      <MessageResponse
        key={key}
        links={links}
        onNavigate={onNavigate}
        className={cn(isStreaming && index === message.parts.length - 1 && "caret")}
      >
        {part.text}
      </MessageResponse>
    );
  });
  return (
    <>
      {parts}
      {betweenSteps && <Thinking labels={REASONING_LABELS} />}
    </>
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
      <RidgeGlyph drawing className="h-4 w-10 text-primary" />
      <span key={label} className="animate-in fade-in">
        {label}
      </span>
    </div>
  );
}
