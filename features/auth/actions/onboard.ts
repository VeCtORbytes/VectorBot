"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function onBoard() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Cannot onboard: no authenticated user");
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error("Cannot onboard: user has no primary email address");
  }

  return db.user.upsert({
    where: { clerkId: user.id },
    create: {
      id: user.id,
      clerkId: user.id,
      email,
    },
    update: {
      email,
    },
  });
}
