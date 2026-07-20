"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export function ChatComposer({
  onSend,
  isSending = false,
  disabled = false,
}: {
  onSend: (text: string) => void;
  isSending?: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !isSending && !disabled;

  function submit() {
    if (!canSend) {
      return;
    }
    onSend(value.trim());
    setValue("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <InputGroup>
        <InputGroupTextarea
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="Message VectorBot…"
          className="max-h-48 min-h-0"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            className="ml-auto"
            size="icon-sm"
            variant="default"
            aria-label="Send message"
            disabled={!canSend}
            onClick={submit}
          >
            {isSending ? <Spinner /> : <ArrowUp />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
