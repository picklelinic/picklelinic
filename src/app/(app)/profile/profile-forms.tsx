"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, changePassword, type ProfileState } from "./actions";

function Msg({ state }: { state: ProfileState }) {
  if (!state) return null;
  if (state.error) return <p className="text-[13px] tracking-[-0.14px] text-destructive">{state.error}</p>;
  if (state.ok) return <p className="text-[13px] tracking-[-0.14px] text-deep-violet">{state.ok}</p>;
  return null;
}

export function ProfileForm({ name, email, username }: { name: string; email: string; username: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, undefined);
  return (
    <Card className="p-6">
      <h3 className="font-display text-[18px] font-bold tracking-[-0.4px] text-deep-space-charcoal">내 정보</h3>
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>아이디</Label>
          <Input value={username} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">이름</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" name="email" type="email" defaultValue={email} />
        </div>
        <Msg state={state} />
        <div><Button type="submit" disabled={pending}>{pending ? "저장 중..." : "정보 저장"}</Button></div>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(changePassword, undefined);
  return (
    <Card className="p-6">
      <h3 className="font-display text-[18px] font-bold tracking-[-0.4px] text-deep-space-charcoal">비밀번호 변경</h3>
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="current">현재 비밀번호</Label>
          <Input id="current" name="current" type="password" autoComplete="current-password" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="next">새 비밀번호 (8자 이상)</Label>
          <Input id="next" name="next" type="password" autoComplete="new-password" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">새 비밀번호 확인</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </div>
        <Msg state={state} />
        <div><Button type="submit" disabled={pending}>{pending ? "변경 중..." : "비밀번호 변경"}</Button></div>
      </form>
    </Card>
  );
}
