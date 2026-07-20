import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { onBoard } from "./onboard";

export async function requireUser() {
  const { userId } = await auth.protect();

  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    user = await onBoard();
  }

  return user;
}

