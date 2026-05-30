import { db } from "@/db";
import { auditLogs } from "@/db/schema";

/** 감사 로그 기록 (F16-01). 실패해도 본 작업을 막지 않는다. */
export async function audit(params: {
  userId?: number | null;
  action: "create" | "update" | "delete" | "login";
  entity: string;
  entityId?: string | number | null;
  detail?: unknown;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId != null ? String(params.entityId) : null,
      detail: params.detail ?? null,
    });
  } catch {
    // best-effort
  }
}
