// What an answer is doing while it's on its way, read from its newest parts.
// Pure, so the popup can show one steady status row for the whole wait.

import { WAITING_MESSAGE } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

type MessagePart = ChatMessage["parts"][number];

/** Between steps: a tool has answered and the model hasn't said anything new yet. */
export const BETWEEN_STEPS = "Thinking it over";

/**
 * A few words on what the answer is doing now, or null once it's printing
 * text (the caret says that). A running tool says what it's reading;
 * reasoning says its latest thought.
 */
export function answerActivity(messages: ChatMessage[]): string | null {
  const answer = messages.at(-1);

  if (answer?.role !== "assistant") {
    return WAITING_MESSAGE;
  }

  // Newest first: step starts and empty text say nothing new, so look past them.
  for (let index = answer.parts.length - 1; index >= 0; index -= 1) {
    const part = answer.parts[index];

    if (part === undefined) {
      continue;
    }

    const activity = partActivity(part, messages);

    if (activity !== undefined) {
      return activity;
    }
  }

  return WAITING_MESSAGE;
}

/** One part's activity: a label, null for printing text, or undefined to keep looking. */
function partActivity(part: MessagePart, messages: ChatMessage[]): string | null | undefined {
  switch (part.type) {
    case "text":
      return part.text.trim() === "" ? undefined : null;
    case "reasoning":
      // Finished reasoning keeps its last thought until the next part says something new.
      return latestThought(part.state === "done" ? `${part.text}\n` : part.text) ?? BETWEEN_STEPS;
    case "tool-listPosts":
    case "tool-readPost":
      return part.state === "input-streaming" || part.state === "input-available"
        ? runningToolLabel(part, messages)
        : BETWEEN_STEPS;
    // Parts this agent doesn't produce, or that say nothing about progress.
    case "custom":
    case "dynamic-tool":
    case "file":
    case "reasoning-file":
    case "source-document":
    case "source-url":
    case "step-start":
      break;
  }

  return undefined;
}

type ToolPart = Extract<MessagePart, { type: "tool-listPosts" | "tool-readPost" }>;

function runningToolLabel(part: ToolPart, messages: ChatMessage[]): string {
  if (part.type === "tool-listPosts") {
    return "Looking through the posts";
  }

  const title = part.input?.url === undefined ? undefined : listedTitle(part.input.url, messages);

  return title === undefined ? "Reading a post" : `Reading “${title}”`;
}

/** A finished tool, in the past tense, or null when it has nothing to say. */
export function finishedToolLabel(part: ToolPart): string | null {
  if (part.state !== "output-available") {
    return null;
  }

  if (part.type === "tool-listPosts") {
    return `Looked through ${part.output.length} ${part.output.length === 1 ? "post" : "posts"}`;
  }

  const title = "title" in part.output ? part.output.title : undefined;

  return title === undefined ? null : `Read “${title}”`;
}

/** readPost takes a url from listPosts, so its title is usually already in the conversation. */
function listedTitle(url: string, messages: ChatMessage[]): string | undefined {
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "tool-listPosts" || part.state !== "output-available") {
        continue;
      }

      const post = part.output.find((listed) => listed.url === url);

      if (post !== undefined) {
        return post.title;
      }
    }
  }

  return undefined;
}

// A finished heading line: `**Checking the posts**` or `## Checking the posts`.
const HEADING = /^[ \t]*(?:\*\*(?<bold>[^*\n]+)\*\*|#{1,6}[ \t]+(?<hash>[^\n]+)\n)/gmu;

// Where the last finished sentence ends: a stop before a space, or a line break.
const SENTENCE_END = /[.!?](?=\s)|\n/gu;

/**
 * The reasoning's newest thought, short enough for one line: its latest
 * heading if it writes them, else its latest finished sentence. Undefined
 * until there's a whole one, so the row never shows half a thought.
 */
export function latestThought(reasoning: string): string | undefined {
  const heading = [...reasoning.matchAll(HEADING)].at(-1)?.groups;
  const title = heading?.bold ?? heading?.hash;

  if (title !== undefined) {
    return clean(title);
  }

  const end = [...reasoning.matchAll(SENTENCE_END)].at(-1);

  if (end === undefined) {
    return undefined;
  }

  return reasoning
    .slice(0, end.index + 1)
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((candidate) => clean(candidate))
    .findLast((candidate) => candidate !== "");
}

/** Drops Markdown marks and a closing period; labels don't end in one. */
function clean(text: string): string {
  return text
    .replaceAll(/[*_`#]/gu, "")
    .trim()
    .replace(/\.$/u, "");
}
