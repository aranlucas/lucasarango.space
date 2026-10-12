import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

export const env = createEnv({
  server: {
    FREELLMAPI_BASE_URL: z.url(),
    FREELLMAPI_API_KEY: z.string().min(1),
    FREELLMAPI_MODEL: z.string().min(1).default(DEFAULT_CHAT_MODEL),
  },
  runtimeEnv: {
    FREELLMAPI_BASE_URL: process.env.FREELLMAPI_BASE_URL,
    FREELLMAPI_API_KEY: process.env.FREELLMAPI_API_KEY,
    FREELLMAPI_MODEL: process.env.FREELLMAPI_MODEL,
  },
  emptyStringAsUndefined: true,
});
