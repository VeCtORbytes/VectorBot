import { notFound } from "next/navigation";
import { getConversation } from "@/features/conversation";
import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { ConversationView } from "@/features/messages/components/conversation-view";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await getConversation(id).catch(() => null);

  if (!conversation) {
    notFound();
  }

  const initialMessages = await loadChatMessages(conversation.id);

  return (
    <ConversationView
      key={conversation.id}
      conversationId={conversation.id}
      title={conversation.title}
      model={conversation.model}
      initialMessages={initialMessages}
    />
  );
}
