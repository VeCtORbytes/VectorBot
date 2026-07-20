"use client";

import type { UIMessage } from "ai";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { SearchToolCall } from "@/components/ai-elements/search-tool-call";
import { BranchButton } from "@/components/ai-elements/branch-button";
import { useBranchConversation } from "@/features/conversation/hooks/use-branching";

export function ChatMessages({
  conversationId,
  messages,
  status,
}: {
  conversationId?: string;
  messages: UIMessage[];
  status?: string;
}) {
  const branchMutation = useBranchConversation();
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  function handleBranch(messageId: string) {
    if (!conversationId) return;
    branchMutation.mutate({ conversationId, messageId });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-6">
      {messages.map((message) => {
        const from = message.role === "user" ? "user" : "assistant";

        return (
          <div key={message.id} className="group/row relative flex flex-col">
            <Message from={from}>
              <MessageContent>
                {message.parts && message.parts.length > 0 ? (
                  message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return from === "assistant" ? (
                        <MessageResponse key={index}>{part.text}</MessageResponse>
                      ) : (
                        <span key={index}>{part.text}</span>
                      );
                    }

                    if (
                      part.type === "tool-webSearch" ||
                      part.type === "dynamic-tool" ||
                      part.type.startsWith("tool-")
                    ) {
                      const toolPart = part as any;
                      const query =
                        toolPart.input?.query ??
                        toolPart.args?.query ??
                        toolPart.output?.query;

                      return (
                        <SearchToolCall
                          key={index}
                          query={query}
                          state={toolPart.state}
                          output={toolPart.output}
                          errorText={toolPart.errorText}
                        />
                      );
                    }

                    return null;
                  })
                ) : null}
              </MessageContent>
            </Message>

            {conversationId && (
              <div
                className={
                  from === "user"
                    ? "flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity px-1 -mt-1"
                    : "flex justify-start opacity-0 group-hover/row:opacity-100 transition-opacity px-1 -mt-1"
                }
              >
                <BranchButton
                  disabled={branchMutation.isPending}
                  onClick={() => handleBranch(message.id)}
                />
              </div>
            )}
          </div>
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
