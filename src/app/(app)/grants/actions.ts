"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { grants } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const optInt = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().nullable());
const optStr = z.preprocess((v) => (v === "" || v == null ? null : String(v)), z.string().nullable());

const schema = z.object({
  name: z.string().min(1, "사업명을 입력하세요").max(300),
  agency: optStr,
  departmentId: optInt,
  fieldId: optInt,
  stage: z.enum(["applied", "selected", "rejected", "granted", "executing"]),
  requestedThousand: optInt,
  selectedThousand: optInt,
  nationalThousand: optInt,
  provincialThousand: optInt,
  countyThousand: optInt,
  investmentReview: optStr,
  periodText: optStr,
  note: optStr,
});

export async function createGrant(fd: FormData): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  const [c] = await db.insert(grants).values(parsed.data).returning({ id: grants.id });
  await audit({ userId: Number(session!.user.id), action: "create", entity: "grant", entityId: c.id });
  revalidatePath("/grants");
  redirect("/grants");
}

export async function updateGrantStage(id: number, stage: string): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const s = z.enum(["applied", "selected", "rejected", "granted", "executing"]).safeParse(stage);
  if (!s.success) return;
  await db.update(grants).set({ stage: s.data, updatedAt: new Date() }).where(eq(grants.id, id));
  await audit({ userId: Number(session!.user.id), action: "update", entity: "grant", entityId: id });
  revalidatePath("/grants");
}

export async function deleteGrant(id: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  await db.delete(grants).where(eq(grants.id, id));
  revalidatePath("/grants");
}
