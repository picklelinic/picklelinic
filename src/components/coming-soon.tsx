import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: number;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card className="items-center justify-center gap-2 py-16 text-center">
        <span className="rounded-[var(--radius-pills)] bg-accent px-3 py-1 text-[13px] font-medium tracking-[-0.14px] text-deep-violet">
          개발 예정 · {phase}단계
        </span>
        <p className="text-[14px] tracking-[-0.15px] text-muted-foreground">
          이 모듈은 기능 체크리스트({phase}단계)에 따라 순차 개발됩니다.
        </p>
      </Card>
    </div>
  );
}
