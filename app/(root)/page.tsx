import { redirect } from "next/navigation";
import { startNewChat } from "@/features/home";

export default async function Home() {
  const conversation = await startNewChat();
  redirect(`/c/${conversation.id}`);
}
