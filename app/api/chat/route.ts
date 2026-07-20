import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
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
    await saveChatMessages(conversationId, [userMessageToSave]);
  }

  const updatedMessages = await loadChatMessages(conversationId);
  const allMessages =
    updatedMessages.length > 0 ? updatedMessages : incomingMessages;

  const chatModel = getChatModel(requestedModel ?? conversation.model);

  const result = streamText({
    model: chatModel,
    system: conversation.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(allMessages),
  });

  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream({
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onEnd: async ({ messages }) => {
        await saveChatMessages(conversationId, messages, { updateTitle: false });
      },
    }),
  });
}
