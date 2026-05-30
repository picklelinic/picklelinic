"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CycleFormState } from "./actions";

type Option = { id: number; label: string };
type Defaults = Record<string, string | number | boolean | null | undefined>;

function Sel({ name, label, options, def }: { name: string; label: string; options: Option[]; def?: number | null }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={def ?? ""} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
        <option value="">선택 안 함</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Area({ name, label, def }: { name: string; label: string; def?: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} rows={3} defaultValue={def ?? ""} />
    </div>
  );
}

export function CycleForm({
  action,
  quarters,
  year,
  quarter,
  departments,
  teams,
  towns,
  fields,
  fundSources,
  defaults,
  lockPeriod,
}: {
  action: (s: CycleFormState, fd: FormData) => Promise<CycleFormState>;
  quarters: number[];
  year: number;
  quarter: number;
  departments: Option[];
  teams: Option[];
  towns: Option[];
  fields: Option[];
  fundSources: Option[];
  defaults?: Defaults;
  lockPeriod?: boolean;
}) {
  const [state, formAction, pending] = useActionState<CycleFormState, FormData>(action, undefined);
  const d = defaults ?? {};
  const s = (k: string) => (d[k] as string | null | undefined) ?? "";
  const n = (k: string) => (d[k] as number | null | undefined) ?? null;

  return (
    <Card className="p-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="year">작성 연도 *</Label>
            <Input id="year" name="year" type="number" defaultValue={year} readOnly={lockPeriod} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quarter">분기(작성월) *</Label>
            <select id="quarter" name="quarter" defaultValue={quarter} disabled={lockPeriod} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px] disabled:opacity-60">
              {quarters.map((q) => (
                <option key={q} value={q}>{q}월</option>
              ))}
            </select>
            {lockPeriod && <input type="hidden" name="quarter" value={quarter} />}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">사업명 *</Label>
          <Input id="name" name="name" required defaultValue={s("name")} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Sel name="departmentId" label="부서" options={departments} def={n("departmentId")} />
          <Sel name="teamId" label="팀" options={teams} def={n("teamId")} />
          <Sel name="townId" label="읍면" options={towns} def={n("townId")} />
          <Sel name="fieldId" label="분야" options={fields} def={n("fieldId")} />
          <Sel name="fundSourceId" label="재원" options={fundSources} def={n("fundSourceId")} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetThousand">사업비(천원)</Label>
            <Input id="budgetThousand" name="budgetThousand" type="number" defaultValue={n("budgetThousand") ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startYear">시작연도</Label>
            <Input id="startYear" name="startYear" type="number" defaultValue={n("startYear") ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="endYear">종료연도</Label>
            <Input id="endYear" name="endYear" type="number" defaultValue={n("endYear") ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="executedThousand">집행액(천원)</Label>
            <Input id="executedThousand" name="executedThousand" type="number" defaultValue={n("executedThousand") ?? ""} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[14px] tracking-[-0.15px]">
          <input type="checkbox" name="isKeyPolicy" defaultChecked={!!d.isKeyPolicy} className="size-4 accent-[var(--color-deep-violet)]" />
          정책적 주요사업으로 지정 (별도 관리 대상)
        </label>

        <Area name="content" label="사업내용" def={s("content")} />
        <Area name="progress" label="추진현황" def={s("progress")} />
        <Area name="futurePlan" label="향후계획" def={s("futurePlan")} />
        <Area name="note" label="비고" def={s("note")} />

        {state?.error && <p className="text-[13px] tracking-[-0.14px] text-destructive">{state.error}</p>}
        <div>
          <Button type="submit" disabled={pending}>{pending ? "저장 중..." : "저장"}</Button>
        </div>
      </form>
    </Card>
  );
}
