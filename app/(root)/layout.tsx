import { auth } from "@clerk/nextjs/server";
import { onBoard } from "@/features/auth";
import { ChatShell } from "@/features/conversation/components/chat-shell";

export default async function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();
  await onBoard();

  return <ChatShell>{children}</ChatShell>;
}
