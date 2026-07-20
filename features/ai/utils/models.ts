import { openai } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

export interface ModelOption {
  id: string;
  name: string;
  badge?: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    badge: "Fast",
    description: "Fast, lightweight model for everyday tasks",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    badge: "Smart",
    description: "High-intelligence flagship model for complex reasoning and vision",
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    badge: "Reasoning",
    description: "Advanced reasoning model for STEM, coding, and math",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Legacy high-capability vision model",
  },
];

export function getChatModel(modelId: string = DEFAULT_CHAT_MODEL) {
  return openai(modelId);
}
