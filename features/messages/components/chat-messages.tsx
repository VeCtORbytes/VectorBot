"use client";

import type { UIMessage } from "ai";
import { FileText } from "lucide-react";
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

                    if (part.type === "file") {
                      const filePart = part as any;
                      const isImage =
                        filePart.mediaType?.startsWith("image/") ||
                        (typeof filePart.url === "string" &&
                          filePart.url.startsWith("data:image/"));

                      if (isImage) {
                        return (
                          <div
                            key={index}
                            className="my-1.5 overflow-hidden rounded-xl border border-border/80 bg-background/50"
                          >
                            <img
                              src={filePart.url}
                              alt={filePart.filename ?? "Uploaded image"}
                              className="max-h-64 max-w-xs object-contain rounded-lg"
                            />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className="my-1.5 flex items-center gap-2 rounded-lg border border-border/80 bg-muted/50 px-3 py-2 text-xs font-medium"
                        >
                          <FileText className="size-4 text-primary shrink-0" />
                          <span className="truncate max-w-48 font-semibold">
                            {filePart.filename ?? "Attachment"}
                          </span>
                        </div>
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
