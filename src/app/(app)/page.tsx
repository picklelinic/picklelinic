import { sql } from "drizzle-orm";
import { db } from "@/db";
import { departments, teams, towns, codes, users } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

async function getCounts() {
  const [u] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  const [d] = await db.select({ c: sql<number>`count(*)::int` }).from(departments);
  const [t] = await db.select({ c: sql<number>`count(*)::int` }).from(teams);
  const [tw] = await db.select({ c: sql<number>`count(*)::int` }).from(towns);
  const [cd] = await db.select({ c: sql<number>`count(*)::int` }).from(codes);
  return { users: u.c, departments: d.c, teams: t.c, towns: tw.c, codes: cd.c };
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <span className="text-[14px] tracking-[-0.15px] text-muted-foreground">{label}</span>
        <span className="font-display text-[40px] leading-[1.14] tracking-[-1.6px] font-extrabold text-deep-space-charcoal">
          {value}
          <span className="ml-1 text-[16px] font-medium text-smoke-gray">{unit}</span>
        </span>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const c = await getCounts();
  return (
    <div>
      <PageHeader
        title="대시보드"
        description="서천군 정책·사업 현황 요약 (1단계: 기준정보 구축 완료)"
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="등록 사용자" value={c.users} unit="명" />
        <StatCard label="부서" value={c.departments} unit="개" />
        <StatCard label="팀" value={c.teams} unit="개" />
        <StatCard label="행정구역(읍면)" value={c.towns} unit="개" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-2">
            <span className="font-display text-[26px] leading-[1.25] tracking-[-0.91px] font-bold text-deep-space-charcoal">
              기준정보 현황
            </span>
            <p className="text-[14px] tracking-[-0.15px] text-muted-foreground">
              공통코드 {c.codes}건 (분야·사업유형·재원·추진단계)이 등록되어 있습니다. 유형별·지역별
              사업비 분석 등 본격 지표는 보고/사업 데이터 적재 후 제공됩니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <span className="font-display text-[26px] leading-[1.25] tracking-[-0.91px] font-bold text-deep-space-charcoal">
              다음 단계
            </span>
            <p className="text-[14px] tracking-[-0.15px] text-muted-foreground">
              2단계 — 정책 아카이브 및 의견·사업제안 협업 기능을 개발합니다. 좌측 메뉴의
              &lsquo;예정&rsquo; 모듈이 순차적으로 활성화됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
