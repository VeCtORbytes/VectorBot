import { cn } from "@/lib/utils";

/** Three-dot "assistant is thinking" indicator. */
export function Loader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-center gap-1 text-muted-foreground", className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-current"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
