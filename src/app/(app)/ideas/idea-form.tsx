"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIdea, type IdeaFormState } from "./actions";

type Option = { id: number; label: string };

export function IdeaForm({
  fields,
  projectTypes,
}: {
  fields: Option[];
  projectTypes: Option[];
}) {
  const [state, formAction, pending] = useActionState<IdeaFormState, FormData>(
    createIdea,
    undefined,
  );

  return (
    <Card className="p-6">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">제안 제목 *</Label>
          <Input id="title" name="title" required placeholder="예) 장항읍 청년 창업 지원센터 조성" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fieldId">분야</Label>
            <select
              id="fieldId"
              name="fieldId"
              className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
            >
              <option value="">선택 안 함</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="projectTypeId">사업 유형</Label>
            <select
              id="projectTypeId"
              name="projectTypeId"
              className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
            >
              <option value="">선택 안 함</option>
              {projectTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">제안 내용 *</Label>
          <Textarea id="body" name="body" rows={6} required placeholder="어떤 분야에 어떤 사업이 필요한지 구체적으로 작성해주세요" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="expectedEffect">기대효과</Label>
          <Textarea id="expectedEffect" name="expectedEffect" rows={3} />
        </div>
        {state?.error && (
          <p className="text-[13px] tracking-[-0.14px] text-destructive">{state.error}</p>
        )}
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "등록 중..." : "제안 등록"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
