import Link from "next/link";
import { and, desc, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { policies, codes, departments, towns, type PolicyStatus } from "@/db/schema";
import { getCodes, getDepartments, getTowns } from "@/lib/codes";
import { POLICY_STATUS_LABELS, formatBudgetThousand } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SP = Promise<{
  status?: string;
  field?: string;
  dept?: string;
  town?: string;
  q?: string;
}>;

export default async function PoliciesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const conds: SQL[] = [];
  if (sp.status === "draft" || sp.status === "active") {
    conds.push(eq(policies.status, sp.status as PolicyStatus));
  }
  if (sp.field) conds.push(eq(policies.fieldId, Number(sp.field)));
  if (sp.dept) conds.push(eq(policies.departmentId, Number(sp.dept)));
  if (sp.town) conds.push(eq(policies.townId, Number(sp.town)));
  if (sp.q) conds.push(ilike(policies.title, `%${sp.q}%`));

  const [rows, fields, depts, townList] = await Promise.all([
    db
      .select({
        id: policies.id,
        title: policies.title,
        status: policies.status,
        summary: policies.summary,
        budgetThousand: policies.budgetThousand,
        field: codes.label,
        dept: departments.name,
        town: towns.name,
        createdAt: policies.createdAt,
      })
      .from(policies)
      .leftJoin(codes, eq(policies.fieldId, codes.id))
      .leftJoin(departments, eq(policies.departmentId, departments.id))
      .leftJoin(towns, eq(policies.townId, towns.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(policies.createdAt))
      .limit(200),
    getCodes("field"),
    getDepartments(),
    getTowns(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="정책 아카이브"
          description="시행·구상 정책을 유형·분야별로 등록·분류·검색"
        />
        <Button asChild>
          <Link href="/policies/new">+ 정책 등록</Link>
        </Button>
      </div>

      {/* 필터 */}
      <Card className="mb-4">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-5" method="get">
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="">전체 상태</option>
            <option value="active">시행</option>
            <option value="draft">구상</option>
          </select>
          <select
            name="field"
            defaultValue={sp.field ?? ""}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="">전체 분야</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            name="dept"
            defaultValue={sp.dept ?? ""}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="">전체 부서</option>
            {depts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            name="town"
            defaultValue={sp.town ?? ""}
            className="h-9 rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
          >
            <option value="">전체 지역</option>
            {townList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="정책명 검색"
              className="h-9 w-full rounded-[var(--radius-buttons)] border border-input bg-background px-3 text-[14px]"
            />
            <Button type="submit" size="sm">
              검색
            </Button>
          </div>
        </form>
      </Card>

      {/* 목록 */}
      {rows.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <p className="text-[14px] text-muted-foreground">
            등록된 정책이 없습니다. 우측 상단에서 정책을 등록하세요.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Link key={p.id} href={`/policies/${p.id}`}>
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-interactive)]">
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "active" ? "active" : "muted"}>
                    {POLICY_STATUS_LABELS[p.status]}
                  </Badge>
                  {p.field && <Badge variant="outline">{p.field}</Badge>}
                </div>
                <h3 className="font-display text-[18px] font-bold leading-snug tracking-[-0.4px] text-deep-space-charcoal">
                  {p.title}
                </h3>
                {p.summary && (
                  <p className="line-clamp-2 text-[14px] tracking-[-0.15px] text-muted-foreground">
                    {p.summary}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-[12px] tracking-[-0.14px] text-smoke-gray">
                  {p.dept && <span>{p.dept}</span>}
                  {p.town && <span>{p.town}</span>}
                  {p.budgetThousand != null && <span>{formatBudgetThousand(p.budgetThousand)}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
