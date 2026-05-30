import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { uploadAttachment, deleteAttachment } from "@/lib/attachments";

/* 첨부 자료 섹션 — 이미지 미리보기(F14-02) + 항목별 연결(F14-03) */
export async function Attachments({
  entity,
  entityId,
  canEdit,
}: {
  entity: string;
  entityId: number;
  canEdit: boolean;
}) {
  const rows = await db
    .select()
    .from(attachments)
    .where(and(eq(attachments.entity, entity), eq(attachments.entityId, entityId)))
    .orderBy(desc(attachments.createdAt));

  return (
    <Card>
      <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">
        참고자료 · 첨부 ({rows.length})
      </h3>

      {canEdit && (
        <form action={uploadAttachment.bind(null, entity, entityId)} className="no-print flex flex-col gap-2">
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf"
            required
            className="text-[13px] file:mr-2 file:rounded-[var(--radius-buttons)] file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
          />
          <div className="flex gap-2">
            <input
              name="caption"
              placeholder="설명(예: 위치도, 현장사진)"
              className="h-8 flex-1 rounded-[var(--radius-buttons)] border border-input px-3 text-[13px]"
            />
            <button type="submit" className="h-8 rounded-[var(--radius-buttons)] bg-primary px-3 text-[13px] text-primary-foreground">
              업로드
            </button>
          </div>
          <p className="text-[12px] text-smoke-gray">JPG·PNG·WEBP·GIF·PDF, 최대 10MB</p>
        </form>
      )}

      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rows.map((a) => {
            const isImage = a.mimeType.startsWith("image/");
            return (
              <div key={a.id} className="flex flex-col gap-1">
                <a href={`/uploads/${a.storedName}`} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[var(--radius-buttons)] border border-border">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/uploads/${a.storedName}`} alt={a.caption ?? a.filename} className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-hint-of-sky text-[13px] text-muted-foreground">
                      PDF 문서
                    </div>
                  )}
                </a>
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[12px] text-muted-foreground" title={a.filename}>
                    {a.caption || a.filename}
                  </span>
                  {canEdit && (
                    <form action={deleteAttachment.bind(null, a.id, entity, entityId)} className="no-print">
                      <button type="submit" className="shrink-0 text-[11px] text-smoke-gray hover:text-destructive">삭제</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
