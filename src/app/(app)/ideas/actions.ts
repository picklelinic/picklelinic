"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { ideas, ideaVotes } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().int().nullable(),
);
const optionalStr = z.preprocess(
  (v) => (v === "" || v == null ? null : String(v)),
  z.string().nullable(),
);

const ideaSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(200),
  body: z.string().min(1, "내용을 입력하세요"),
  fieldId: optionalInt,
  projectTypeId: optionalInt,
  expectedEffect: optionalStr,
});

export type IdeaFormState = { error?: string } | undefined;

export async function createIdea(
  _prev: IdeaFormState,
  formData: FormData,
): Promise<IdeaFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };

  const parsed = ideaSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    fieldId: formData.get("fieldId"),
    projectTypeId: formData.get("projectTypeId"),
    expectedEffect: formData.get("expectedEffect"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const authorId = Number(session.user.id);
  const [created] = await db
    .insert(ideas)
    .values({ ...parsed.data, authorId })
    .returning({ id: ideas.id });
  await audit({ userId: authorId, action: "create", entity: "idea", entityId: created.id });

  revalidatePath("/ideas");
  redirect(`/ideas/${created.id}`);
}

/** 추천 토글 (사용자별 1회). 추천수는 denormalized 컬럼에 반영. */
export async function toggleVote(ideaId: number): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const userId = Number(session.user.id);

  const [existing] = await db
    .select({ id: ideaVotes.id })
    .from(ideaVotes)
    .where(and(eq(ideaVotes.ideaId, ideaId), eq(ideaVotes.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(ideaVotes).where(eq(ideaVotes.id, existing.id));
    await db
      .update(ideas)
      .set({ voteCount: sql`GREATEST(${ideas.voteCount} - 1, 0)` })
      .where(eq(ideas.id, ideaId));
  } else {
    await db.insert(ideaVotes).values({ ideaId, userId }).onConflictDoNothing();
    await db
      .update(ideas)
      .set({ voteCount: sql`${ideas.voteCount} + 1` })
      .where(eq(ideas.id, ideaId));
  }
  revalidatePath("/ideas");
  revalidatePath(`/ideas/${ideaId}`);
}

const VALID_STATUS = ["proposed", "reviewing", "adopted", "rejected"] as const;

/** 검토 상태 변경 (중간관리자 이상) */
export async function setIdeaStatus(ideaId: number, status: string): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!(role === "manager" || role === "admin")) return;
  if (!VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])) return;
  await db
    .update(ideas)
    .set({ status: status as (typeof VALID_STATUS)[number], updatedAt: new Date() })
    .where(eq(ideas.id, ideaId));
  await audit({ userId: Number(session!.user.id), action: "update", entity: "idea", entityId: ideaId });
  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/ideas");
}
