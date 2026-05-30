"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { kpis } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const optInt = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().nullable());
const optStr = z.preprocess((v) => (v === "" || v == null ? null : String(v)), z.string().nullable());

const schema = z.object({
  name: z.string().min(1, "지표명을 입력하세요").max(300),
  departmentId: optInt,
  fieldId: optInt,
  year: z.coerce.number().int(),
  unit: optStr,
  targetValue: optInt,
  actualValue: optInt,
  note: optStr,
});

export async function createKpi(fd: FormData): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  const [c] = await db.insert(kpis).values(parsed.data).returning({ id: kpis.id });
  await audit({ userId: Number(session!.user.id), action: "create", entity: "kpi", entityId: c.id });
  revalidatePath("/performance");
  redirect("/performance");
}

export async function updateKpiActual(id: number, actualValue: number): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  await db.update(kpis).set({ actualValue, updatedAt: new Date() }).where(eq(kpis.id, id));
  revalidatePath("/performance");
}

export async function deleteKpi(id: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  await db.delete(kpis).where(eq(kpis.id, id));
  revalidatePath("/performance");
}
