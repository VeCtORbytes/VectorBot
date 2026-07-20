"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  const { messages, sendMessage, status } = useChat({
    id: conversationId,
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
  });

  const hasMessages = messages.length > 0;

  function handleSend(text: string) {
    sendMessage({ text });
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
