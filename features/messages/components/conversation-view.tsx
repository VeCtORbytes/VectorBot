"use client";

import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { GitFork } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModelSelector } from "@/components/ai-elements/model-selector";
import { ExportMenu } from "@/components/ai-elements/export-menu";
import { useMessages } from "@/features/messages/hooks/use-messages";
import { ChatComposer } from "./chat-composer";
import { ChatEmpty } from "./chat-empty";
import { ChatMessages } from "./chat-messages";

type MessagePart = UIMessage["parts"][number];

export function ConversationView({
  conversationId,
  title,
  model = "gpt-4o-mini",
  initialMessages: initialMessagesProp,
}: {
  conversationId: string;
  title: string;
  model?: string;
  initialMessages?: UIMessage[];
}) {
  const queryClient = useQueryClient();
  const { data: dbMessages, isLoading } = useMessages(conversationId);

  const fallbackMessages: UIMessage[] = (dbMessages ?? []).map((msg) => ({
    id: msg.id,
    role: msg.role.toLowerCase() as "user" | "assistant" | "system",
    parts:
      Array.isArray(msg.parts) && (msg.parts as any[]).length > 0
        ? (msg.parts as unknown as MessagePart[])
        : [{ type: "text", text: msg.content }],
  }));

  const initialMessages =
    initialMessagesProp && initialMessagesProp.length > 0
      ? initialMessagesProp
      : fallbackMessages;

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
            model,
          },
        };
      },
    }),
    onFinish: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });

  const isBranch = title.startsWith("Branch:");
  const hasMessages = messages.length > 0;

  function handleSend(
    text: string,
    attachments?: { name: string; contentType: string; url: string }[]
  ) {
    if (attachments && attachments.length > 0) {
      sendMessage({
        text,
        files: attachments.map((att) => ({
          type: "file" as const,
          mediaType: att.contentType,
          url: att.url,
          filename: att.name,
        })),
      });
    } else {
      sendMessage({ text });
    }
  }

  if (isLoading && (!initialMessages || initialMessages.length === 0)) {
    return null;
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2 truncate">
          <SidebarTrigger />
          <ModelSelector
            conversationId={conversationId}
            currentModelId={model}
          />
          <h1 className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </h1>
          {isBranch && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary shrink-0">
              <GitFork className="size-3" />
              Branch
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ExportMenu
            conversationId={conversationId}
            title={title}
            messages={messages}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {hasMessages ? (
          <ChatMessages
            conversationId={conversationId}
            messages={messages}
            status={status}
          />
        ) : (
          <ChatEmpty onSelectPrompt={handleSend} />
        )}
      </div>

      <ChatComposer
        onSend={handleSend}
        isSending={status === "submitted" || status === "streaming"}
      />
    </div>
  );
}
