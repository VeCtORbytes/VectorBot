"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { branchConversation } from "@/features/conversation";

export function useBranchConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: {
      conversationId: string;
      messageId: string;
      customTitle?: string;
    }) => branchConversation(input),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      toast.success("Created new chat branch!");
      router.push(`/c/${newConversation.id}`);
    },
    onError: () => {
      toast.error("Failed to create chat branch");
    },
  });
}
