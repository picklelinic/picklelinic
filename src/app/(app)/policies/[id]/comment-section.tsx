"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import type { UserRole } from "@/lib/rbac";
import { addComment, deleteComment } from "../actions";

type Comment = {
  id: number;
  body: string;
  createdAt: Date;
  authorId: number | null;
  author: string | null;
};

export function CommentSection({
  policyId,
  comments,
  currentUserId,
  role,
}: {
  policyId: number;
  comments: Comment[];
  currentUserId: number;
  role?: UserRole;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card>
      <h3 className="font-display text-[18px] font-bold tracking-[-0.4px] text-deep-space-charcoal">
        의견 ({comments.length})
      </h3>

      <form
        ref={formRef}
        action={async (fd) => {
          await addComment(policyId, fd);
          formRef.current?.reset();
        }}
        className="flex flex-col gap-2"
      >
        <Textarea name="body" rows={3} placeholder="이 정책에 대한 의견을 남겨주세요" required />
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            의견 등록
          </Button>
        </div>
      </form>

      <div className="flex flex-col divide-y divide-border">
        {comments.length === 0 ? (
          <p className="py-3 text-[14px] text-muted-foreground">아직 의견이 없습니다.</p>
        ) : (
          comments.map((c) => {
            const canDelete =
              c.authorId === currentUserId || role === "manager" || role === "admin";
            return (
              <div key={c.id} className="flex flex-col gap-1 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium tracking-[-0.14px] text-foreground">
                    {c.author ?? "(탈퇴)"}
                    <span className="ml-2 font-normal text-smoke-gray">
                      {formatDate(c.createdAt)}
                    </span>
                  </span>
                  {canDelete && (
                    <form action={deleteComment.bind(null, c.id, policyId)}>
                      <button
                        type="submit"
                        className="text-[12px] text-smoke-gray hover:text-destructive"
                      >
                        삭제
                      </button>
                    </form>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-[14px] tracking-[-0.15px] text-foreground">
                  {c.body}
                </p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
