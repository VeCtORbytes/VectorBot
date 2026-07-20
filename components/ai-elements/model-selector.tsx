"use client";

import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AVAILABLE_MODELS, type ModelOption } from "@/features/ai";
import { useUpdateConversation } from "@/features/conversation/hooks/use-conversations";

export function ModelSelector({
  conversationId,
  currentModelId = "gpt-4o-mini",
}: {
  conversationId: string;
  currentModelId?: string;
}) {
  const updateConversation = useUpdateConversation();
  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === currentModelId) ?? AVAILABLE_MODELS[0];

  function handleSelect(model: ModelOption) {
    if (model.id === currentModelId) return;
    updateConversation.mutate({
      id: conversationId,
      data: { model: model.id },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs font-medium text-foreground hover:bg-accent/60"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>{selectedModel.name}</span>
            {selectedModel.badge && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] text-primary font-normal">
                {selectedModel.badge}
              </span>
            )}
            <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64 p-1">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = model.id === currentModelId;

          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleSelect(model)}
              className="flex flex-col items-start gap-0.5 p-2 cursor-pointer"
            >
              <div className="flex w-full items-center justify-between font-medium text-xs">
                <div className="flex items-center gap-1.5">
                  <span>{model.name}</span>
                  {model.badge && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] text-primary font-normal">
                      {model.badge}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="size-3.5 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {model.description}
              </p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
