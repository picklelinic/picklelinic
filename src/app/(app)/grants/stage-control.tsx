"use client";

import { GRANT_STAGE_LABELS } from "@/lib/phase5";
import { updateGrantStage } from "./actions";

export function GrantStageControl({ id, stage, canManage }: { id: number; stage: string; canManage: boolean }) {
  if (!canManage) {
    return <span className="text-[13px] text-foreground">{GRANT_STAGE_LABELS[stage]}</span>;
  }
  return (
    <form action={async (fd) => updateGrantStage(id, String(fd.get("stage")))}>
      <select
        name="stage"
        defaultValue={stage}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-7 rounded border border-input bg-background px-1 text-[12px]"
      >
        {Object.entries(GRANT_STAGE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </form>
  );
}
