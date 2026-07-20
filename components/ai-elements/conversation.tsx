"use client";

import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Auto-scrolling scroll container that sticks to the newest message. */
export function Conversation({
  className,
  children,
  ...props
}: React.ComponentProps<typeof StickToBottom>) {
  return (
    <StickToBottom
      className={cn("relative flex-1 overflow-y-auto", className)}
      {...props}
    >
      {children}
    </StickToBottom>
  );
}

export function ConversationContent({
  className,
  ...props
}: React.ComponentProps<typeof StickToBottom.Content>) {
  return (
    <StickToBottom.Content
      className={cn("mx-auto flex w-full max-w-3xl flex-col px-4 py-6", className)}
      {...props}
    />
  );
}

/** Floating "jump to latest" button, shown only when scrolled up. */
export function ConversationScrollButton({
  className,
}: {
  className?: string;
}) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Scroll to bottom"
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-md",
        className
      )}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown />
    </Button>
  );
}
