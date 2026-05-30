import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pledges, departments } from "@/db/schema";
import { getDepartments } from "@/lib/codes";
import { PLEDGE_STATUS_LABELS, PLEDGE_LEVEL_LABELS } from "@/lib/phase5";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPledge } from "./actions";
import { PledgeRow } from "./pledge-row";

export const dynamic = "force-dynamic";

export default async function PledgesPage() {
  const session = await auth();
  const canManage = session?.user.role === "manager" || session?.user.role === "admin";

  const [rows, depts] = await Promise.all([
    db
      .select({
        id: pledges.id,
        title: pledges.title,
        level: pledges.level,
        parentId: pledges.parentId,
        status: pledges.status,
        progressPct: pledges.progressPct,
        dept: departments.name,
      })
      .from(pledges)
      .leftJoin(departments, eq(pledges.departmentId, departments.id))
      .orderBy(asc(pledges.level), asc(pledges.id)),
    getDepartments(),
  ]);

  // 이행률 요약 (단위사업 기준)
  const units = rows.filter((r) => r.level === 3);
  const avg = units.length ? Math.round(units.reduce((s, r) => s + r.progressPct, 0) / units.length) : 0;
  const completed = units.filter((r) => r.status === "completed").length;

  return (
    <div>
      <PageHeader
        title="공약사업 이행관리"
        description="대과제→세부과제→단위사업 계층으로 공약 이행률·상태를 점검합니다"
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">전체 단위사업</span><span className="font-display text-[28px] font-extrabold text-deep-space-charcoal">{units.length}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">평균 이행률</span><span className="font-display text-[28px] font-extrabold text-deep-violet">{avg}%</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">완료</span><span className="font-display text-[28px] font-extrabold text-deep-space-charcoal">{completed}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-[13px] text-muted-foreground">지연</span><span className="font-display text-[28px] font-extrabold text-warm-fade">{units.filter((r) => r.status === "delayed").length}</span></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
              <thead>
                <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">구분</th>
                  <th className="px-3 py-2 font-medium">공약</th>
                  <th className="px-3 py-2 font-medium">부서</th>
                  <th className="px-3 py-2 font-medium">상태</th>
                  <th className="px-3 py-2 font-medium">이행률</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">등록된 공약이 없습니다.</td></tr>
                ) : (
                  rows.map((r) => <PledgeRow key={r.id} row={r} canManage={canManage} />)
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {canManage && (
          <Card className="p-5 self-start">
            <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">공약 등록</h3>
            <form action={createPledge} className="flex flex-col gap-3">
              <input name="title" placeholder="공약/과제명" required className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <select name="level" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                {[1, 2, 3].map((l) => <option key={l} value={l}>{PLEDGE_LEVEL_LABELS[l]}</option>)}
              </select>
              <select name="parentId" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                <option value="">상위 없음</option>
                {rows.filter((r) => r.level < 3).map((r) => <option key={r.id} value={r.id}>[{PLEDGE_LEVEL_LABELS[r.level]}] {r.title}</option>)}
              </select>
              <select name="departmentId" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                <option value="">담당 부서</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select name="status" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input name="progressPct" type="number" min="0" max="100" defaultValue={0} placeholder="이행률 %" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <button type="submit" className="h-9 rounded-[var(--radius-buttons)] bg-primary text-primary-foreground text-[14px] font-medium">등록</button>
            </form>
          </Card>
        )}
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">상태 범례: {Object.values(PLEDGE_STATUS_LABELS).join(" · ")}</p>
      <div className="hidden"><Badge>x</Badge></div>
    </div>
  );
}
