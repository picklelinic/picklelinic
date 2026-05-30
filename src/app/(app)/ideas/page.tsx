import Link from "next/link";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ideas, ideaVotes, codes, users, type IdeaStatus } from "@/db/schema";
import { auth } from "@/auth";
import { getCodes } from "@/lib/codes";
import { IDEA_STATUS_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoteButton } from "./vote-button";

export const dynamic = "force-dynamic";

type SP = Promise<{ field?: string; status?: string; sort?: string }>;

export default async function IdeasPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const session = await auth();
  const userId = Number(session?.user.id);

  const conds: SQL[] = [];
  if (sp.field) conds.push(eq(ideas.fieldId, Number(sp.field)));
  if (sp.status && ["proposed", "reviewing", "adopted", "rejected"].includes(sp.status)) {
    conds.push(eq(ideas.status, sp.status as IdeaStatus));
  }
  const orderBy = sp.sort === "new" ? desc(ideas.createdAt) : desc(ideas.voteCount);

  const [rows, fields] = await Promise.all([
    db
      .select({
        id: ideas.id,
        title: ideas.title,
        body: ideas.body,
        status: ideas.status,
        voteCount: ideas.voteCount,
        field: codes.label,
        author: users.name,
        createdAt: ideas.createdAt,
      })
      .from(ideas)
      .leftJoin(codes, eq(ideas.fieldId, codes.id))
      .leftJoin(users, eq(ideas.authorId, users.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(orderBy)
      .limit(200),
    getCodes("field"),
  ]);

  // 내가 추천한 제안 id 집합
  const ids = rows.map((r) => r.id);
  const myVotes = ids.length
    ? await db
        .select({ ideaId: ideaVotes.ideaId })
        .from(ideaVotes)
        .where(and(eq(ideaVotes.userId, userId), inArray(ideaVotes.ideaId, ids)))
    : [];
  const votedSet = new Set(myVotes.map((v) => v.ideaId));

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="의견 · 사업제안"
          description="분야별 사업 아이디어를 제안하고 추천으로 우선순위를 모읍니다"
        />
        <Button asChild>
          <Link href="/ideas/new">+ 제안 등록</Link>
        </Button>
      </div>

      <Card className="mb-4">
        <form className="flex flex-wrap items-center gap-3" method="get">
          <select
            name="field"
            defaultValue={sp.field ?? ""}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="">전체 분야</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="">전체 상태</option>
            <option value="proposed">제안됨</option>
            <option value="reviewing">검토중</option>
            <option value="adopted">채택</option>
            <option value="rejected">반려</option>
          </select>
          <select
            name="sort"
            defaultValue={sp.sort ?? "votes"}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="votes">추천순</option>
            <option value="new">최신순</option>
          </select>
          <Button type="submit" size="sm">
            적용
          </Button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <p className="text-[14px] text-muted-foreground">아직 제안이 없습니다.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <Card key={r.id} className="flex-row items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={r.status === "adopted" ? "active" : "muted"}>
                    {IDEA_STATUS_LABELS[r.status]}
                  </Badge>
                  {r.field && <Badge variant="outline">{r.field}</Badge>}
                </div>
                <Link href={`/ideas/${r.id}`}>
                  <h3 className="font-display text-[18px] font-bold tracking-[-0.4px] text-deep-space-charcoal hover:text-deep-violet">
                    {r.title}
                  </h3>
                </Link>
                <p className="line-clamp-2 text-[14px] tracking-[-0.15px] text-muted-foreground">
                  {r.body}
                </p>
                <span className="text-[12px] tracking-[-0.14px] text-smoke-gray">
                  {r.author ?? "(탈퇴)"}
                </span>
              </div>
              <div className="shrink-0">
                <VoteButton ideaId={r.id} count={r.voteCount} voted={votedSet.has(r.id)} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
