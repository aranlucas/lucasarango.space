// Errors the chat route returns as JSON and the client rethrows, after the AI
// SDK chatbot template's lib/errors.ts.

import { z } from "zod";

const errorCodeSchema = z.enum(["bad_request:api", "bad_request:chat", "offline:chat"]);

export type ErrorCode = z.infer<typeof errorCodeSchema>;

const ERRORS: Record<ErrorCode, { status: number; message: string }> = {
  "bad_request:api": { status: 400, message: "Send the conversation as chat messages." },
  "bad_request:chat": { status: 400, message: "Send a question." },
  "offline:chat": { status: 503, message: "The assistant is unavailable right now." },
};

/** The body of a failed chat response. */
export const errorResponseSchema = z.object({ code: errorCodeSchema, message: z.string() });

export class ChatbotError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;

  /** `detail` replaces the default message with something specific, such as which limit a question broke. */
  constructor(code: ErrorCode, detail?: string) {
    super(detail ?? ERRORS[code].message);
    this.code = code;
    this.statusCode = ERRORS[code].status;
  }

  toResponse() {
    return Response.json({ code: this.code, message: this.message }, { status: this.statusCode });
  }
}
