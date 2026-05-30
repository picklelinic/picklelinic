import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cycleItems, cycleReports } from "@/db/schema";
import { getCodes, getDepartments, getTeams, getTowns } from "@/lib/codes";
import { CYCLE_QUARTERS, QUARTER_LABEL, currentYear } from "@/lib/period";
import { PageHeader } from "@/components/page-header";
import { upsertCycleReport } from "../../actions";
import { CycleForm } from "../../cycle-form";

export const dynamic = "force-dynamic";

type SP = Promise<{ year?: string; quarter?: string }>;

export default async function CycleReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const itemId = Number(id);
  if (Number.isNaN(itemId)) notFound();

  const [item] = await db.select().from(cycleItems).where(eq(cycleItems.id, itemId)).limit(1);
  if (!item) notFound();

  const year = sp.year ? Number(sp.year) : currentYear();
  const quarter = sp.quarter ? Number(sp.quarter) : CYCLE_QUARTERS[0];

  const [existing] = await db
    .select()
    .from(cycleReports)
    .where(and(eq(cycleReports.itemId, itemId), eq(cycleReports.year, year), eq(cycleReports.quarter, quarter)))
    .limit(1);

  const [departments, teams, towns, fields, fundSources] = await Promise.all([
    getDepartments(),
    getTeams(),
    getTowns(),
    getCodes("field"),
    getCodes("fund_source"),
  ]);
  const action = upsertCycleReport.bind(null, itemId);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`${item.name} — 분기 보고`}
        description={`${year}년 ${QUARTER_LABEL[quarter] ?? quarter + "월"} ${existing ? "수정" : "신규 작성"}`}
      />
      <CycleForm
        action={action}
        quarters={[...CYCLE_QUARTERS]}
        year={year}
        quarter={quarter}
        lockPeriod={!!sp.quarter}
        departments={departments.map((d) => ({ id: d.id, label: d.name }))}
        teams={teams.map((t) => ({ id: t.id, label: t.name }))}
        towns={towns.map((t) => ({ id: t.id, label: t.name }))}
        fields={fields}
        fundSources={fundSources}
        defaults={{
          name: item.name,
          departmentId: item.departmentId,
          teamId: item.teamId,
          townId: item.townId,
          fieldId: item.fieldId,
          fundSourceId: item.fundSourceId,
          budgetThousand: existing?.budgetThousand ?? item.budgetThousand,
          startYear: item.startYear,
          endYear: item.endYear,
          isKeyPolicy: item.isKeyPolicy,
          content: existing?.content,
          progress: existing?.progress,
          futurePlan: existing?.futurePlan,
          executedThousand: existing?.executedThousand,
          note: existing?.note,
        }}
      />
    </div>
  );
}
