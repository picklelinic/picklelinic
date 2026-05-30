"use server";

import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function pathFor(entity: string, entityId: number): string {
  const seg = entity === "policy" ? "policies" : entity === "cycle_item" ? "cycle" : "major-tasks";
  return `/${seg}/${entityId}`;
}

/** 첨부 업로드 (위치도·현장사진 등) */
export async function uploadAttachment(entity: string, entityId: number, fd: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  if (!ALLOWED.includes(file.type)) return;
  if (file.size > MAX_BYTES) return;

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const storedName = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, storedName), bytes);

  await db.insert(attachments).values({
    entity,
    entityId,
    filename: file.name,
    storedName,
    mimeType: file.type,
    sizeBytes: file.size,
    caption: (fd.get("caption") as string) || null,
    uploadedBy: Number(session.user.id),
  });
  await audit({ userId: Number(session.user.id), action: "create", entity: "attachment", entityId });
  revalidatePath(pathFor(entity, entityId));
}

export async function deleteAttachment(id: number, entity: string, entityId: number): Promise<void> {
  const session = await auth();
  const role = session?.user.role;
  if (!session?.user) return;
  const [a] = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
  if (!a) return;
  const isOwner = a.uploadedBy === Number(session.user.id);
  if (!(isOwner || role === "manager" || role === "admin")) return;
  await db.delete(attachments).where(eq(attachments.id, id));
  try {
    await unlink(join(UPLOAD_DIR, a.storedName));
  } catch {
    // file already gone — ignore
  }
  revalidatePath(pathFor(entity, entityId));
}
