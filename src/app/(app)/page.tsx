import Link from "next/link";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  cycleItems,
  cycleReports,
  policies,
  grants,
  pledges,
  schedules,
  codes,
  towns,
} from "@/db/schema";
import { currentYear } from "@/lib/period";
import { formatBudgetThousand, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getData() {
  const year = currentYear();

  const [
    policyCount,
    cycleCount,
    keyCount,
    byField,
    byTown,
    byFund,
    grantAgg,
    pledgeAgg,
    upcoming,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(policies),
    db.select({ c: sql<number>`count(*)::int` }).from(cycleItems),
    db.select({ c: sql<number>`count(*)::int` }).from(cycleItems).where(eq(cycleItems.isKeyPolicy, true)),
    // 분야별 사업비 (순기표 사업 기준)
    db
      .select({ label: codes.label, sum: sql<number>`coalesce(sum(${cycleItems.budgetThousand}),0)::int` })
      .from(cycleItems)
      .leftJoin(codes, eq(cycleItems.fieldId, codes.id))
      .groupBy(codes.label)
      .orderBy(desc(sql`coalesce(sum(${cycleItems.budgetThousand}),0)`))
      .limit(8),
    // 읍면별 사업비
    db
      .select({ label: towns.name, sum: sql<number>`coalesce(sum(${cycleItems.budgetThousand}),0)::int` })
      .from(cycleItems)
      .leftJoin(towns, eq(cycleItems.townId, towns.id))
      .groupBy(towns.name)
      .orderBy(desc(sql`coalesce(sum(${cycleItems.budgetThousand}),0)`))
      .limit(8),
    // 재원별 사업비
    db
      .select({ label: codes.label, sum: sql<number>`coalesce(sum(${cycleItems.budgetThousand}),0)::int` })
      .from(cycleItems)
      .leftJoin(codes, eq(cycleItems.fundSourceId, codes.id))
      .groupBy(codes.label)
      .orderBy(desc(sql`coalesce(sum(${cycleItems.budgetThousand}),0)`)),
    // 공모 확보
    db
      .select({
        total: sql<number>`count(*)::int`,
        selected: sql<number>`count(*) filter (where ${grants.stage} in ('selected','granted','executing'))::int`,
        amount: sql<number>`coalesce(sum(${grants.selectedThousand}) filter (where ${grants.stage} in ('selected','granted','executing')),0)::int`,
      })
      .from(grants),
    // 공약 이행률 (단위사업)
    db
      .select({ avg: sql<number>`coalesce(round(avg(${pledges.progressPct})),0)::int` })
      .from(pledges)
      .where(eq(pledges.level, 3)),
    db.select().from(schedules).orderBy(schedules.dueDate).limit(6),
  ]);

  return {
    year,
    policyCount: policyCount[0].c,
    cycleCount: cycleCount[0].c,
    keyCount: keyCount[0].c,
    byField: byField.filter((r) => r.sum > 0),
    byTown: byTown.filter((r) => r.sum > 0),
    byFund: byFund.filter((r) => r.sum > 0),
    grant: grantAgg[0],
    pledgeAvg: pledgeAgg[0].avg,
    upcoming,
  };
}

function BarList({ title, rows }: { title: string; rows: { label: string | null; sum: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.sum));
  return (
    <Card>
      <CardHeader><CardTitle className="text-[18px] tracking-[-0.4px]">{title}</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">데이터 없음</p>
        ) : (
          rows.map((r) => (
            <div key={r.label ?? "미지정"} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-[13px] text-foreground">{r.label ?? "미지정"}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-hint-of-sky">
                <div className="h-full rounded-full bg-deep-violet" style={{ width: `${(r.sum / max) * 100}%` }} />
              </div>
              <span className="w-36 shrink-0 text-right text-[12px] text-muted-foreground">{formatBudgetThousand(r.sum)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const d = await getData();

  return (
    <div>
      <PageHeader title="대시보드" description={`서천군 정책·사업 현황 (${d.year}년)`} />

      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">정책</span><span className="font-display text-[26px] font-extrabold text-deep-space-charcoal">{d.policyCount}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">순기표 사업</span><span className="font-display text-[26px] font-extrabold text-deep-space-charcoal">{d.cycleCount}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">주요사업</span><span className="font-display text-[26px] font-extrabold text-deep-violet">{d.keyCount}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">공약 이행률</span><span className="font-display text-[26px] font-extrabold text-deep-violet">{d.pledgeAvg}%</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">공모 확보액</span><span className="font-display text-[16px] font-bold text-deep-violet">{formatBudgetThousand(d.grant.amount)}</span></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <BarList title="분야별 사업비" rows={d.byField} />
        <BarList title="지역(읍면)별 사업비" rows={d.byTown} />
        <BarList title="재원별 사업비" rows={d.byFund} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-[18px] tracking-[-0.4px]">다가오는 일정</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {d.upcoming.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                등록된 일정이 없습니다. <Link href="/schedule" className="text-deep-violet underline">일정 관리</Link>
              </p>
            ) : (
              d.upcoming.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline">{s.category}</Badge>
                    <span className="text-foreground">{s.title}</span>
                  </span>
                  <span className="text-muted-foreground">{formatDate(s.dueDate)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-[18px] tracking-[-0.4px]">데이터 출력</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-[14px]">
            <p className="text-muted-foreground">필터 조건별 자료를 엑셀(CSV)로 내려받을 수 있습니다.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/api/export/cycle" className="rounded-[var(--radius-buttons)] border border-border px-3 py-1.5 text-[13px] hover:bg-accent">순기표 CSV</Link>
              <Link href="/api/export/major-tasks" className="rounded-[var(--radius-buttons)] border border-border px-3 py-1.5 text-[13px] hover:bg-accent">주요업무 CSV</Link>
              <Link href="/api/export/grants" className="rounded-[var(--radius-buttons)] border border-border px-3 py-1.5 text-[13px] hover:bg-accent">공모사업 CSV</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
