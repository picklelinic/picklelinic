import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { kpis, departments } from "@/db/schema";
import { getDepartments } from "@/lib/codes";
import { currentYear } from "@/lib/period";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createKpi } from "./actions";

export const dynamic = "force-dynamic";

function rate(target: number | null, actual: number | null): number | null {
  if (target == null || target === 0 || actual == null) return null;
  return Math.round((actual / target) * 100);
}

export default async function PerformancePage() {
  const session = await auth();
  const canManage = session?.user.role === "manager" || session?.user.role === "admin";

  const [rows, depts] = await Promise.all([
    db
      .select({
        id: kpis.id,
        name: kpis.name,
        dept: departments.name,
        year: kpis.year,
        unit: kpis.unit,
        target: kpis.targetValue,
        actual: kpis.actualValue,
      })
      .from(kpis)
      .leftJoin(departments, eq(kpis.departmentId, departments.id))
      .orderBy(desc(kpis.year), desc(kpis.id)),
    getDepartments(),
  ]);

  const withRate = rows.map((r) => ({ ...r, rate: rate(r.target, r.actual) }));
  const rated = withRate.filter((r) => r.rate != null);
  const avg = rated.length ? Math.round(rated.reduce((s, r) => s + (r.rate ?? 0), 0) / rated.length) : 0;

  return (
    <div>
      <PageHeader
        title="성과관리"
        description="사업·시책별 성과지표(목표·실적·달성률) 등록 및 평가 대응"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">등록 지표</span><span className="font-display text-[28px] font-extrabold text-deep-space-charcoal">{rows.length}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">평균 달성률</span><span className="font-display text-[28px] font-extrabold text-deep-violet">{avg}%</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">목표 달성(100%+)</span><span className="font-display text-[28px] font-extrabold text-deep-space-charcoal">{rated.filter((r) => (r.rate ?? 0) >= 100).length}</span></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
              <thead>
                <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">연도</th>
                  <th className="px-3 py-2 font-medium">지표명</th>
                  <th className="px-3 py-2 font-medium">부서</th>
                  <th className="px-3 py-2 font-medium">목표</th>
                  <th className="px-3 py-2 font-medium">실적</th>
                  <th className="px-3 py-2 font-medium">달성률</th>
                </tr>
              </thead>
              <tbody>
                {withRate.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">등록된 성과지표가 없습니다.</td></tr>
                ) : (
                  withRate.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 text-muted-foreground">{r.year}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{r.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.dept ?? "-"}</td>
                      <td className="px-3 py-2.5">{r.target ?? "-"}{r.unit ?? ""}</td>
                      <td className="px-3 py-2.5">{r.actual ?? "-"}{r.unit ?? ""}</td>
                      <td className="px-3 py-2.5">
                        {r.rate != null ? (
                          <span className={r.rate >= 100 ? "text-deep-violet font-medium" : "text-foreground"}>{r.rate}%</span>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {canManage && (
          <Card className="p-5 self-start">
            <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">지표 등록</h3>
            <form action={createKpi} className="flex flex-col gap-3">
              <input name="name" placeholder="지표명" required className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <select name="departmentId" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                <option value="">담당 부서</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input name="year" type="number" defaultValue={currentYear()} className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <input name="unit" placeholder="단위 (명/건/% 등)" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <div className="grid grid-cols-2 gap-2">
                <input name="targetValue" type="number" placeholder="목표치" className="h-9 rounded-[var(--radius-buttons)] border border-input px-2 text-[13px]" />
                <input name="actualValue" type="number" placeholder="실적치" className="h-9 rounded-[var(--radius-buttons)] border border-input px-2 text-[13px]" />
              </div>
              <button type="submit" className="h-9 rounded-[var(--radius-buttons)] bg-primary text-primary-foreground text-[14px] font-medium">등록</button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
