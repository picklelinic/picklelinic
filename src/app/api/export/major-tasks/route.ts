import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { majorTasks, majorTaskReports, departments, towns } from "@/db/schema";
import { toCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const rows = await db
    .select({
      name: majorTasks.name,
      dept: departments.name,
      town: towns.name,
      year: majorTaskReports.year,
      round: majorTaskReports.round,
      goal: majorTaskReports.goal,
      budget: majorTaskReports.budgetThousand,
      period: majorTaskReports.periodText,
      progress: majorTaskReports.progress,
      futurePlan: majorTaskReports.futurePlan,
      problem: majorTaskReports.problem,
      effect: majorTaskReports.effect,
    })
    .from(majorTaskReports)
    .innerJoin(majorTasks, eq(majorTaskReports.taskId, majorTasks.id))
    .leftJoin(departments, eq(majorTasks.departmentId, departments.id))
    .leftJoin(towns, eq(majorTasks.townId, towns.id))
    .orderBy(desc(majorTaskReports.year), desc(majorTaskReports.round));

  const csv = toCsv(
    ["사업명", "부서", "위치", "연도", "회차", "목표및방향성", "사업비(천원)", "사업기간", "추진현황", "향후계획", "문제점및해결방안", "기대효과"],
    rows.map((r) => [r.name, r.dept, r.town, r.year, `${r.round}월`, r.goal, r.budget, r.period, r.progress, r.futurePlan, r.problem, r.effect]),
  );
  return csvResponse(`주요업무보고_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
