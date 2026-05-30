import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { majorTasks, majorTaskReports } from "@/db/schema";
import { getDepartments, getTeams, getTowns } from "@/lib/codes";
import { REPORT_ROUNDS, ROUND_LABEL, currentYear } from "@/lib/period";
import { PageHeader } from "@/components/page-header";
import { upsertReport } from "../../actions";
import { TaskForm } from "../../task-form";

export const dynamic = "force-dynamic";

type SP = Promise<{ year?: string; round?: string }>;

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) notFound();

  const [task] = await db.select().from(majorTasks).where(eq(majorTasks.id, taskId)).limit(1);
  if (!task) notFound();

  const year = sp.year ? Number(sp.year) : currentYear();
  const round = sp.round ? Number(sp.round) : REPORT_ROUNDS[0];

  // 기존 회차 보고가 있으면 수정 모드
  const [existing] = await db
    .select()
    .from(majorTaskReports)
    .where(
      and(
        eq(majorTaskReports.taskId, taskId),
        eq(majorTaskReports.year, year),
        eq(majorTaskReports.round, round),
      ),
    )
    .limit(1);

  const [departments, teams, towns] = await Promise.all([getDepartments(), getTeams(), getTowns()]);
  const action = upsertReport.bind(null, taskId);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`${task.name} — 회차 보고`}
        description={`${year}년 ${ROUND_LABEL[round] ?? round + "월"} ${existing ? "수정" : "신규 작성"}`}
      />
      <TaskForm
        action={action}
        rounds={[...REPORT_ROUNDS]}
        year={year}
        round={round}
        lockPeriod={!!sp.round}
        departments={departments.map((d) => ({ id: d.id, label: d.name }))}
        teams={teams.map((t) => ({ id: t.id, label: t.name }))}
        towns={towns.map((t) => ({ id: t.id, label: t.name }))}
        defaults={{
          name: task.name,
          departmentId: task.departmentId,
          teamId: task.teamId,
          townId: task.townId,
          goal: existing?.goal,
          budgetThousand: existing?.budgetThousand,
          periodText: existing?.periodText,
          locationText: existing?.locationText,
          content: existing?.content,
          progress: existing?.progress,
          futurePlan: existing?.futurePlan,
          problem: existing?.problem,
          effect: existing?.effect,
          refs: existing?.refs,
        }}
      />
    </div>
  );
}
