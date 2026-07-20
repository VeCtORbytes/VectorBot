"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  createMessage,
  deleteMessage,
  listMessages,
  updateMessage,
} from "@/features/messages";

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages.byConversation(conversationId),
    queryFn: () => listMessages(conversationId),
    enabled: Boolean(conversationId),
  });
}

export function useCreateMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof createMessage>[0]) =>
      createMessage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });
}

export function useUpdateMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateMessage>[1];
    }) => updateMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
    },
    onError: () => {
      toast.error("Failed to update message");
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      });
    },
    onError: () => {
      toast.error("Failed to delete message");
    },
  });
}
