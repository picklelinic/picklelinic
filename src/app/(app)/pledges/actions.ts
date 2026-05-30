"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pledges } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const optInt = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().nullable());
const optStr = z.preprocess((v) => (v === "" || v == null ? null : String(v)), z.string().nullable());

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(300),
  level: z.coerce.number().int().min(1).max(3),
  parentId: optInt,
  departmentId: optInt,
  status: z.enum(["normal", "partial", "delayed", "completed", "changed"]),
  progressPct: z.coerce.number().int().min(0).max(100),
  note: optStr,
});

export async function createPledge(fd: FormData): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  const [created] = await db.insert(pledges).values(parsed.data).returning({ id: pledges.id });
  await audit({ userId: Number(session!.user.id), action: "create", entity: "pledge", entityId: created.id });
  revalidatePath("/pledges");
  redirect("/pledges");
}

export async function updatePledgeProgress(id: number, status: string, progressPct: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const s = z.enum(["normal", "partial", "delayed", "completed", "changed"]).safeParse(status);
  if (!s.success) return;
  await db
    .update(pledges)
    .set({ status: s.data, progressPct: Math.max(0, Math.min(100, progressPct)), updatedAt: new Date() })
    .where(eq(pledges.id, id));
  await audit({ userId: Number(session!.user.id), action: "update", entity: "pledge", entityId: id });
  revalidatePath("/pledges");
}

export async function deletePledge(id: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  await db.delete(pledges).where(eq(pledges.id, id));
  revalidatePath("/pledges");
}
