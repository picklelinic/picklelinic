import { getCodes, getDepartments, getTeams, getTowns } from "@/lib/codes";
import { CYCLE_QUARTERS, currentYear } from "@/lib/period";
import { PageHeader } from "@/components/page-header";
import { createCycleItem } from "../actions";
import { CycleForm } from "../cycle-form";

export const dynamic = "force-dynamic";

export default async function NewCyclePage() {
  const [departments, teams, towns, fields, fundSources] = await Promise.all([
    getDepartments(),
    getTeams(),
    getTowns(),
    getCodes("field"),
    getCodes("fund_source"),
  ]);
  return (
    <div className="max-w-3xl">
      <PageHeader title="순기표 사업 등록" description="서천군 사업과 첫 분기 보고를 등록합니다" />
      <CycleForm
        action={createCycleItem}
        quarters={[...CYCLE_QUARTERS]}
        year={currentYear()}
        quarter={CYCLE_QUARTERS[0]}
        departments={departments.map((d) => ({ id: d.id, label: d.name }))}
        teams={teams.map((t) => ({ id: t.id, label: t.name }))}
        towns={towns.map((t) => ({ id: t.id, label: t.name }))}
        fields={fields}
        fundSources={fundSources}
      />
    </div>
  );
}
