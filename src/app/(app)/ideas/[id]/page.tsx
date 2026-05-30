import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ideas, ideaVotes, codes, users } from "@/db/schema";
import { auth } from "@/auth";
import { IDEA_STATUS_LABELS, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteButton } from "../vote-button";
import { StatusControl } from "./status-control";

export const dynamic = "force-dynamic";




export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ideaId = Number(id);
  if (Number.isNaN(ideaId)) notFound();
  const session = await auth();
  const userId = Number(session?.user.id);
  const role = session?.user.role;

  const [row] = await db
    .select({
      i: ideas,
      field: codes.label,
      author: users.name,
    })
    .from(ideas)
    .leftJoin(codes, eq(ideas.fieldId, codes.id))
    .leftJoin(users, eq(ideas.authorId, users.id))
    .where(eq(ideas.id, ideaId))
    .limit(1);
  if (!row) notFound();
  const i = row.i;

  // 사업유형 라벨 별도 조회 (동일 codes 테이블)
  const typeLabel = i.projectTypeId
    ? (await db.select({ label: codes.label }).from(codes).where(eq(codes.id, i.projectTypeId)).limit(1))[0]?.label
    : null;

  const [voted] = await db
    .select({ id: ideaVotes.id })
    .from(ideaVotes)
    .where(and(eq(ideaVotes.ideaId, ideaId), eq(ideaVotes.userId, userId)))
    .limit(1);

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <PageHeader title={i.title} />
        <Button asChild variant="outline" size="sm">
          <Link href="/ideas">목록</Link>
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={i.status === "adopted" ? "active" : "muted"}>
              {IDEA_STATUS_LABELS[i.status]}
            </Badge>
            {row.field && <Badge variant="outline">{row.field}</Badge>}
            {typeLabel && <Badge variant="outline">{typeLabel}</Badge>}
          </div>
          <VoteButton ideaId={i.id} count={i.voteCount} voted={!!voted} />
        </div>

        <CardContent className="flex flex-col gap-4">
          <div>
            <h4 className="mb-1 text-[13px] font-medium text-muted-foreground">제안 내용</h4>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-[-0.2px] text-foreground">
              {i.body}
            </p>
          </div>
          {i.expectedEffect && (
            <div>
              <h4 className="mb-1 text-[13px] font-medium text-muted-foreground">기대효과</h4>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-[-0.2px] text-foreground">
                {i.expectedEffect}
              </p>
            </div>
          )}
          <div className="text-[12px] tracking-[-0.14px] text-smoke-gray">
            {row.author ?? "(탈퇴)"} · {formatDate(i.createdAt)}
          </div>
        </CardContent>
      </Card>

      {(role === "manager" || role === "admin") && (
        <Card className="mt-3">
          <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">
            검토 상태 변경 (중간관리자+)
          </h3>
          <StatusControl ideaId={i.id} current={i.status} />
        </Card>
      )}
    </div>
  );
}
