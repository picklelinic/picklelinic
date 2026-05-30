import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { majorTasks, majorTaskReports, departments, teams, towns } from "@/db/schema";
import { auth } from "@/auth";
import { ROUND_LABEL, prevRound } from "@/lib/period";
import { formatBudgetThousand } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTaskButton } from "./delete-button";

export const dynamic = "force-dynamic";

type SP = Promise<{ report?: string }>;

export default async function MajorTaskDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) notFound();
  const session = await auth();
  const role = session?.user.role;

  const [task] = await db
    .select({
      t: majorTasks,
      dept: departments.name,
      team: teams.name,
      town: towns.name,
    })
    .from(majorTasks)
    .leftJoin(departments, eq(majorTasks.departmentId, departments.id))
    .leftJoin(teams, eq(majorTasks.teamId, teams.id))
    .leftJoin(towns, eq(majorTasks.townId, towns.id))
    .where(eq(majorTasks.id, taskId))
    .limit(1);
  if (!task) notFound();

  const reports = await db
    .select()
    .from(majorTaskReports)
    .where(eq(majorTaskReports.taskId, taskId))
    .orderBy(desc(majorTaskReports.year), desc(majorTaskReports.round));

  if (reports.length === 0) notFound();

  // 선택 회차 (기본: 최신)
  const selectedId = sp.report ? Number(sp.report) : reports[0].id;
  const current = reports.find((r) => r.id === selectedId) ?? reports[0];

  // 직전 회차 조회 (향후계획 대비 추적)
  const pv = prevRound(current.year, current.round);
  const [previous] = await db
    .select()
    .from(majorTaskReports)
    .where(
      and(
        eq(majorTaskReports.taskId, taskId),
        eq(majorTaskReports.year, pv.year),
        eq(majorTaskReports.round, pv.round),
      ),
    )
    .limit(1);

  const canEdit = role === "admin" || role === "manager" || task.t.createdBy === Number(session?.user.id);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <PageHeader title={task.t.name} description={`${task.dept ?? ""} ${task.team ?? ""}`.trim()} />
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/major-tasks">목록</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/major-tasks/${taskId}/report`}>+ 회차 보고 추가</Link>
          </Button>
          {canEdit && <DeleteTaskButton id={taskId} />}
        </div>
      </div>

      {/* 회차 선택 탭 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {reports.map((r) => (
          <Link key={r.id} href={`/major-tasks/${taskId}?report=${r.id}`}>
            <Badge variant={r.id === current.id ? "active" : "outline"}>
              {r.year} {ROUND_LABEL[r.round] ?? `${r.round}월`}
            </Badge>
          </Link>
        ))}
      </div>

      {/* 향후계획 대비 변경 추적 */}
      {previous && (
        <Card className="mb-4 border-deep-violet/30 bg-accent/30">
          <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">
            향후계획 대비 추진 변화 ({previous.year} {ROUND_LABEL[previous.round]} → {current.year} {ROUND_LABEL[current.round]})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-[13px] font-medium text-muted-foreground">직전 회차 「향후계획」</p>
              <p className="whitespace-pre-wrap rounded-[var(--radius-buttons)] bg-canvas-white p-3 text-[14px] text-foreground">
                {previous.futurePlan || "-"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-medium text-muted-foreground">이번 회차 「추진현황」</p>
              <p className="whitespace-pre-wrap rounded-[var(--radius-buttons)] bg-canvas-white p-3 text-[14px] text-foreground">
                {current.progress || "-"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 13개 항목 상세 */}
      <Card>
        <div className="flex items-center justify-between">
          <Badge variant="muted">{current.year} {ROUND_LABEL[current.round] ?? `${current.round}월`} 보고</Badge>
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/major-tasks/${taskId}/report?year=${current.year}&round=${current.round}`}>
                이 회차 수정
              </Link>
            </Button>
          )}
        </div>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="부서 / 팀" value={`${task.dept ?? "-"} / ${task.team ?? "-"}`} />
          <Field label="사업위치" value={current.locationText || task.town || "-"} />
          <Field label="사업비" value={formatBudgetThousand(current.budgetThousand)} />
          <Field label="사업기간" value={current.periodText || "-"} />
          <Field label="목표 및 방향성" value={current.goal} wide />
          <Field label="사업내용" value={current.content} wide />
          <Field label="추진현황" value={current.progress} wide />
          <Field label="향후계획" value={current.futurePlan} wide />
          <Field label="문제점 및 해결방안" value={current.problem} wide />
          <Field label="기대효과" value={current.effect} wide />
          <Field label="참고자료" value={current.refs} wide />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <p className="mb-1 text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap text-[14px] tracking-[-0.15px] text-foreground">{value || "-"}</p>
    </div>
  );
}
