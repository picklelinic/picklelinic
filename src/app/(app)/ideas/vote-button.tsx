"use client";

import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleVote } from "./actions";

export function VoteButton({
  ideaId,
  count,
  voted,
}: {
  ideaId: number;
  count: number;
  voted: boolean;
}) {
  return (
    <form action={toggleVote.bind(null, ideaId)}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-pills)] border px-3 py-1 text-[13px] font-medium tracking-[-0.14px] transition-colors",
          voted
            ? "border-deep-violet bg-accent text-deep-violet"
            : "border-border text-muted-foreground hover:bg-accent",
        )}
      >
        <ThumbsUp className="size-3.5" />
        추천 {count}
      </button>
    </form>
  );
}
