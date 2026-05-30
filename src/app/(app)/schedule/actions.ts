"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { auth } from "@/auth";

const schema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(30),
  dueDate: z.string().min(1),
  note: z.preprocess((v) => (v === "" || v == null ? null : String(v)), z.string().nullable()),
});

export async function createSchedule(fd: FormData): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  await db.insert(schedules).values(parsed.data);
  revalidatePath("/schedule");
  revalidatePath("/");
}

export async function deleteSchedule(id: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  await db.delete(schedules).where(eq(schedules.id, id));
  revalidatePath("/schedule");
}
