"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth";
import { db } from "@/lib/db";

/** Fallback model for a brand-new conversation before the user picks one. */
const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Throws unless the conversation exists and belongs to the given user.
 * Module-local guard — never exported (a "use server" file may only export
 * async server actions, and we don't want this exposed as an RPC endpoint).
 */
async function assertOwnsConversation(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });

  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversation not found");
  }
}

export async function listConversations() {
  const user = await requireUser();

  return db.conversation.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
  });
}

export async function getConversation(conversationId: string) {
  const user = await requireUser();
  await assertOwnsConversation(conversationId, user.id);

  return db.conversation.findUnique({ where: { id: conversationId } });
}

export async function createConversation(input?: {
  title?: string;
  model?: string;
  systemPrompt?: string;
}) {
  const user = await requireUser();

  const conversation = await db.conversation.create({
    data: {
      userId: user.id,
      title: input?.title ?? "New Chat",
      model: input?.model ?? DEFAULT_MODEL,
      systemPrompt: input?.systemPrompt,
    },
  });

  revalidatePath("/");

  return conversation;
}

export async function updateConversation(
  conversationId: string,
  data: { title?: string; isPinned?: boolean; isArchived?: boolean }
) {
  const user = await requireUser();
  await assertOwnsConversation(conversationId, user.id);

  const conversation = await db.conversation.update({
    where: { id: conversationId },
    data,
  });

  revalidatePath("/");
  revalidatePath(`/chat/${conversationId}`);

  return conversation;
}

export async function deleteConversation(conversationId: string) {
  const user = await requireUser();
  await assertOwnsConversation(conversationId, user.id);

  await db.conversation.delete({ where: { id: conversationId } });

  revalidatePath("/");
}
