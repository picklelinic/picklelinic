"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { majorTasks, majorTaskReports } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const optInt = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().nullable(),
);
const optStr = z.preprocess(
  (v) => (v === "" || v == null ? null : String(v)),
  z.string().nullable(),
);

const schema = z.object({
  name: z.string().min(1, "사업명을 입력하세요").max(200),
  departmentId: optInt,
  teamId: optInt,
  townId: optInt,
  year: z.coerce.number().int(),
  round: z.coerce.number().int(),
  goal: optStr,
  budgetThousand: optInt,
  periodText: optStr,
  locationText: optStr,
  content: optStr,
  progress: optStr,
  futurePlan: optStr,
  problem: optStr,
  effect: optStr,
  refs: optStr,
});

function parse(fd: FormData) {
  return schema.safeParse(Object.fromEntries(fd));
}

export type MajorTaskFormState = { error?: string } | undefined;

/** 신규 사업 + 첫 회차 보고 동시 등록 */
export async function createMajorTask(
  _prev: MajorTaskFormState,
  fd: FormData,
): Promise<MajorTaskFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  const d = parsed.data;
  const uid = Number(session.user.id);

  const [task] = await db
    .insert(majorTasks)
    .values({
      name: d.name,
      departmentId: d.departmentId,
      teamId: d.teamId,
      townId: d.townId,
      createdBy: uid,
    })
    .returning({ id: majorTasks.id });

  await db.insert(majorTaskReports).values({
    taskId: task.id,
    year: d.year,
    round: d.round,
    goal: d.goal,
    budgetThousand: d.budgetThousand,
    periodText: d.periodText,
    locationText: d.locationText,
    content: d.content,
    progress: d.progress,
    futurePlan: d.futurePlan,
    problem: d.problem,
    effect: d.effect,
    refs: d.refs,
    createdBy: uid,
  });
  await audit({ userId: uid, action: "create", entity: "major_task", entityId: task.id });

  revalidatePath("/major-tasks");
  redirect(`/major-tasks/${task.id}`);
}

/** 기존 사업에 회차 보고 추가/수정 (upsert by year+round) */
export async function upsertReport(
  taskId: number,
  _prev: MajorTaskFormState,
  fd: FormData,
): Promise<MajorTaskFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "입력값 확인" };
  const d = parsed.data;
  const uid = Number(session.user.id);

  const values = {
    goal: d.goal,
    budgetThousand: d.budgetThousand,
    periodText: d.periodText,
    locationText: d.locationText,
    content: d.content,
    progress: d.progress,
    futurePlan: d.futurePlan,
    problem: d.problem,
    effect: d.effect,
    refs: d.refs,
    createdBy: uid,
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select({ id: majorTaskReports.id })
    .from(majorTaskReports)
    .where(
      and(
        eq(majorTaskReports.taskId, taskId),
        eq(majorTaskReports.year, d.year),
        eq(majorTaskReports.round, d.round),
      ),
    )
    .limit(1);

  if (existing) {
    await db.update(majorTaskReports).set(values).where(eq(majorTaskReports.id, existing.id));
  } else {
    await db
      .insert(majorTaskReports)
      .values({ taskId, year: d.year, round: d.round, ...values });
  }
  // 사업 마스터 기본정보도 갱신
  await db
    .update(majorTasks)
    .set({
      name: d.name,
      departmentId: d.departmentId,
      teamId: d.teamId,
      townId: d.townId,
      updatedAt: new Date(),
    })
    .where(eq(majorTasks.id, taskId));
  await audit({ userId: uid, action: "update", entity: "major_task", entityId: taskId });

  revalidatePath(`/major-tasks/${taskId}`);
  redirect(`/major-tasks/${taskId}`);
}

export async function deleteMajorTask(id: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  await db.delete(majorTasks).where(eq(majorTasks.id, id));
  await audit({ userId: Number(session!.user.id), action: "delete", entity: "major_task", entityId: id });
  revalidatePath("/major-tasks");
  redirect("/major-tasks");
}
