import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  UIMessage,
} from "ai";
import { db } from "@/lib/db";
import { requireUser } from "@/features/auth";
import {
  DEFAULT_SYSTEM_PROMPT,
  getChatModel,
  loadChatMessages,
  saveChatMessages,
  webSearchTool,
} from "@/features/ai";

export async function POST(req: Request) {
  await auth.protect();
  const user = await requireUser();

  const body = await req.json();
  const conversationId: string | undefined = body.conversationId ?? body.id;
  const incomingMessages: UIMessage[] = body.messages ?? [];
  const incomingMessage: UIMessage | undefined = body.message;
  const requestedModel: string | undefined = body.model;

  if (!conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }

  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      userId: user.id,
    },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const existingMessages = await loadChatMessages(conversationId);

  const userMessageToSave =
    incomingMessage ??
    incomingMessages.find(
      (m) => m.role === "user" && !existingMessages.some((em) => em.id === m.id)
    );

  if (
    userMessageToSave &&
    !existingMessages.some((em) => em.id === userMessageToSave.id)
  ) {
    try {
      await saveChatMessages(conversationId, [userMessageToSave]);
    } catch (error) {
      console.error("Failed to save user message:", error);
    }
  }

  const updatedMessages = await loadChatMessages(conversationId);
  const allMessages =
    updatedMessages.length > 0 ? updatedMessages : incomingMessages;

  const chatModel = getChatModel(requestedModel ?? conversation.model);

  const result = streamText({
    model: chatModel,
    system: conversation.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(allMessages),
    tools: {
      webSearch: webSearchTool,
    },
    stopWhen: isStepCount(5),
  });

  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream({
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onEnd: async ({ messages }) => {
        try {
          await saveChatMessages(conversationId, messages, {
            updateTitle: false,
          });
        } catch (error) {
          console.error("Failed to save assistant chat messages:", error);
        }
      },
    }),
  });
}
