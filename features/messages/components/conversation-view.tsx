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
type DbMessages = NonNullable<ReturnType<typeof useMessages>["data"]>;

function toUIMessages(rows: DbMessages): UIMessage[] {
  return rows.map((msg) => ({
    id: msg.id,
    role: msg.role.toLowerCase() as "user" | "assistant" | "system",
    parts:
      Array.isArray(msg.parts) && (msg.parts as unknown[]).length > 0
        ? (msg.parts as unknown as MessagePart[])
        : [{ type: "text", text: msg.content }],
  }));
}

export function ConversationView({
  conversationId,
  title,
}: {
  conversationId: string;
  title: string;
}) {
  const { data: dbMessages, isLoading } = useMessages(conversationId);

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-1 flex-col overflow-y-auto" />
      ) : (
        // Mount the chat only once saved messages are loaded, keyed by
        // conversation id. useChat reads `messages` only when its Chat instance
        // is created (on mount or id change) — so mounting before the history
        // is ready would leave the chat permanently empty.
        <ChatSession
          key={conversationId}
          conversationId={conversationId}
          initialMessages={toUIMessages(dbMessages ?? [])}
        />
      )}
    </div>
  );
}

function ChatSession({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();

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
      // Refresh the sidebar (title/order) and the persisted message cache so
      // navigating back to this chat shows the newly saved reply.
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
    },
  });

  const hasMessages = messages.length > 0;

  function handleSend(text: string) {
    sendMessage({ text });
  }

  return (
    <>
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
    </>
  );
}
