import { db } from "@/lib/db";
import { MessageRole, MessageStatus } from "@/lib/generated/prisma/enums";
import type { UIMessage } from "ai";

type MessagePart = UIMessage["parts"][number];

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function loadChatMessages(
  conversationId: string
): Promise<UIMessage[]> {
  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((msg) => {
    const role = msg.role.toLowerCase() as "user" | "assistant" | "system";
    const rawParts = msg.parts;
    const parts: MessagePart[] =
      Array.isArray(rawParts) && rawParts.length > 0
        ? (rawParts as unknown as MessagePart[])
        : [{ type: "text", text: msg.content }];

    return {
      id: msg.id,
      role,
      parts,
    };
  });
}

export async function saveChatMessages(
  conversationId: string,
  messages: UIMessage[],
  options: { updateTitle?: boolean } = {}
) {
  const { updateTitle = true } = options;

  for (const msg of messages) {
    const role = msg.role.toUpperCase() as MessageRole;
    const content = getMessageText(msg);

    await db.message.upsert({
      where: { id: msg.id },
      create: {
        id: msg.id,
        conversationId,
        role,
        status: MessageStatus.COMPLETE,
        content,
        parts: (msg.parts as any) ?? [{ type: "text", text: content }],
      },
      update: {
        content,
        parts: (msg.parts as any) ?? [{ type: "text", text: content }],
        status: MessageStatus.COMPLETE,
      },
    });
  }

  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  if (updateTitle) {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { title: true },
    });

    if (conversation?.title === "New Chat") {
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        const text = getMessageText(firstUserMsg).trim();
        if (text) {
          const title = text.slice(0, 48);
          await db.conversation.update({
            where: { id: conversationId },
            data: { title },
          });
        }
      }
    }
  }
}
