import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { grants, departments } from "@/db/schema";
import { getCodes, getDepartments } from "@/lib/codes";
import { GRANT_STAGE_LABELS } from "@/lib/phase5";
import { formatBudgetThousand } from "@/lib/format";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createGrant } from "./actions";
import { GrantStageControl } from "./stage-control";

export const dynamic = "force-dynamic";

export default async function GrantsPage() {
  const session = await auth();
  const canManage = session?.user.role === "manager" || session?.user.role === "admin";

  const [rows, depts, fields] = await Promise.all([
    db
      .select({
        id: grants.id,
        name: grants.name,
        agency: grants.agency,
        dept: departments.name,
        stage: grants.stage,
        requested: grants.requestedThousand,
        selected: grants.selectedThousand,
        national: grants.nationalThousand,
        provincial: grants.provincialThousand,
        county: grants.countyThousand,
        review: grants.investmentReview,
      })
      .from(grants)
      .leftJoin(departments, eq(grants.departmentId, departments.id))
      .orderBy(desc(grants.updatedAt)),
    getDepartments(),
    getCodes("field"),
  ]);

  const selectedRows = rows.filter((r) => r.stage === "selected" || r.stage === "granted" || r.stage === "executing");
  const totalSelected = selectedRows.reduce((s, r) => s + (r.selected ?? 0), 0);
  const totalRequested = rows.reduce((s, r) => s + (r.requested ?? 0), 0);
  const selRate = rows.length ? Math.round((selectedRows.length / rows.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="국도비 보조사업 · 공모사업 관리"
        description="신청→선정→교부→집행 단계 및 재원 매칭(국/도/군)·확보 실적 관리"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">전체 공모</span><span className="font-display text-[26px] font-extrabold text-deep-space-charcoal">{rows.length}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">선정률</span><span className="font-display text-[26px] font-extrabold text-deep-violet">{selRate}%</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">신청액 합계</span><span className="font-display text-[18px] font-bold text-deep-space-charcoal">{formatBudgetThousand(totalRequested)}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">확보액(선정)</span><span className="font-display text-[18px] font-bold text-deep-violet">{formatBudgetThousand(totalSelected)}</span></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
              <thead>
                <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">사업명</th>
                  <th className="px-3 py-2 font-medium">기관</th>
                  <th className="px-3 py-2 font-medium">단계</th>
                  <th className="px-3 py-2 font-medium">신청액</th>
                  <th className="px-3 py-2 font-medium">선정액</th>
                  <th className="px-3 py-2 font-medium">투자심사</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">등록된 공모사업이 없습니다.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 font-medium text-foreground">{r.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.agency ?? "-"}</td>
                      <td className="px-3 py-2.5"><GrantStageControl id={r.id} stage={r.stage} canManage={canManage} /></td>
                      <td className="px-3 py-2.5">{formatBudgetThousand(r.requested)}</td>
                      <td className="px-3 py-2.5">{formatBudgetThousand(r.selected)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.review ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {canManage && (
          <Card className="p-5 self-start">
            <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">공모사업 등록</h3>
            <form action={createGrant} className="flex flex-col gap-3">
              <input name="name" placeholder="사업명" required className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <input name="agency" placeholder="공모기관(부처/도)" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <select name="departmentId" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                <option value="">담당 부서</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select name="fieldId" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                <option value="">분야</option>
                {fields.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              <select name="stage" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                {Object.entries(GRANT_STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input name="requestedThousand" type="number" placeholder="신청액(천원)" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <input name="selectedThousand" type="number" placeholder="선정액(천원)" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <div className="grid grid-cols-3 gap-2">
                <input name="nationalThousand" type="number" placeholder="국비" className="h-9 rounded-[var(--radius-buttons)] border border-input px-2 text-[13px]" />
                <input name="provincialThousand" type="number" placeholder="도비" className="h-9 rounded-[var(--radius-buttons)] border border-input px-2 text-[13px]" />
                <input name="countyThousand" type="number" placeholder="군비" className="h-9 rounded-[var(--radius-buttons)] border border-input px-2 text-[13px]" />
              </div>
              <input name="investmentReview" placeholder="투자심사 단계/결과" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <button type="submit" className="h-9 rounded-[var(--radius-buttons)] bg-primary text-primary-foreground text-[14px] font-medium">등록</button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
