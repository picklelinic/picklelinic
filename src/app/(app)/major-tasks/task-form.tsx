"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MajorTaskFormState } from "./actions";

type Option = { id: number; label: string };
type Defaults = {
  name?: string;
  departmentId?: number | null;
  teamId?: number | null;
  townId?: number | null;
  goal?: string | null;
  budgetThousand?: number | null;
  periodText?: string | null;
  locationText?: string | null;
  content?: string | null;
  progress?: string | null;
  futurePlan?: string | null;
  problem?: string | null;
  effect?: string | null;
  refs?: string | null;
};

function Sel({ name, label, options, def }: { name: string; label: string; options: Option[]; def?: number | null }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={def ?? ""}
        className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
      >
        <option value="">선택 안 함</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
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

export function TaskForm({
  action,
  rounds,
  year,
  round,
  departments,
  teams,
  towns,
  defaults,
  lockPeriod,
}: {
  action: (s: MajorTaskFormState, fd: FormData) => Promise<MajorTaskFormState>;
  rounds: number[];
  year: number;
  round: number;
  departments: Option[];
  teams: Option[];
  towns: Option[];
  defaults?: Defaults;
  lockPeriod?: boolean;
}) {
  const [state, formAction, pending] = useActionState<MajorTaskFormState, FormData>(action, undefined);
  const d = defaults ?? {};

  return (
    <Card className="p-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="year">보고 연도 *</Label>
            <Input id="year" name="year" type="number" defaultValue={year} readOnly={lockPeriod} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="round">보고 회차 *</Label>
            <select
              id="round"
              name="round"
              defaultValue={round}
              disabled={lockPeriod}
              className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px] disabled:opacity-60"
            >
              {rounds.map((r) => (
                <option key={r} value={r}>
                  {r}월
                </option>
              ))}
            </select>
            {lockPeriod && <input type="hidden" name="round" value={round} />}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">사업명 *</Label>
          <Input id="name" name="name" required defaultValue={d.name ?? ""} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Sel name="departmentId" label="부서" options={departments} def={d.departmentId} />
          <Sel name="teamId" label="팀" options={teams} def={d.teamId} />
          <Sel name="townId" label="사업위치(읍면)" options={towns} def={d.townId} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetThousand">사업비(천원)</Label>
            <Input id="budgetThousand" name="budgetThousand" type="number" defaultValue={d.budgetThousand ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="periodText">사업기간</Label>
            <Input id="periodText" name="periodText" placeholder="예) 2026.01~2026.12" defaultValue={d.periodText ?? ""} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="locationText">사업위치(상세)</Label>
          <Input id="locationText" name="locationText" defaultValue={d.locationText ?? ""} />
        </div>

        <Area name="goal" label="목표 및 방향성" def={d.goal} />
        <Area name="content" label="사업내용" def={d.content} />
        <Area name="progress" label="추진현황" def={d.progress} />
        <Area name="futurePlan" label="향후계획" def={d.futurePlan} />
        <Area name="problem" label="문제점 및 해결방안" def={d.problem} />
        <Area name="effect" label="기대효과" def={d.effect} />
        <Area name="refs" label="참고자료(위치도·현장사진 설명/링크)" def={d.refs} />

        {state?.error && (
          <p className="text-[13px] tracking-[-0.14px] text-destructive">{state.error}</p>
        )}
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
