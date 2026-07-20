"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Check,
  Ellipsis,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
} from "../hooks/use-conversations";
import { Button } from "@/components/ui/button";

function ConversationItem({
  conversation,
}: {
  conversation: {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
  };
}) {
  const params = useParams();
  const router = useRouter();
  const currentId = params?.id as string | undefined;
  const isActive = currentId === conversation.id;

  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title);

  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  function handleSaveRename() {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== conversation.title) {
      updateConversation.mutate({
        id: conversation.id,
        data: { title: trimmed },
      });
    }
    setIsEditing(false);
  }

  function handleTogglePin() {
    updateConversation.mutate({
      id: conversation.id,
      data: { isPinned: !conversation.isPinned },
    });
  }

  function handleDelete() {
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => {
        if (isActive) {
          router.push("/");
        }
      },
    });
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className={cn(conversation.isPinned && "font-medium")}
      >
        <Link href={`/c/${conversation.id}`} className="w-full truncate">
          {isEditing ? (
            <div className="flex w-full items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="w-full rounded bg-background px-1 py-0.5 text-xs border focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveRename}
                className="p-0.5 text-muted-foreground hover:text-foreground"
              >
                <Check className="size-3" />
              </button>
            </div>
          ) : (
            <span className="truncate">{conversation.title}</span>
          )}
        </Link>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover>
              <Ellipsis />
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleTogglePin}>
            <Pin className="mr-2 size-4" />
            <span>{conversation.isPinned ? "Unpin" : "Pin"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Sparkles className="mr-2 size-4" />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function ChatList() {
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="px-2 py-4 text-center text-xs text-muted-foreground">
        No conversations yet
      </div>
    );
  }

  return (
    <SidebarMenu>
      {conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </SidebarMenu>
  );
}

function SidebarFooterMenu() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2 overflow-hidden">
        <UserButton />
        <span className="truncate text-xs font-medium text-sidebar-foreground">
          {user?.fullName || user?.username || "User"}
        </span>
      </div>
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search chats (⌘K)"
              onClick={() => {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                );
              }}
            >
              <Search className="size-4" />
            </Button>
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
