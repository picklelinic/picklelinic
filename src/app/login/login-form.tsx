"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    authenticate,
    undefined,
  );

  return (
    <Card className="p-6 gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">아이디</Label>
          <Input id="username" name="username" autoComplete="username" required autoFocus />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error && (
          <p className="text-[13px] tracking-[-0.14px] text-destructive">{state.error}</p>
        )}
        <Button type="submit" size="lg" disabled={pending} className="mt-1">
          {pending ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </Card>
  );
}
