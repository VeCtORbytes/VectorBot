"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  createConversation,
  deleteConversation,
  listConversations,
  updateConversation,
} from "@/features/conversation";

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.all,
    queryFn: () => listConversations(),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input?: Parameters<typeof createConversation>[0]) =>
      createConversation(input),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      router.push(`/c/${conversation.id}`);
    },
    onError: () => {
      toast.error("Failed to create conversation");
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateConversation>[1];
    }) => updateConversation(id, data),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversation.id),
      });
    },
    onError: () => {
      toast.error("Failed to update conversation");
    },
  });
}

export function useDeleteConversation(activeId?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });

      // If the chat we just deleted is the one on screen, bail back home.
      if (activeId === id) {
        router.push("/");
      }
    },
    onError: () => {
      toast.error("Failed to delete conversation");
    },
  });
}
