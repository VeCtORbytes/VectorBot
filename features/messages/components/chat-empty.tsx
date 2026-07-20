"use client";

import { Code2, Globe, Lightbulb, Sparkles, Wand2 } from "lucide-react";

export interface SuggestionPrompt {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const SUGGESTIONS: SuggestionPrompt[] = [
  {
    icon: <Code2 className="size-4 text-blue-500" />,
    label: "Write Code",
    prompt:
      "Write a React component in TypeScript using TailwindCSS for a modern pricing table.",
  },
  {
    icon: <Lightbulb className="size-4 text-amber-500" />,
    label: "Brainstorm Ideas",
    prompt:
      "Brainstorm 5 innovative SaaS product ideas for developers built with AI agents.",
  },
  {
    icon: <Wand2 className="size-4 text-purple-500" />,
    label: "Explain Concepts",
    prompt:
      "Explain how vector embeddings and semantic search work in plain English.",
  },
  {
    icon: <Globe className="size-4 text-emerald-500" />,
    label: "Real-time Search",
    prompt:
      "What are the latest AI news and framework updates released this week?",
  },
];

export function ChatEmpty({
  onSelectPrompt,
}: {
  onSelectPrompt?: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <Sparkles className="size-6" />
      </div>

      <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        What can I help with today?
      </h1>
      <p className="mb-8 text-xs text-muted-foreground sm:text-sm">
        Ask Vector a question, attach files, or pick a topic below to get started.
      </p>

      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt?.(item.prompt)}
            className="group flex flex-col items-start gap-1.5 rounded-xl border border-border/70 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-accent/40 hover:shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2 font-medium text-xs text-foreground group-hover:text-primary transition-colors">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
