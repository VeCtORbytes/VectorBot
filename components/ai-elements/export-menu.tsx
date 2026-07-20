"use client";

import type { UIMessage } from "ai";
import { Copy, FileCode, FileText, Link, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  copyTranscriptToClipboard,
  exportToMarkdown,
  exportToJson,
} from "@/lib/export-utils";

export function ExportMenu({
  conversationId,
  title,
  messages,
}: {
  conversationId: string;
  title: string;
  messages: UIMessage[];
}) {
  async function handleCopyLink() {
    const shareUrl = `${window.location.origin}/share/${conversationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to copy share link");
    }
  }

  async function handleCopyTranscript() {
    const success = await copyTranscriptToClipboard(title, messages);
    if (success) {
      toast.success("Transcript copied to clipboard!");
    } else {
      toast.error("Failed to copy transcript");
    }
  }

  function handleExportMd() {
    exportToMarkdown(title, messages);
    toast.success("Exported as Markdown (.md)");
  }

  function handleExportJson() {
    exportToJson(title, messages);
    toast.success("Exported as JSON (.json)");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label="Export or Share"
          >
            <Share2 className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52 p-1">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2 text-xs">
          <Link className="size-3.5 text-primary" />
          <span>Copy Share Link</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyTranscript} className="cursor-pointer gap-2 text-xs">
          <Copy className="size-3.5" />
          <span>Copy Transcript</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExportMd} className="cursor-pointer gap-2 text-xs">
          <FileText className="size-3.5" />
          <span>Export as Markdown (.md)</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportJson} className="cursor-pointer gap-2 text-xs">
          <FileCode className="size-3.5" />
          <span>Export as JSON (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
