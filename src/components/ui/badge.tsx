import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* Pill Badge — DESIGN.md compact informational tag. */
const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-cards)] px-2.5 py-0.5 text-[12px] font-medium tracking-[-0.14px] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-black/5 text-midnight-charcoal",
        violet: "bg-accent text-deep-violet",
        outline: "border border-border text-midnight-charcoal",
        active: "bg-[color-mix(in_srgb,var(--color-deep-violet)_14%,white)] text-deep-violet",
        muted: "bg-hint-of-sky text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
