import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, MessageSquarePlus } from "lucide-react";
import { db } from "@/lib/db";
import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { ChatMessages } from "@/features/messages/components/chat-messages";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await db.conversation.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: conversation ? `${conversation.title} — Shared on VectorBot` : "Shared Chat",
    description: "Read-only shared conversation transcript from VectorBot",
  };
}

export default async function SharedConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await db.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    notFound();
  }

  const initialMessages = await loadChatMessages(conversation.id);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2 truncate">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col truncate">
            <span className="truncate text-xs font-semibold text-foreground">
              {conversation.title}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Shared Conversation • Read-only
            </span>
          </div>
        </div>

        <Link href="/">
          <Button size="sm" variant="default" className="gap-1.5 text-xs">
            <MessageSquarePlus className="size-3.5" />
            <span>Start New Chat</span>
          </Button>
        </Link>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <ChatMessages messages={initialMessages} />
      </div>
    </div>
  );
}
