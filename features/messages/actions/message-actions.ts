"use server";

import { requireUser } from "@/features/auth";
import { db } from "@/lib/db";
import {
  MessageRole,
  MessageStatus,
  type Prisma,
} from "@/lib/generated/prisma/client";

const MAX_TITLE_LENGTH = 60;

/** Throws unless the conversation exists and belongs to the given user. */
async function assertOwnsConversation(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });

  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversation not found");
  }
}

/** Loads a message and verifies its conversation belongs to the user. */
async function requireOwnedMessage(messageId: string, userId: string) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { id: true, conversation: { select: { userId: true } } },
  });

  if (!message || message.conversation.userId !== userId) {
    throw new Error("Message not found");
  }
}

/** Derives a conversation title from the first user message. */
function deriveTitle(content: string) {
  const normalized = content.trim().replace(/\s+/g, " ");

  if (normalized.length <= MAX_TITLE_LENGTH) {
    return normalized || "New Chat";
  }

  return `${normalized.slice(0, MAX_TITLE_LENGTH).trimEnd()}…`;
}

export async function listMessages(conversationId: string) {
  const user = await requireUser();
  await assertOwnsConversation(conversationId, user.id);

  return db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(input: {
  conversationId: string;
  role: MessageRole;
  content: string;
  parts?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  status?: MessageStatus;
}) {
  const user = await requireUser();
  await assertOwnsConversation(input.conversationId, user.id);

  const message = await db.message.create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      status: input.status ?? MessageStatus.COMPLETE,
      parts: input.parts,
      metadata: input.metadata,
    },
  });

  // Bump the sidebar sort key, and auto-name a still-untitled chat from its
  // first user message.
  const conversation = await db.conversation.findUnique({
    where: { id: input.conversationId },
    select: { title: true },
  });

  const shouldRename =
    conversation?.title === "New Chat" && input.role === MessageRole.USER;

  await db.conversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: new Date(),
      ...(shouldRename ? { title: deriveTitle(input.content) } : {}),
    },
  });

  return message;
}

export async function updateMessage(
  messageId: string,
  data: {
    content?: string;
    parts?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    status?: MessageStatus;
  }
) {
  const user = await requireUser();
  await requireOwnedMessage(messageId, user.id);

  return db.message.update({
    where: { id: messageId },
    data,
  });
}

export async function deleteMessage(messageId: string) {
  const user = await requireUser();
  await requireOwnedMessage(messageId, user.id);

  await db.message.delete({ where: { id: messageId } });
}
