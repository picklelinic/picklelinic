import Link from "next/link";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { cycleItems, cycleReports, departments, towns } from "@/db/schema";
import { getDepartments } from "@/lib/codes";
import { CYCLE_QUARTERS, QUARTER_LABEL, currentYear } from "@/lib/period";
import { formatBudgetThousand } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SP = Promise<{ year?: string; quarter?: string; dept?: string; key?: string }>;

export default async function CyclePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const year = sp.year ? Number(sp.year) : currentYear();
  const quarter = sp.quarter ? Number(sp.quarter) : 0;

  const conds: SQL[] = [eq(cycleReports.year, year)];
  if (quarter) conds.push(eq(cycleReports.quarter, quarter));
  if (sp.dept) conds.push(eq(cycleItems.departmentId, Number(sp.dept)));
  if (sp.key === "1") conds.push(eq(cycleItems.isKeyPolicy, true));

  const [rows, depts] = await Promise.all([
    db
      .select({
        itemId: cycleItems.id,
        name: cycleItems.name,
        dept: departments.name,
        town: towns.name,
        isKey: cycleItems.isKeyPolicy,
        endYear: cycleItems.endYear,
        reportId: cycleReports.id,
        quarter: cycleReports.quarter,
        budget: cycleReports.budgetThousand,
        executed: cycleReports.executedThousand,
        progress: cycleReports.progress,
      })
      .from(cycleReports)
      .innerJoin(cycleItems, eq(cycleReports.itemId, cycleItems.id))
      .leftJoin(departments, eq(cycleItems.departmentId, departments.id))
      .leftJoin(towns, eq(cycleItems.townId, towns.id))
      .where(and(...conds))
      .orderBy(desc(cycleReports.quarter), desc(cycleItems.updatedAt))
      .limit(500),
    getDepartments(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="순기표"
          description="분기(1·4·7·10월) 서천군 전 사업 관리 · 정책적 주요사업 별도 관리"
        />
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/cycle/key">정책적 주요사업 관리</Link>
          </Button>
          <Button asChild>
            <Link href="/cycle/new">+ 사업 등록</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <form className="flex flex-wrap items-center gap-3" method="get">
          <select name="year" defaultValue={year} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
            {[currentYear(), currentYear() - 1, currentYear() - 2].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select name="quarter" defaultValue={quarter} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
            <option value={0}>전체 분기</option>
            {CYCLE_QUARTERS.map((q) => (
              <option key={q} value={q}>{QUARTER_LABEL[q]}</option>
            ))}
          </select>
          <select name="dept" defaultValue={sp.dept ?? ""} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
            <option value="">전체 부서</option>
            {depts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-[14px]">
            <input type="checkbox" name="key" value="1" defaultChecked={sp.key === "1"} className="size-4 accent-[var(--color-deep-violet)]" />
            주요사업만
          </label>
          <Button type="submit" size="sm">조회</Button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <p className="text-[14px] text-muted-foreground">{year}년 해당 분기 사업이 없습니다.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
            <thead>
              <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">분기</th>
                <th className="px-3 py-2 font-medium">사업명</th>
                <th className="px-3 py-2 font-medium">부서</th>
                <th className="px-3 py-2 font-medium">읍면</th>
                <th className="px-3 py-2 font-medium">종료연도</th>
                <th className="px-3 py-2 font-medium">사업비</th>
                <th className="px-3 py-2 font-medium">집행액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.reportId} className="border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="px-3 py-2.5"><Badge variant="muted">{r.quarter}월</Badge></td>
                  <td className="px-3 py-2.5">
                    <Link href={`/cycle/${r.itemId}`} className="font-medium text-foreground hover:text-deep-violet">
                      {r.isKey && <span className="mr-1 text-deep-violet">★</span>}
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.dept ?? "-"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.town ?? "-"}</td>
                  <td className="px-3 py-2.5">{r.endYear ?? "-"}</td>
                  <td className="px-3 py-2.5">{formatBudgetThousand(r.budget)}</td>
                  <td className="px-3 py-2.5">{formatBudgetThousand(r.executed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
