"use client";

import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { queryKeys } from "@/lib/query-keys";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMessages } from "@/features/messages/hooks/use-messages";
import { ChatComposer } from "./chat-composer";
import { ChatEmpty } from "./chat-empty";
import { ChatMessages } from "./chat-messages";

type MessagePart = UIMessage["parts"][number];

export function ConversationView({
  conversationId,
  title,
}: {
  conversationId: string;
  title: string;
}) {
  const queryClient = useQueryClient();
  const { data: dbMessages, isLoading } = useMessages(conversationId);

  const initialMessages: UIMessage[] = (dbMessages ?? []).map((msg) => ({
    id: msg.id,
    role: msg.role.toLowerCase() as "user" | "assistant" | "system",
    parts:
      Array.isArray(msg.parts) && (msg.parts as any[]).length > 0
        ? (msg.parts as unknown as MessagePart[])
        : [{ type: "text", text: msg.content }],
  }));

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, messageId }) {
        return {
          body: {
            conversationId,
            messages,
            messageId,
          },
        };
      },
    }),
    onFinish: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
  });

  const hasMessages = messages.length > 0;

  function handleSend(text: string) {
    sendMessage({ text });
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {hasMessages ? (
          <ChatMessages messages={messages} status={status} />
        ) : (
          <ChatEmpty />
        )}
      </div>

      <ChatComposer
        onSend={handleSend}
        isSending={status === "submitted" || status === "streaming"}
      />
    </div>
  );
}
