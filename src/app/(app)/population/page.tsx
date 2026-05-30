import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cycleItems, cycleReports, towns } from "@/db/schema";
import { formatBudgetThousand } from "@/lib/format";
import { currentYear } from "@/lib/period";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

/*
 * 인구·지방소멸 대응: 정책적 주요사업(지방소멸대응 사업)의 읍면별 배분과
 * 집행률을 집계한다. 순기표의 정책적 주요사업을 기반으로 한다.
 */
export default async function PopulationPage() {
  const year = currentYear();

  // 정책적 주요사업 + 해당 연도 최신 분기 집행액
  const keyItems = await db
    .select({
      id: cycleItems.id,
      name: cycleItems.name,
      town: towns.name,
      townId: cycleItems.townId,
      budget: cycleItems.budgetThousand,
      endYear: cycleItems.endYear,
    })
    .from(cycleItems)
    .leftJoin(towns, eq(cycleItems.townId, towns.id))
    .where(eq(cycleItems.isKeyPolicy, true));

  // 연도별 집행액 합계 (item별 최대 분기)
  const exec = await db
    .select({
      itemId: cycleReports.itemId,
      executed: sql<number>`coalesce(sum(${cycleReports.executedThousand}),0)::int`,
    })
    .from(cycleReports)
    .where(and(eq(cycleReports.year, year)))
    .groupBy(cycleReports.itemId);
  const execMap = new Map(exec.map((e) => [e.itemId, e.executed]));

  // 읍면별 집계
  const byTown = new Map<string, { count: number; budget: number; executed: number }>();
  for (const it of keyItems) {
    const k = it.town ?? "미지정";
    const g = byTown.get(k) ?? { count: 0, budget: 0, executed: 0 };
    g.count += 1;
    g.budget += it.budget ?? 0;
    g.executed += execMap.get(it.id) ?? 0;
    byTown.set(k, g);
  }
  const townRows = [...byTown.entries()].sort((a, b) => b[1].budget - a[1].budget);

  const totalBudget = keyItems.reduce((s, r) => s + (r.budget ?? 0), 0);
  const totalExec = keyItems.reduce((s, r) => s + (execMap.get(r.id) ?? 0), 0);
  const execRate = totalBudget ? Math.round((totalExec / totalBudget) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="인구 · 지방소멸 대응"
        description="지방소멸대응 정책적 주요사업의 읍면별 배분 및 집행률 모니터링"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">대응 사업</span><span className="font-display text-[28px] font-extrabold text-deep-space-charcoal">{keyItems.length}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">총 사업비</span><span className="font-display text-[18px] font-bold text-deep-space-charcoal">{formatBudgetThousand(totalBudget)}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">{year} 집행액</span><span className="font-display text-[18px] font-bold text-deep-violet">{formatBudgetThousand(totalExec)}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">집행률</span><span className="font-display text-[28px] font-extrabold text-deep-violet">{execRate}%</span></CardContent></Card>
      </div>

      {keyItems.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <p className="text-[14px] text-muted-foreground">
            순기표에서 정책적 주요사업으로 지정된 사업이 없습니다.{" "}
            <Link href="/cycle" className="text-deep-violet underline">순기표</Link>에서 지정하세요.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>읍면별 배분 현황 ({year}년)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {townRows.map(([town, g]) => {
              const r = g.budget ? Math.round((g.executed / g.budget) * 100) : 0;
              return (
                <div key={town} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[14px] font-medium text-foreground">{town}</span>
                  <Badge variant="muted">{g.count}건</Badge>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-hint-of-sky">
                    <div className="h-full rounded-full bg-deep-violet" style={{ width: `${Math.min(r, 100)}%` }} />
                  </div>
                  <span className="w-44 shrink-0 text-right text-[13px] text-muted-foreground">
                    {formatBudgetThousand(g.budget)} · {r}%
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
