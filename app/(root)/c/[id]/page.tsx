import { notFound } from "next/navigation";
import { getConversation } from "@/features/conversation";
import { ConversationView } from "@/features/messages/components/conversation-view";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // getConversation throws if the chat isn't owned by the current user.
  const conversation = await getConversation(id).catch(() => null);

  if (!conversation) {
    notFound();
  }

  return (
    <ConversationView
      conversationId={conversation.id}
      title={conversation.title}
    />
  );
}
