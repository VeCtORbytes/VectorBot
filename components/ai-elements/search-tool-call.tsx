"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Globe, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebSearchResult, SearchResultItem } from "@/features/ai";

export interface SearchToolCallProps {
  query?: string;
  state: string;
  output?: any;
  errorText?: string;
}

export function SearchToolCall({
  query,
  state,
  output,
  errorText,
}: SearchToolCallProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isComplete = state === "output-available" && output;
  const isError = state === "output-error" || errorText;
  const isLoading = !isComplete && !isError;

  const resultData: WebSearchResult | undefined = output as WebSearchResult;
  const results: SearchResultItem[] = resultData?.results ?? [];
  const searchQuery = query ?? resultData?.query ?? "web";

  if (isLoading) {
    return (
      <div className="my-2 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition-all">
        <Globe className="size-3.5 animate-spin text-primary" />
        <span>
          Searching the web for <strong className="text-foreground">"{searchQuery}"</strong>...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
        <Globe className="size-3.5" />
        <span>Web search failed for "{searchQuery}"</span>
      </div>
    );
  }

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border/80 bg-muted/30 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="size-3.5 text-primary shrink-0" />
          <span className="truncate">
            Searched web for <strong className="text-foreground">"{searchQuery}"</strong>
          </span>
          {results.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {results.length} sources
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="size-3.5 shrink-0" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0" />
        )}
      </button>

      {isOpen && results.length > 0 && (
        <div className="border-t border-border/60 p-2.5 flex flex-col gap-2">
          {results.map((item, index) => {
            let domain = "";
            try {
              domain = new URL(item.url).hostname.replace(/^www\./, "");
            } catch {
              domain = item.url;
            }

            return (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-0.5 rounded-lg border border-transparent p-2 text-xs transition-colors hover:border-border hover:bg-background/80"
              >
                <div className="flex items-center justify-between gap-2 font-medium text-foreground group-hover:text-primary">
                  <span className="truncate">{item.title || domain}</span>
                  <ExternalLink className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {item.snippet && (
                  <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                    {item.snippet}
                  </p>
                )}
                <span className="text-[10px] text-muted-foreground/70">{domain}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
