// Shared by the Ask popup and its API route, so it stays free of server imports.

/** Questions offered before the first message. */
export const STARTERS = [
  "How did the Ask DoorDash grocery agent go from prototype to launch?",
  "What has Lucas written about MCP servers?",
  "Why would Lucas be a strong hire for an AI agents team?",
  "What languages and platforms does he work in?",
];

/** Limits for a public endpoint on a free model. */
export const ASK_LIMITS = { messages: 24, questionChars: 1000 } as const;

/** The route's waiting status, and how long it waits before saying it's still waiting. */
export const WAITING = {
  message: "Reading the résumé",
  stillWaitingMessage: "Still waiting. Free models can be slow.",
  stillWaitingAfterMs: 9000,
} as const;
