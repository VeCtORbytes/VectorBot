/**
 * Centralized React Query key factory.
 *
 * Keeping keys in one place keeps invalidation consistent between the
 * server-action mutations and the hooks that consume them.
 */
export const queryKeys = {
  conversations: {
    all: ["conversations"] as const,
    detail: (id: string) => ["conversations", id] as const,
  },
  messages: {
    byConversation: (conversationId: string) =>
      ["messages", conversationId] as const,
  },
};
