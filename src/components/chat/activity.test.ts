import { expect, test } from "vitest";

import {
  answerActivity,
  BETWEEN_STEPS,
  finishedToolLabel,
  latestThought,
} from "@/components/chat/activity";
import { WAITING_MESSAGE } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

const question: ChatMessage = {
  id: "q",
  role: "user",
  parts: [{ type: "text", text: "What has he written?" }],
};

const answer = (...parts: ChatMessage["parts"]): ChatMessage => ({
  id: "a",
  role: "assistant",
  parts,
});

const listed: ChatMessage["parts"][number] = {
  type: "tool-listPosts",
  toolCallId: "list",
  state: "output-available",
  input: {},
  output: [
    {
      title: "Hello, world",
      date: "2026-01-01",
      summary: "The first post.",
      url: "https://example.com/blog/hello",
      link: "[Hello, world](https://example.com/blog/hello)",
    },
  ],
};

test("waits on the résumé until the answer has said anything", () => {
  expect(answerActivity([question])).toBe(WAITING_MESSAGE);
  expect(answerActivity([question, answer()])).toBe(WAITING_MESSAGE);
  expect(answerActivity([question, answer({ type: "step-start" })])).toBe(WAITING_MESSAGE);
});

test("a running tool says what it's reading, by title once the posts are listed", () => {
  expect(
    answerActivity([
      question,
      answer({ type: "tool-listPosts", toolCallId: "list", state: "input-available", input: {} }),
    ]),
  ).toBe("Looking through the posts");

  expect(
    answerActivity([
      question,
      answer(
        listed,
        { type: "step-start" },
        {
          type: "tool-readPost",
          toolCallId: "read",
          state: "input-available",
          input: { url: "https://example.com/blog/hello" },
        },
      ),
    ]),
  ).toBe("Reading “Hello, world”");
});

test("between steps, after a tool answers, the answer is thinking it over", () => {
  expect(answerActivity([question, answer(listed)])).toBe(BETWEEN_STEPS);
  // The next step has started but hasn't streamed anything yet.
  expect(answerActivity([question, answer(listed, { type: "step-start" })])).toBe(BETWEEN_STEPS);
});

test("reasoning shows its latest thought", () => {
  expect(
    answerActivity([
      question,
      answer({ type: "reasoning", state: "streaming", text: "Checking the posts. Then I" }),
    ]),
  ).toBe("Checking the posts");
  // Once it's done, its last thought stands, finished or not.
  expect(
    answerActivity([
      question,
      answer({ type: "reasoning", state: "done", text: "Checking the posts. Then the résumé" }),
    ]),
  ).toBe("Then the résumé");
});

test("printing text needs no status; empty text still waits", () => {
  expect(
    answerActivity([question, answer(listed, { type: "text", state: "streaming", text: "" })]),
  ).toBe(BETWEEN_STEPS);
  expect(
    answerActivity([question, answer({ type: "text", state: "streaming", text: "He" })]),
  ).toBeNull();
});

test("latestThought prefers the newest heading", () => {
  expect(latestThought("**Reading the résumé**\n\nHe worked at…\n\n**Picking examples**")).toBe(
    "Picking examples",
  );
  expect(latestThought("## Listing posts\nNow")).toBe("Listing posts");
  // A hash heading isn't finished until its line is.
  expect(latestThought("## Listing po")).toBeUndefined();
});

test("latestThought otherwise takes the newest finished sentence", () => {
  expect(latestThought("The user asks about work. Let me check the `résumé`. He")).toBe(
    "Let me check the résumé",
  );
  expect(latestThought("Is this about posts? Maybe")).toBe("Is this about posts?");
  expect(latestThought("Still thinking")).toBeUndefined();
});

test("a failed post read has no finished label, even with an undefined title", () => {
  expect(
    finishedToolLabel({
      type: "tool-readPost",
      toolCallId: "read",
      state: "output-available",
      input: { url: "https://example.com/blog/missing" },
      output: { error: "Post not found", title: undefined },
    }),
  ).toBeNull();
});
