import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type MessageRole = "user" | "assistant";

/**
 * A single chat message row. `from` drives alignment: user messages sit on the
 * right, assistant messages on the left. The `data-from` attribute is read by
 * `MessageContent` (via group selectors) to pick its bubble colour.
 */
export function Message({
  from,
  className,
  ...props
}: React.ComponentProps<"div"> & { from: MessageRole }) {
  return (
    <div
      data-slot="message"
      data-from={from}
      className={cn(
        "group/message flex w-full items-end gap-2 py-1.5",
        "data-[from=user]:justify-end data-[from=assistant]:justify-start",
        className
      )}
      {...props}
    />
  );
}

export function MessageContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "min-w-0 max-w-[80%] overflow-hidden rounded-xl px-3 py-2 text-sm leading-relaxed wrap-break-word",
        "bg-muted text-foreground",
        "group-data-[from=user]/message:bg-primary group-data-[from=user]/message:text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

/** Renders assistant markdown (streaming-safe) via Streamdown. */
export function MessageResponse({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <Streamdown
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert [&_pre]:overflow-x-auto",
        className
      )}
    >
      {children}
    </Streamdown>
  );
}
