"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PolicyFormState } from "./actions";

type Option = { id: number; label: string };

// 폼에서 쓰는 필드만 로컬 정의 (클라이언트 → @/db/schema 미import)
type Policy = {
  title: string;
  status: "draft" | "active";
  summary: string | null;
  content: string | null;
  fieldId: number | null;
  projectTypeId: number | null;
  departmentId: number | null;
  townId: number | null;
  budgetThousand: number | null;
  startDate: string | null;
  endDate: string | null;
};

/* 네이티브 select 사용 — 서버 액션 FormData 와 자연스럽게 연동 */
function FieldSelect({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: number | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="flex h-9 w-full rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px] tracking-[-0.15px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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

export function PolicyForm({
  action,
  policy,
  fields,
  projectTypes,
  departments,
  towns,
}: {
  action: (state: PolicyFormState, formData: FormData) => Promise<PolicyFormState>;
  policy?: Policy;
  fields: Option[];
  projectTypes: Option[];
  departments: Option[];
  towns: Option[];
}) {
  const [state, formAction, pending] = useActionState<PolicyFormState, FormData>(action, undefined);

  return (
    <Card className="p-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">정책명 *</Label>
          <Input id="title" name="title" required defaultValue={policy?.title ?? ""} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">상태 *</Label>
            <select
              id="status"
              name="status"
              defaultValue={policy?.status ?? "draft"}
              className="flex h-9 w-full rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px] tracking-[-0.15px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="draft">구상</option>
              <option value="active">시행</option>
            </select>
          </div>
          <FieldSelect name="fieldId" label="분야" options={fields} defaultValue={policy?.fieldId} />
          <FieldSelect
            name="projectTypeId"
            label="사업 유형"
            options={projectTypes}
            defaultValue={policy?.projectTypeId}
          />
          <FieldSelect
            name="departmentId"
            label="담당 부서"
            options={departments}
            defaultValue={policy?.departmentId}
          />
          <FieldSelect name="townId" label="지역(읍면)" options={towns} defaultValue={policy?.townId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="budgetThousand">사업비 (천원)</Label>
            <Input
              id="budgetThousand"
              name="budgetThousand"
              type="number"
              min="0"
              defaultValue={policy?.budgetThousand ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">시작일</Label>
            <Input id="startDate" name="startDate" type="date" defaultValue={policy?.startDate ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate">종료일</Label>
            <Input id="endDate" name="endDate" type="date" defaultValue={policy?.endDate ?? ""} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="summary">요약</Label>
          <Input id="summary" name="summary" defaultValue={policy?.summary ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="content">상세 내용</Label>
          <Textarea id="content" name="content" rows={8} defaultValue={policy?.content ?? ""} />
        </div>

        {state?.error && (
          <p className="text-[13px] tracking-[-0.14px] text-destructive">{state.error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중..." : policy ? "수정 저장" : "등록"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
