import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { departments, teams, towns, codes, type CodeCategory } from "@/db/schema";
import { isManagerOrAbove } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_LABELS: Record<CodeCategory, string> = {
  field: "분야",
  project_type: "사업 성격(유형)",
  fund_source: "재원구분",
  progress_stage: "추진단계",
  policy_goal: "군정 목표/시책",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[var(--radius-cards)] border border-border bg-transparent px-2.5 py-1 text-[14px] tracking-[-0.15px] text-midnight-charcoal">
      {children}
    </span>
  );
}

export default async function BaseDataPage() {
  const session = await auth();
  if (!isManagerOrAbove(session?.user.role)) redirect("/");

  const [townRows, codeRows, deptRows, teamRows] = await Promise.all([
    db.select().from(towns).orderBy(asc(towns.sortOrder)),
    db.select().from(codes).orderBy(asc(codes.sortOrder)),
    db.select().from(departments).orderBy(asc(departments.sortOrder)),
    db.select().from(teams).orderBy(asc(teams.sortOrder)),
  ]);

  const codesByCategory = codeRows.reduce<Record<string, typeof codeRows>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="기준정보"
        description="공통코드·행정구역·조직 등 분류 기준 정보 (중간관리자 이상)"
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>행정구역 (읍면) · {townRows.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {townRows.map((t) => (
              <Pill key={t.id}>{t.name}</Pill>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>조직 (부서 · 팀)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {deptRows.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-medium tracking-[-0.15px] text-foreground">
                  {d.name}
                </span>
                {teamRows
                  .filter((tm) => tm.departmentId === d.id)
                  .map((tm) => (
                    <Pill key={tm.id}>{tm.name}</Pill>
                  ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {(Object.keys(CATEGORY_LABELS) as CodeCategory[]).map((cat) => {
          const rows = codesByCategory[cat] ?? [];
          if (rows.length === 0) return null;
          return (
            <Card key={cat}>
              <CardHeader>
                <CardTitle>
                  {CATEGORY_LABELS[cat]} · {rows.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {rows.map((r) => (
                  <Pill key={r.id}>{r.label}</Pill>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
