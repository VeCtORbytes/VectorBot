"use client";

import type { Message as MessageRecord } from "@/lib/generated/prisma/client";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

export function ChatMessages({ messages }: { messages: MessageRecord[] }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-6">
      {messages.map((message) => {
        const from = message.role === "USER" ? "user" : "assistant";

        return (
          <Message key={message.id} from={from}>
            <MessageContent>
              {from === "assistant" ? (
                <MessageResponse>{message.content}</MessageResponse>
              ) : (
                message.content
              )}
            </MessageContent>
          </Message>
        );
      })}
    </div>
  );
}
