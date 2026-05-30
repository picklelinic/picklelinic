"use client";

import { useState } from "react";
import { PLEDGE_STATUS_LABELS, PLEDGE_LEVEL_LABELS } from "@/lib/phase5";
import { updatePledgeProgress } from "./actions";

type Row = {
  id: number;
  title: string;
  level: number;
  parentId: number | null;
  status: string;
  progressPct: number;
  dept: string | null;
};

export function PledgeRow({ row, canManage }: { row: Row; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const indent = (row.level - 1) * 16;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2.5">
        <span className="rounded-[var(--radius-cards)] bg-black/5 px-2 py-0.5 text-[12px] text-muted-foreground">
          {PLEDGE_LEVEL_LABELS[row.level]}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span style={{ paddingLeft: indent }} className="text-foreground">
          {row.level === 3 ? "· " : ""}
          {row.title}
        </span>
      </td>
      <td className="px-3 py-2.5 text-muted-foreground">{row.dept ?? "-"}</td>
      <td className="px-3 py-2.5">
        {editing ? (
          <form
            action={async (fd) => {
              await updatePledgeProgress(row.id, String(fd.get("status")), Number(fd.get("progressPct")));
              setEditing(false);
            }}
            className="flex items-center gap-1"
          >
            <select name="status" defaultValue={row.status} className="h-7 rounded border border-input px-1 text-[12px]">
              {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input name="progressPct" type="number" min="0" max="100" defaultValue={row.progressPct} className="h-7 w-14 rounded border border-input px-1 text-[12px]" />
            <button type="submit" className="text-[12px] text-deep-violet">저장</button>
          </form>
        ) : (
          <span className="text-[13px] text-foreground">{PLEDGE_STATUS_LABELS[row.status]}</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-hint-of-sky">
            <div className="h-full rounded-full bg-deep-violet" style={{ width: `${row.progressPct}%` }} />
          </div>
          <span className="text-[12px] text-muted-foreground">{row.progressPct}%</span>
          {canManage && !editing && (
            <button onClick={() => setEditing(true)} className="text-[12px] text-smoke-gray hover:text-deep-violet">
              수정
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
