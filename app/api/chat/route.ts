import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  UIMessage,
} from "ai";
import { DEFAULT_SYSTEM_PROMPT, getChatModel } from "@/features/ai";

export async function POST(req: Request) {
  const { messages, model } = (await req.json()) as {
    messages: UIMessage[];
    model?: string;
  };

  const chatModel = getChatModel(model);

  const result = streamText({
    model: chatModel,
    system: DEFAULT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}
