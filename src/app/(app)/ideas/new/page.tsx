import { getCodes } from "@/lib/codes";
import { PageHeader } from "@/components/page-header";
import { IdeaForm } from "../idea-form";

export const dynamic = "force-dynamic";

export default async function NewIdeaPage() {
  const [fields, projectTypes] = await Promise.all([
    getCodes("field"),
    getCodes("project_type"),
  ]);
  return (
    <div className="max-w-3xl">
      <PageHeader title="사업 제안 등록" description="서천군에 도움이 될 사업 아이디어를 제안하세요" />
      <IdeaForm fields={fields} projectTypes={projectTypes} />
    </div>
  );
}
