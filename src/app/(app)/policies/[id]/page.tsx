import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  policies,
  policyComments,
  policyHistory,
  codes,
  departments,
  teams,
  towns,
  users,
} from "@/db/schema";
import { auth } from "@/auth";
import { POLICY_STATUS_LABELS, formatBudgetThousand, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentSection } from "./comment-section";
import { DeletePolicyButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policyId = Number(id);
  if (Number.isNaN(policyId)) notFound();

  const session = await auth();

  const [row] = await db
    .select({
      p: policies,
      field: codes.label,
      dept: departments.name,
      team: teams.name,
      town: towns.name,
      author: users.name,
    })
    .from(policies)
    .leftJoin(codes, eq(policies.fieldId, codes.id))
    .leftJoin(departments, eq(policies.departmentId, departments.id))
    .leftJoin(teams, eq(policies.teamId, teams.id))
    .leftJoin(towns, eq(policies.townId, towns.id))
    .leftJoin(users, eq(policies.authorId, users.id))
    .where(eq(policies.id, policyId))
    .limit(1);

  if (!row) notFound();
  const p = row.p;

  const [comments, history] = await Promise.all([
    db
      .select({
        id: policyComments.id,
        body: policyComments.body,
        createdAt: policyComments.createdAt,
        authorId: policyComments.authorId,
        author: users.name,
      })
      .from(policyComments)
      .leftJoin(users, eq(policyComments.authorId, users.id))
      .where(eq(policyComments.policyId, policyId))
      .orderBy(desc(policyComments.createdAt)),
    db
      .select({
        id: policyHistory.id,
        fromStatus: policyHistory.fromStatus,
        toStatus: policyHistory.toStatus,
        note: policyHistory.note,
        createdAt: policyHistory.createdAt,
        by: users.name,
      })
      .from(policyHistory)
      .leftJoin(users, eq(policyHistory.changedBy, users.id))
      .where(eq(policyHistory.policyId, policyId))
      .orderBy(desc(policyHistory.createdAt)),
  ]);

  const role = session?.user.role;
  const canEdit =
    role === "admin" || role === "manager" || p.authorId === Number(session?.user.id);
  const currentUserId = Number(session?.user.id);

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <PageHeader title={p.title} description={p.summary ?? undefined} />
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/policies">목록</Link>
          </Button>
          {canEdit && (
            <>
              <Button asChild size="sm">
                <Link href={`/policies/${p.id}/edit`}>수정</Link>
              </Button>
              <DeletePolicyButton id={p.id} />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={p.status === "active" ? "active" : "muted"}>
                {POLICY_STATUS_LABELS[p.status]}
              </Badge>
              {row.field && <Badge variant="outline">{row.field}</Badge>}
            </div>
            <CardContent className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-[-0.2px] text-foreground">
              {p.content || "상세 내용이 없습니다."}
            </CardContent>
          </Card>

          <CommentSection
            policyId={p.id}
            comments={comments}
            currentUserId={currentUserId}
            role={role}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <dl className="flex flex-col gap-2 text-[14px] tracking-[-0.15px]">
              <Meta label="담당 부서" value={row.dept} />
              <Meta label="담당 팀" value={row.team} />
              <Meta label="지역(읍면)" value={row.town} />
              <Meta label="사업비" value={formatBudgetThousand(p.budgetThousand)} />
              <Meta
                label="사업기간"
                value={
                  p.startDate || p.endDate ? `${p.startDate ?? "?"} ~ ${p.endDate ?? "?"}` : "-"
                }
              />
              <Meta label="작성자" value={row.author} />
              <Meta label="등록일" value={formatDate(p.createdAt)} />
            </dl>
          </Card>

          <Card>
            <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">
              상태 변경 이력
            </h3>
            <CardContent className="flex flex-col gap-2">
              {history.map((h) => (
                <div key={h.id} className="text-[13px] tracking-[-0.14px] text-muted-foreground">
                  <span className="text-foreground">
                    {h.fromStatus ? `${POLICY_STATUS_LABELS[h.fromStatus]} → ` : ""}
                    {POLICY_STATUS_LABELS[h.toStatus]}
                  </span>
                  <span className="ml-2">{formatDate(h.createdAt)}</span>
                  {h.by && <span className="ml-1">· {h.by}</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value || "-"}</dd>
    </div>
  );
}
