export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-[34px] leading-[1.18] tracking-[-1.19px] font-extrabold text-deep-space-charcoal">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-[16px] leading-[1.5] tracking-[-0.26px] text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
