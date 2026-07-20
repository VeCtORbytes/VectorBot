"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MessageSquare, MessageSquarePlus, Moon, Sun } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useConversations } from "@/features/conversation/hooks/use-conversations";

export function CommandPalette({
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;

  const setOpen = (value: boolean) => {
    if (!isControlled) setOpenInternal(value);
    onOpenChangeProp?.(value);
  };

  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: conversations = [] } = useConversations();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function handleSelect(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="VectorBot Search"
      description="Search chats or run commands..."
    >
      <CommandInput placeholder="Type a command or search chats…" />
      <CommandList>
        <CommandEmpty>No matching conversations or commands found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => handleSelect(() => router.push("/"))}
            className="cursor-pointer"
          >
            <MessageSquarePlus className="mr-2 size-4 text-primary" />
            <span>Start New Chat</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => setTheme(theme === "dark" ? "light" : "dark"))
            }
            className="cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="mr-2 size-4 text-amber-500" />
            ) : (
              <Moon className="mr-2 size-4 text-blue-500" />
            )}
            <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
          </CommandItem>
        </CommandGroup>

        {conversations.length > 0 && (
          <CommandGroup heading="Conversations">
            {conversations.map((chat) => (
              <CommandItem
                key={chat.id}
                onSelect={() =>
                  handleSelect(() => router.push(`/c/${chat.id}`))
                }
                className="cursor-pointer"
              >
                <MessageSquare className="mr-2 size-4 text-muted-foreground" />
                <span className="truncate">{chat.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
