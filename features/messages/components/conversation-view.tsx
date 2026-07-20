"use client";

import { MessageRole } from "@/lib/generated/prisma/enums";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useCreateMessage,
  useMessages,
} from "@/features/messages/hooks/use-messages";
import { ChatComposer } from "./chat-composer";
import { ChatEmpty } from "./chat-empty";
import { ChatMessages } from "./chat-messages";

export function ConversationView({
  conversationId,
  title,
}: {
  conversationId: string;
  title: string;
}) {
  const { data: messages, isLoading } = useMessages(conversationId);
  const createMessage = useCreateMessage(conversationId);

  const hasMessages = (messages?.length ?? 0) > 0;

  function handleSend(text: string) {
    createMessage.mutate({
      conversationId,
      role: MessageRole.USER,
      content: text,
    });
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {isLoading ? null : hasMessages ? (
          <ChatMessages messages={messages ?? []} />
        ) : (
          <ChatEmpty />
        )}
      </div>

      <ChatComposer onSend={handleSend} isSending={createMessage.isPending} />
    </div>
  );
}
