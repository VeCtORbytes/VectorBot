import { Sparkles } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ChatEmpty() {
  return (
    <Empty className="flex-1 border-none">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sparkles />
        </EmptyMedia>
        <EmptyTitle>How can I help you today?</EmptyTitle>
        <EmptyDescription>
          Ask a question or start a conversation to get going.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
