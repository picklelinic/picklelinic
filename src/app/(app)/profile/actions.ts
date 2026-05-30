"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

export type ProfileState = { error?: string; ok?: string } | undefined;

const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요").max(50),
  email: z.preprocess((v) => (v === "" || v == null ? null : String(v)), z.string().email("이메일 형식 오류").nullable()),
});

export async function updateProfile(_p: ProfileState, fd: FormData): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };
  const parsed = profileSchema.safeParse({ name: fd.get("name"), email: fd.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  const uid = Number(session.user.id);
  await db.update(users).set({ name: parsed.data.name, email: parsed.data.email, updatedAt: new Date() }).where(eq(users.id, uid));
  await audit({ userId: uid, action: "update", entity: "user_profile", entityId: uid });
  revalidatePath("/profile");
  return { ok: "내 정보가 저장되었습니다. (이름은 재로그인 후 상단에 반영됩니다)" };
}

const pwSchema = z
  .object({
    current: z.string().min(1, "현재 비밀번호를 입력하세요"),
    next: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "새 비밀번호가 일치하지 않습니다", path: ["confirm"] });

export async function changePassword(_p: ProfileState, fd: FormData): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };
  const parsed = pwSchema.safeParse({ current: fd.get("current"), next: fd.get("next"), confirm: fd.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };

  const uid = Number(session.user.id);
  const [u] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, uid)).limit(1);
  if (!u) return { error: "사용자를 찾을 수 없습니다." };
  const ok = await bcrypt.compare(parsed.data.current, u.hash);
  if (!ok) return { error: "현재 비밀번호가 올바르지 않습니다." };

  const newHash = await bcrypt.hash(parsed.data.next, 10);
  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, uid));
  await audit({ userId: uid, action: "update", entity: "user_password", entityId: uid });
  return { ok: "비밀번호가 변경되었습니다." };
}
