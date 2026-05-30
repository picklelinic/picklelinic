import { getCodes, getDepartments, getTowns } from "@/lib/codes";
import { PageHeader } from "@/components/page-header";
import { createPolicy } from "../actions";
import { PolicyForm } from "../policy-form";

export const dynamic = "force-dynamic";

export default async function NewPolicyPage() {
  const [fields, projectTypes, departments, towns] = await Promise.all([
    getCodes("field"),
    getCodes("project_type"),
    getDepartments(),
    getTowns(),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="정책 등록" description="시행 또는 구상 정책을 등록합니다" />
      <PolicyForm
        action={createPolicy}
        fields={fields}
        projectTypes={projectTypes}
        departments={departments.map((d) => ({ id: d.id, label: d.name }))}
        towns={towns.map((t) => ({ id: t.id, label: t.name }))}
      />
    </div>
  );
}
