import { openai } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

export function getChatModel(modelId: string = DEFAULT_CHAT_MODEL) {
  return openai(modelId);
}
