"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { Ellipsis, Moon, Pencil, Pin, PinOff, Plus, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversation,
} from "@/features/conversation/hooks/use-conversations";

type Conversation = NonNullable<
  ReturnType<typeof useConversations>["data"]
>[number];

function activeIdFromPathname(pathname: string) {
  return pathname.startsWith("/c/") ? pathname.slice("/c/".length) : undefined;
}

function ChatItem({
  conversation,
  activeId,
}: {
  conversation: Conversation;
  activeId?: string;
}) {
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation(activeId);

  function handleRename() {
    const title = window.prompt("Rename conversation", conversation.title);
    if (title && title.trim() && title.trim() !== conversation.title) {
      updateConversation.mutate({
        id: conversation.id,
        data: { title: title.trim() },
      });
    }
  }

  function handleTogglePin() {
    updateConversation.mutate({
      id: conversation.id,
      data: { isPinned: !conversation.isPinned },
    });
  }

  function handleDelete() {
    deleteConversation.mutate(conversation.id);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={conversation.id === activeId}
        tooltip={conversation.title}
        render={<Link href={`/c/${conversation.id}`} />}
      >
        {conversation.isPinned && <Pin className="text-muted-foreground" />}
        <span className="truncate">{conversation.title}</span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover>
              <Ellipsis />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleRename}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePin}>
            {conversation.isPinned ? <PinOff /> : <Pin />}
            {conversation.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function ChatList() {
  const pathname = usePathname();
  const activeId = activeIdFromPathname(pathname);
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 6 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuSkeleton />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  if (!conversations?.length) {
    return (
      <p className="px-2 py-1.5 text-sm text-muted-foreground">No chats yet</p>
    );
  }

  return (
    <SidebarMenu>
      {conversations.map((conversation) => (
        <ChatItem
          key={conversation.id}
          conversation={conversation}
          activeId={activeId}
        />
      ))}
    </SidebarMenu>
  );
}

function SidebarFooterMenu() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1">
      <UserButton />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        <Sun className="hidden dark:block" />
        <Moon className="block dark:hidden" />
      </Button>
    </div>
  );
}

export function AppSidebar() {
  const createConversation = useCreateConversation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-1">
          <Link href="/" className="font-heading text-base font-semibold">
            VectorBot
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="New chat"
            disabled={createConversation.isPending}
            onClick={() => createConversation.mutate(undefined)}
          >
            <Plus />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <ChatList />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
