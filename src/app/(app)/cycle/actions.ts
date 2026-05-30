"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cycleItems, cycleReports } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const optInt = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().nullable());
const optStr = z.preprocess((v) => (v === "" || v == null ? null : String(v)), z.string().nullable());

const schema = z.object({
  name: z.string().min(1, "사업명을 입력하세요").max(200),
  departmentId: optInt,
  teamId: optInt,
  townId: optInt,
  fieldId: optInt,
  fundSourceId: optInt,
  budgetThousand: optInt,
  startYear: optInt,
  endYear: optInt,
  isKeyPolicy: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  year: z.coerce.number().int(),
  quarter: z.coerce.number().int(),
  content: optStr,
  progress: optStr,
  futurePlan: optStr,
  executedThousand: optInt,
  note: optStr,
});

function parse(fd: FormData) {
  return schema.safeParse(Object.fromEntries(fd));
}

export type CycleFormState = { error?: string } | undefined;

export async function createCycleItem(_p: CycleFormState, fd: FormData): Promise<CycleFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  const d = parsed.data;
  const uid = Number(session.user.id);

  const [item] = await db
    .insert(cycleItems)
    .values({
      name: d.name,
      departmentId: d.departmentId,
      teamId: d.teamId,
      townId: d.townId,
      fieldId: d.fieldId,
      fundSourceId: d.fundSourceId,
      budgetThousand: d.budgetThousand,
      startYear: d.startYear,
      endYear: d.endYear,
      isKeyPolicy: d.isKeyPolicy,
      createdBy: uid,
    })
    .returning({ id: cycleItems.id });

  await db.insert(cycleReports).values({
    itemId: item.id,
    year: d.year,
    quarter: d.quarter,
    content: d.content,
    progress: d.progress,
    futurePlan: d.futurePlan,
    budgetThousand: d.budgetThousand,
    executedThousand: d.executedThousand,
    note: d.note,
    createdBy: uid,
  });
  await audit({ userId: uid, action: "create", entity: "cycle_item", entityId: item.id });

  revalidatePath("/cycle");
  redirect(`/cycle/${item.id}`);
}

export async function upsertCycleReport(itemId: number, _p: CycleFormState, fd: FormData): Promise<CycleFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  const d = parsed.data;
  const uid = Number(session.user.id);

  const values = {
    content: d.content,
    progress: d.progress,
    futurePlan: d.futurePlan,
    budgetThousand: d.budgetThousand,
    executedThousand: d.executedThousand,
    note: d.note,
    createdBy: uid,
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: cycleReports.id })
    .from(cycleReports)
    .where(and(eq(cycleReports.itemId, itemId), eq(cycleReports.year, d.year), eq(cycleReports.quarter, d.quarter)))
    .limit(1);

  if (existing) {
    await db.update(cycleReports).set(values).where(eq(cycleReports.id, existing.id));
  } else {
    await db.insert(cycleReports).values({ itemId, year: d.year, quarter: d.quarter, ...values });
  }

  await db
    .update(cycleItems)
    .set({
      name: d.name,
      departmentId: d.departmentId,
      teamId: d.teamId,
      townId: d.townId,
      fieldId: d.fieldId,
      fundSourceId: d.fundSourceId,
      budgetThousand: d.budgetThousand,
      startYear: d.startYear,
      endYear: d.endYear,
      isKeyPolicy: d.isKeyPolicy,
      updatedAt: new Date(),
    })
    .where(eq(cycleItems.id, itemId));
  await audit({ userId: uid, action: "update", entity: "cycle_item", entityId: itemId });

  revalidatePath(`/cycle/${itemId}`);
  redirect(`/cycle/${itemId}`);
}

/** 정책적 주요사업 토글 (중간관리자+) */
export async function toggleKeyPolicy(itemId: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const [cur] = await db.select({ k: cycleItems.isKeyPolicy }).from(cycleItems).where(eq(cycleItems.id, itemId)).limit(1);
  if (!cur) return;
  await db.update(cycleItems).set({ isKeyPolicy: !cur.k, updatedAt: new Date() }).where(eq(cycleItems.id, itemId));
  await audit({ userId: Number(session!.user.id), action: "update", entity: "cycle_item", entityId: itemId });
  revalidatePath(`/cycle/${itemId}`);
  revalidatePath("/cycle");
  revalidatePath("/cycle/key");
}

export async function deleteCycleItem(id: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  await db.delete(cycleItems).where(eq(cycleItems.id, id));
  await audit({ userId: Number(session!.user.id), action: "delete", entity: "cycle_item", entityId: id });
  revalidatePath("/cycle");
  redirect("/cycle");
}
