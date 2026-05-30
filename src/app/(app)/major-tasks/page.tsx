import Link from "next/link";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { majorTasks, majorTaskReports, departments, towns } from "@/db/schema";
import { getDepartments } from "@/lib/codes";
import { REPORT_ROUNDS, ROUND_LABEL, currentYear } from "@/lib/period";
import { formatBudgetThousand } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SP = Promise<{ year?: string; round?: string; dept?: string }>;

export default async function MajorTasksPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const year = sp.year ? Number(sp.year) : currentYear();
  const round = sp.round ? Number(sp.round) : 0; // 0 = 전체

  const reportConds: SQL[] = [eq(majorTaskReports.year, year)];
  if (round) reportConds.push(eq(majorTaskReports.round, round));

  const taskConds: SQL[] = [];
  if (sp.dept) taskConds.push(eq(majorTasks.departmentId, Number(sp.dept)));

  const [rows, depts] = await Promise.all([
    db
      .select({
        taskId: majorTasks.id,
        name: majorTasks.name,
        dept: departments.name,
        town: towns.name,
        reportId: majorTaskReports.id,
        year: majorTaskReports.year,
        round: majorTaskReports.round,
        budget: majorTaskReports.budgetThousand,
        progress: majorTaskReports.progress,
      })
      .from(majorTaskReports)
      .innerJoin(majorTasks, eq(majorTaskReports.taskId, majorTasks.id))
      .leftJoin(departments, eq(majorTasks.departmentId, departments.id))
      .leftJoin(towns, eq(majorTasks.townId, towns.id))
      .where(and(...reportConds, ...taskConds))
      .orderBy(desc(majorTaskReports.round), desc(majorTasks.updatedAt))
      .limit(300),
    getDepartments(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="주요업무 보고회"
          description="연 3회(2·7·11월) 부서별 주요사업 보고 · 회차별 향후계획 대비 변경 추적"
        />
        <Button asChild>
          <Link href="/major-tasks/new">+ 사업 등록</Link>
        </Button>
      </div>

      <Card className="mb-4">
        <form className="flex flex-wrap items-center gap-3" method="get">
          <select name="year" defaultValue={year} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
            {[currentYear(), currentYear() - 1, currentYear() - 2].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select name="round" defaultValue={round} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
            <option value={0}>전체 회차</option>
            {REPORT_ROUNDS.map((r) => (
              <option key={r} value={r}>{ROUND_LABEL[r]}</option>
            ))}
          </select>
          <select name="dept" defaultValue={sp.dept ?? ""} className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]">
            <option value="">전체 부서</option>
            {depts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <Button type="submit" size="sm">조회</Button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <p className="text-[14px] text-muted-foreground">{year}년 해당 회차 보고 자료가 없습니다.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
            <thead>
              <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">회차</th>
                <th className="px-4 py-2 font-medium">사업명</th>
                <th className="px-4 py-2 font-medium">부서</th>
                <th className="px-4 py-2 font-medium">위치</th>
                <th className="px-4 py-2 font-medium">사업비</th>
                <th className="px-4 py-2 font-medium">추진현황</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.reportId} className="border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <Badge variant="muted">{r.round}월</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/major-tasks/${r.taskId}`} className="font-medium text-foreground hover:text-deep-violet">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.dept ?? "-"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.town ?? "-"}</td>
                  <td className="px-4 py-2.5">{formatBudgetThousand(r.budget)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground line-clamp-1 max-w-xs">{r.progress ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
