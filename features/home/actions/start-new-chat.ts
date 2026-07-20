"use server";

import { requireUser } from "@/features/auth";
import { db } from "@/lib/db";

/** Fallback model for a brand-new conversation before the user picks one. */
const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Creates a fresh, empty conversation for the current user. The home page
 * calls this and immediately redirects into the new chat.
 */
export async function startNewChat() {
  const user = await requireUser();

  return db.conversation.create({
    data: {
      userId: user.id,
      model: DEFAULT_MODEL,
    },
  });
}
