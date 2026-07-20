"use client";

import { GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface BranchButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function BranchButton({ onClick, disabled }: BranchButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            onClick={onClick}
            className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted/80"
            aria-label="Branch from here"
          >
            <GitFork className="size-3.5" />
          </Button>
        }
      />
      <TooltipContent side="top">Branch from here</TooltipContent>
    </Tooltip>
  );
}
