import { createChat } from "@shadcn/helpers/ai-sdk";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { AskProvider } from "@/components/chat/ask-provider";
import { Messages } from "@/components/chat/messages";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import type { ChatMessage } from "@/lib/types";

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  // jsdom has no layout: no media queries, element scrolling, or clipboard.
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }));
  Element.prototype.scrollTo = () => {};

  writeText.mockResolvedValue();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  writeText.mockReset();
  Reflect.deleteProperty(navigator, "clipboard");
});

type Script = ReturnType<typeof createChat<ChatMessage>>;

/** The Ask panel's transcript and question box, answered by a script instead of the model. */
function renderChat(script: Script, options: Parameters<Script["transport"]>[0] = {}) {
  render(
    <AskProvider>
      <ActiveChatProvider transport={script.transport({ delayMs: 0, ...options })}>
        <Messages />
        <MultimodalInput id="question" />
      </ActiveChatProvider>
    </AskProvider>,
  );
}

function ask(question: string) {
  fireEvent.change(screen.getByLabelText("Your question"), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
}

const finished = () => waitFor(() => screen.getByRole("button", { name: "Ask" }));

test("a finished answer offers Copy and Retry, and Copy copies its Markdown", async () => {
  const script = createChat<ChatMessage>()
    .user("What does Lucas work on?")
    .assistant("He builds **developer tools**.");

  renderChat(script);

  ask("What does Lucas work on?");
  await finished();

  // Rendered as Markdown, so the bold words are their own element.
  expect(screen.getByText("developer tools")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Copy" }));

  expect(writeText).toHaveBeenCalledWith("He builds **developer tools**.");
  expect(await screen.findByRole("button", { name: "Copied" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
});

test("Retry asks again and replaces the latest answer", async () => {
  let answers = 0;
  // Unscripted, so every request (the question, then the retry) gets the next answer.
  renderChat(createChat<ChatMessage>(), {
    fallback: ({ writer }) => {
      answers += 1;
      writer.text(`Answer ${answers}.`);
    },
  });

  ask("Hi");
  await screen.findByText("Answer 1.");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));

  expect(await screen.findByText("Answer 2.")).toBeDefined();
  expect(screen.queryByText("Answer 1.")).toBeNull();
  expect(screen.getAllByRole("heading", { name: "Hi" })).toHaveLength(1);
});

test("while a tool runs, the answer says what it's doing and offers no actions yet", async () => {
  const script = createChat<ChatMessage>()
    .user("What has he written?")
    .assistant(({ writer }) => {
      writer.tool("listPosts", { input: {} }).sleep(150).output([]);
      writer.text("Nothing yet.");
    });

  renderChat(script);

  ask("What has he written?");

  expect(await screen.findByText("Looking through the posts")).toBeDefined();
  expect(screen.getByRole("log").getAttribute("aria-busy")).toBe("true");
  expect(screen.queryByRole("button", { name: "Copy" })).toBeNull();

  await finished();
  expect(screen.getByText("Nothing yet.")).toBeDefined();
  expect(screen.getByRole("log").getAttribute("aria-busy")).toBe("false");
});

test("each question is a scroll anchor, so it pins near the top while its answer prints", async () => {
  const script = createChat<ChatMessage>().user("One").assistant("Answer one.");
  renderChat(script);

  ask("One");
  await finished();

  const question = screen.getByRole("heading", { name: "One" });
  const answer = screen.getByText("Answer one.");

  expect(question.closest<HTMLElement>("[data-message-id]")?.dataset.scrollAnchor).toBe("true");
  expect(answer.closest<HTMLElement>("[data-message-id]")?.dataset.scrollAnchor).toBe("false");
});

test("a failed answer shows the error with Try again instead of Retry", async () => {
  const script = createChat<ChatMessage>().user("Hi").error("The model is busy.");
  renderChat(script);

  ask("Hi");
  const alert = await screen.findByRole("alert");

  expect(alert.textContent).toContain("The model is busy.");
  expect(within(alert).getByRole("button", { name: "Try again" })).toBeDefined();
  expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();

  // Let the aborted stream settle before cleanup.
  await act(() => Promise.resolve());
});
