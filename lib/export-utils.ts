import type { UIMessage } from "ai";

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || msg.parts.length === 0) return "";
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p: any) => p.text)
    .join("\n\n");
}

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "chat-transcript";
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(title: string, messages: UIMessage[]) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let markdown = `# ${title}\n\n*Exported from VectorBot on ${dateStr}*\n\n---\n\n`;

  messages.forEach((msg) => {
    const roleName = msg.role === "user" ? "👤 User" : "🤖 Vector";
    const text = getMessageText(msg);
    if (text) {
      markdown += `### ${roleName}\n\n${text}\n\n---\n\n`;
    }
  });

  const filename = `${sanitizeFilename(title)}.md`;
  triggerDownload(markdown, filename, "text/markdown;charset=utf-8;");
}

export function exportToJson(title: string, messages: UIMessage[]) {
  const data = {
    title,
    exportedAt: new Date().toISOString(),
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts,
    })),
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `${sanitizeFilename(title)}.json`;
  triggerDownload(jsonStr, filename, "application/json;charset=utf-8;");
}

export async function copyTranscriptToClipboard(title: string, messages: UIMessage[]): Promise<boolean> {
  try {
    let text = `# ${title}\n\n`;
    messages.forEach((msg) => {
      const roleName = msg.role === "user" ? "User" : "Vector";
      const content = getMessageText(msg);
      if (content) {
        text += `**${roleName}**:\n${content}\n\n`;
      }
    });

    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy transcript:", err);
    return false;
  }
}
