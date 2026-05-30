"use client";

import { Button } from "@/components/ui/button";
import { IDEA_STATUS_LABELS } from "@/lib/format";
import { setIdeaStatus } from "../actions";

type IdeaStatus = "proposed" | "reviewing" | "adopted" | "rejected";

const STATUSES: IdeaStatus[] = ["proposed", "reviewing", "adopted", "rejected"];

export function StatusControl({ ideaId, current }: { ideaId: number; current: IdeaStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <form key={s} action={setIdeaStatus.bind(null, ideaId, s)}>
          <Button type="submit" variant={s === current ? "default" : "outline"} size="sm">
            {IDEA_STATUS_LABELS[s]}
          </Button>
        </form>
      ))}
    </div>
  );
}
