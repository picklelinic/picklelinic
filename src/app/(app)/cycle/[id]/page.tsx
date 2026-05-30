import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cycleItems, cycleReports, departments, teams, towns, codes } from "@/db/schema";
import { auth } from "@/auth";
import { QUARTER_LABEL, prevQuarter } from "@/lib/period";
import { formatBudgetThousand } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyPolicyToggle } from "./key-toggle";
import { DeleteCycleButton } from "./delete-button";

export const dynamic = "force-dynamic";

type SP = Promise<{ report?: string }>;

export default async function CycleDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const itemId = Number(id);
  if (Number.isNaN(itemId)) notFound();
  const session = await auth();
  const role = session?.user.role;

  const [item] = await db
    .select({ it: cycleItems, dept: departments.name, team: teams.name, town: towns.name })
    .from(cycleItems)
    .leftJoin(departments, eq(cycleItems.departmentId, departments.id))
    .leftJoin(teams, eq(cycleItems.teamId, teams.id))
    .leftJoin(towns, eq(cycleItems.townId, towns.id))
    .where(eq(cycleItems.id, itemId))
    .limit(1);
  if (!item) notFound();

  const fieldLabel = item.it.fieldId
    ? (await db.select({ l: codes.label }).from(codes).where(eq(codes.id, item.it.fieldId)).limit(1))[0]?.l
    : null;

  const reports = await db
    .select()
    .from(cycleReports)
    .where(eq(cycleReports.itemId, itemId))
    .orderBy(desc(cycleReports.year), desc(cycleReports.quarter));
  if (reports.length === 0) notFound();

  const selectedId = sp.report ? Number(sp.report) : reports[0].id;
  const current = reports.find((r) => r.id === selectedId) ?? reports[0];

  const pv = prevQuarter(current.year, current.quarter);
  const [previous] = await db
    .select()
    .from(cycleReports)
    .where(and(eq(cycleReports.itemId, itemId), eq(cycleReports.year, pv.year), eq(cycleReports.quarter, pv.quarter)))
    .limit(1);

  const canEdit = role === "admin" || role === "manager" || item.it.createdBy === Number(session?.user.id);
  const canManage = role === "admin" || role === "manager";

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <PageHeader title={item.it.name} description={`${item.dept ?? ""} ${item.team ?? ""}`.trim()} />
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/cycle">목록</Link></Button>
          <Button asChild size="sm"><Link href={`/cycle/${itemId}/report`}>+ 분기 보고</Link></Button>
          {canEdit && <DeleteCycleButton id={itemId} />}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {item.it.isKeyPolicy && <Badge variant="active">★ 정책적 주요사업</Badge>}
        {fieldLabel && <Badge variant="outline">{fieldLabel}</Badge>}
        {item.it.endYear && <Badge variant="muted">종료 {item.it.endYear}년</Badge>}
        {canManage && <KeyPolicyToggle itemId={itemId} isKey={item.it.isKeyPolicy} />}
      </div>

      {/* 분기 선택 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {reports.map((r) => (
          <Link key={r.id} href={`/cycle/${itemId}?report=${r.id}`}>
            <Badge variant={r.id === current.id ? "active" : "outline"}>
              {r.year} {QUARTER_LABEL[r.quarter] ?? `${r.quarter}월`}
            </Badge>
          </Link>
        ))}
      </div>

      {previous && (
        <Card className="mb-4 border-deep-violet/30 bg-accent/30">
          <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">
            향후계획 대비 추진 변화 ({previous.year} {QUARTER_LABEL[previous.quarter]} → {current.year} {QUARTER_LABEL[current.quarter]})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-[13px] font-medium text-muted-foreground">직전 분기 「향후계획」</p>
              <p className="whitespace-pre-wrap rounded-[var(--radius-buttons)] bg-canvas-white p-3 text-[14px]">{previous.futurePlan || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-medium text-muted-foreground">이번 분기 「추진현황」</p>
              <p className="whitespace-pre-wrap rounded-[var(--radius-buttons)] bg-canvas-white p-3 text-[14px]">{current.progress || "-"}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <Badge variant="muted">{current.year} {QUARTER_LABEL[current.quarter] ?? `${current.quarter}월`} 보고</Badge>
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/cycle/${itemId}/report?year=${current.year}&quarter=${current.quarter}`}>이 분기 수정</Link>
            </Button>
          )}
        </div>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="부서 / 팀" value={`${item.dept ?? "-"} / ${item.team ?? "-"}`} />
          <Field label="읍면" value={item.town} />
          <Field label="사업비" value={formatBudgetThousand(current.budgetThousand)} />
          <Field label="집행액" value={formatBudgetThousand(current.executedThousand)} />
          <Field label="사업기간" value={`${item.it.startYear ?? "?"} ~ ${item.it.endYear ?? "?"}`} />
          <Field label="사업내용" value={current.content} wide />
          <Field label="추진현황" value={current.progress} wide />
          <Field label="향후계획" value={current.futurePlan} wide />
          <Field label="비고" value={current.note} wide />
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
