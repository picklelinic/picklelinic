import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { cycleItems, departments, towns } from "@/db/schema";
import { formatBudgetThousand } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SP = Promise<{ by?: string }>;

export default async function KeyPolicyPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const by = sp.by ?? "dept"; // dept | town | endyear

  const rows = await db
    .select({
      id: cycleItems.id,
      name: cycleItems.name,
      dept: departments.name,
      town: towns.name,
      endYear: cycleItems.endYear,
      budget: cycleItems.budgetThousand,
    })
    .from(cycleItems)
    .leftJoin(departments, eq(cycleItems.departmentId, departments.id))
    .leftJoin(towns, eq(cycleItems.townId, towns.id))
    .where(eq(cycleItems.isKeyPolicy, true))
    .orderBy(desc(cycleItems.endYear));

  // 그룹화 키
  const keyOf = (r: (typeof rows)[number]) =>
    by === "town" ? r.town ?? "미지정" : by === "endyear" ? (r.endYear ? `${r.endYear}년` : "미지정") : r.dept ?? "미지정";

  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = keyOf(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }
  const sumBudget = (list: typeof rows) => list.reduce((s, r) => s + (r.budget ?? 0), 0);

  const tabs = [
    { key: "dept", label: "부서별" },
    { key: "town", label: "읍면별" },
    { key: "endyear", label: "종료연도별" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="정책적 주요사업 관리"
          description="순기표에서 지정한 정책적 주요사업을 부서별·읍면별·종료연도별로 집계"
        />
        <Button asChild variant="outline">
          <Link href="/cycle">순기표로</Link>
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link key={t.key} href={`/cycle/key?by=${t.key}`}>
            <Badge variant={by === t.key ? "active" : "outline"}>{t.label}</Badge>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card className="items-center justify-center py-16 text-center">
          <p className="text-[14px] text-muted-foreground">
            지정된 정책적 주요사업이 없습니다. 순기표 사업 상세에서 ★ 지정하세요.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[...groups.entries()].map(([group, list]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle>
                  {group} · {list.length}건
                  <span className="ml-2 text-[14px] font-medium text-muted-foreground">
                    {formatBudgetThousand(sumBudget(list))}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border">
                {list.map((r) => (
                  <Link
                    key={r.id}
                    href={`/cycle/${r.id}`}
                    className="flex items-center justify-between py-2 text-[14px] hover:text-deep-violet"
                  >
                    <span className="text-foreground">★ {r.name}</span>
                    <span className="text-muted-foreground">{formatBudgetThousand(r.budget)}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
