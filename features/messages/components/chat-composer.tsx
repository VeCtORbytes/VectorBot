"use client";

import { useRef, useState } from "react";
import { ArrowUp, FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export interface AttachmentItem {
  id: string;
  name: string;
  contentType: string;
  url: string;
  isImage: boolean;
}

export function ChatComposer({
  onSend,
  isSending = false,
  disabled = false,
}: {
  onSend: (
    text: string,
    attachments?: { name: string; contentType: string; url: string }[]
  ) => void;
  isSending?: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) &&
    !isSending &&
    !disabled;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();

      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              contentType: file.type || "application/octet-stream",
              url,
              isImage,
            },
          ]);
        }
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  function submit() {
    if (!canSend) return;

    const formattedAttachments = attachments.map(({ name, contentType, url }) => ({
      name,
      contentType,
      url,
    }));

    onSend(value.trim(), formattedAttachments.length > 0 ? formattedAttachments : undefined);
    setValue("");
    setAttachments([]);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.txt,.js,.ts,.py,.json,.md,.html,.css"
        className="hidden"
      />

      <InputGroup className="flex-col p-2 gap-2">
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/60 px-2 py-1 text-xs transition-colors"
              >
                {item.isImage ? (
                  <div className="relative size-8 overflow-hidden rounded border">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <FileText className="size-3.5 text-primary shrink-0" />
                )}
                <span className="max-w-32 truncate text-foreground text-[11px] font-medium">
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(item.id)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                  aria-label="Remove attachment"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <InputGroupTextarea
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="Message VectorBot…"
          className="max-h-48 min-h-0 border-none focus-visible:ring-0 shadow-none"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <InputGroupAddon align="block-end" className="justify-between pt-1">
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Attach file"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="size-4" />
          </InputGroupButton>

          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="default"
            aria-label="Send message"
            disabled={!canSend}
            onClick={submit}
          >
            {isSending ? <Spinner /> : <ArrowUp className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
