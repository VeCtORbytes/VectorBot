"use server";

import { requireUser } from "@/features/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function branchConversation(input: {
  conversationId: string;
  messageId: string;
  customTitle?: string;
}) {
  const user = await requireUser();

  const sourceConversation = await db.conversation.findUnique({
    where: { id: input.conversationId },
    select: {
      id: true,
      userId: true,
      title: true,
      model: true,
      systemPrompt: true,
    },
  });

  if (!sourceConversation || sourceConversation.userId !== user.id) {
    throw new Error("Conversation not found or unauthorized");
  }

  const targetMessage = await db.message.findUnique({
    where: { id: input.messageId },
    select: { id: true, conversationId: true, createdAt: true, content: true },
  });

  if (!targetMessage || targetMessage.conversationId !== input.conversationId) {
    throw new Error("Message not found in conversation");
  }

  const historyMessages = await db.message.findMany({
    where: {
      conversationId: input.conversationId,
      createdAt: { lte: targetMessage.createdAt },
    },
    orderBy: { createdAt: "asc" },
  });

  const snippet = targetMessage.content.trim().slice(0, 30);
  const branchTitle =
    input.customTitle?.trim() ||
    `Branch: ${snippet || sourceConversation.title}`;

  const newConversation = await db.conversation.create({
    data: {
      userId: user.id,
      title: branchTitle,
      model: sourceConversation.model,
      systemPrompt: sourceConversation.systemPrompt,
      lastMessageAt: new Date(),
    },
  });

  if (historyMessages.length > 0) {
    await db.message.createMany({
      data: historyMessages.map((msg) => ({
        conversationId: newConversation.id,
        role: msg.role,
        status: msg.status,
        content: msg.content,
        parts: msg.parts as Prisma.InputJsonValue,
        metadata: msg.metadata as Prisma.InputJsonValue,
        parentId: msg.id,
      })),
    });
  }

  return newConversation;
}
