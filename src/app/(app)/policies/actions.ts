"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { policies, policyComments, policyHistory } from "@/db/schema";
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

const policySchema = z.object({
  title: z.string().min(1, "정책명을 입력하세요").max(200),
  status: z.enum(["draft", "active"]),
  summary: optionalStr,
  content: optionalStr,
  fieldId: optionalInt,
  projectTypeId: optionalInt,
  departmentId: optionalInt,
  teamId: optionalInt,
  townId: optionalInt,
  budgetThousand: optionalInt,
  startDate: optionalStr,
  endDate: optionalStr,
});

function parse(formData: FormData) {
  return policySchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    fieldId: formData.get("fieldId"),
    projectTypeId: formData.get("projectTypeId"),
    departmentId: formData.get("departmentId"),
    teamId: formData.get("teamId"),
    townId: formData.get("townId"),
    budgetThousand: formData.get("budgetThousand"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
}

export type PolicyFormState = { error?: string } | undefined;

export async function createPolicy(
  _prev: PolicyFormState,
  formData: FormData,
): Promise<PolicyFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const authorId = Number(session.user.id);
  const [created] = await db
    .insert(policies)
    .values({ ...parsed.data, authorId })
    .returning({ id: policies.id });

  await db.insert(policyHistory).values({
    policyId: created.id,
    toStatus: parsed.data.status,
    note: "최초 등록",
    changedBy: authorId,
  });
  await audit({ userId: authorId, action: "create", entity: "policy", entityId: created.id });

  revalidatePath("/policies");
  redirect(`/policies/${created.id}`);
}

export async function updatePolicy(
  id: number,
  _prev: PolicyFormState,
  formData: FormData,
): Promise<PolicyFormState> {
  const session = await auth();
  if (!session?.user) return { error: "로그인이 필요합니다." };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const [before] = await db
    .select({ status: policies.status })
    .from(policies)
    .where(eq(policies.id, id))
    .limit(1);
  if (!before) return { error: "정책을 찾을 수 없습니다." };

  const userId = Number(session.user.id);
  await db
    .update(policies)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(policies.id, id));

  // 상태 전환 이력 (F3-04)
  if (before.status !== parsed.data.status) {
    await db.insert(policyHistory).values({
      policyId: id,
      fromStatus: before.status,
      toStatus: parsed.data.status,
      note: "상태 변경",
      changedBy: userId,
    });
  }
  await audit({ userId, action: "update", entity: "policy", entityId: id });

  revalidatePath("/policies");
  revalidatePath(`/policies/${id}`);
  redirect(`/policies/${id}`);
}

export async function deletePolicy(id: number): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  // 작성자 본인 또는 manager 이상만 삭제 (권한 매트릭스)
  const role = session.user.role;
  const [row] = await db
    .select({ authorId: policies.authorId })
    .from(policies)
    .where(eq(policies.id, id))
    .limit(1);
  if (!row) return;
  const isOwner = row.authorId === Number(session.user.id);
  if (!(isOwner || role === "manager" || role === "admin")) return;

  await db.delete(policies).where(eq(policies.id, id));
  await audit({ userId: Number(session.user.id), action: "delete", entity: "policy", entityId: id });
  revalidatePath("/policies");
  redirect("/policies");
}

export async function addComment(policyId: number, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await db.insert(policyComments).values({
    policyId,
    authorId: Number(session.user.id),
    body,
  });
  await audit({
    userId: Number(session.user.id),
    action: "create",
    entity: "policy_comment",
    entityId: policyId,
  });
  revalidatePath(`/policies/${policyId}`);
}

export async function deleteComment(commentId: number, policyId: number): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const role = session.user.role;
  const [c] = await db
    .select({ authorId: policyComments.authorId })
    .from(policyComments)
    .where(eq(policyComments.id, commentId))
    .limit(1);
  if (!c) return;
  const isOwner = c.authorId === Number(session.user.id);
  if (!(isOwner || role === "manager" || role === "admin")) return;
  await db
    .delete(policyComments)
    .where(and(eq(policyComments.id, commentId), eq(policyComments.policyId, policyId)));
  revalidatePath(`/policies/${policyId}`);
}
