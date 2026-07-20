"use client";

import type { UIMessage } from "ai";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatMessages({
  messages,
  status,
}: {
  messages: UIMessage[];
  status?: string;
}) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-6">
      {messages.map((message) => {
        const from = message.role === "user" ? "user" : "assistant";
        const text = getMessageText(message);

        return (
          <Message key={message.id} from={from}>
            <MessageContent>
              {from === "assistant" ? (
                <MessageResponse>{text}</MessageResponse>
              ) : (
                text
              )}
            </MessageContent>
          </Message>
        );
      })}

      {isWaiting && (
        <Message from="assistant">
          <MessageContent>
            <Loader />
          </MessageContent>
        </Message>
      )}
    </div>
  );
}
