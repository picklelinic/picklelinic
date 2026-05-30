import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { policies } from "@/db/schema";
import { getCodes, getDepartments, getTowns } from "@/lib/codes";
import { PageHeader } from "@/components/page-header";
import { updatePolicy } from "../../actions";
import { PolicyForm } from "../../policy-form";

export const dynamic = "force-dynamic";

export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policyId = Number(id);
  if (Number.isNaN(policyId)) notFound();

  const [policy] = await db.select().from(policies).where(eq(policies.id, policyId)).limit(1);
  if (!policy) notFound();

  const [fields, projectTypes, departments, towns] = await Promise.all([
    getCodes("field"),
    getCodes("project_type"),
    getDepartments(),
    getTowns(),
  ]);

  const action = updatePolicy.bind(null, policyId);

  return (
    <div className="max-w-3xl">
      <PageHeader title="정책 수정" description={policy.title} />
      <PolicyForm
        action={action}
        policy={policy}
        fields={fields}
        projectTypes={projectTypes}
        departments={departments.map((d) => ({ id: d.id, label: d.name }))}
        towns={towns.map((t) => ({ id: t.id, label: t.name }))}
      />
    </div>
  );
}
