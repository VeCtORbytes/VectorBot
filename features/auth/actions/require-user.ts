import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function requireUser() {
  const { userId } = await auth.protect();

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User has not completed onboarding");
  }

  return user;
}
