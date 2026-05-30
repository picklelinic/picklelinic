import { getDepartments, getTeams, getTowns } from "@/lib/codes";
import { REPORT_ROUNDS, currentYear } from "@/lib/period";
import { PageHeader } from "@/components/page-header";
import { createMajorTask } from "../actions";
import { TaskForm } from "../task-form";

export const dynamic = "force-dynamic";

export default async function NewMajorTaskPage() {
  const [departments, teams, towns] = await Promise.all([getDepartments(), getTeams(), getTowns()]);
  return (
    <div className="max-w-3xl">
      <PageHeader title="주요업무 사업 등록" description="신규 사업과 첫 회차 보고를 등록합니다" />
      <TaskForm
        action={createMajorTask}
        rounds={[...REPORT_ROUNDS]}
        year={currentYear()}
        round={REPORT_ROUNDS[0]}
        departments={departments.map((d) => ({ id: d.id, label: d.name }))}
        teams={teams.map((t) => ({ id: t.id, label: t.name }))}
        towns={towns.map((t) => ({ id: t.id, label: t.name }))}
      />
    </div>
  );
}
