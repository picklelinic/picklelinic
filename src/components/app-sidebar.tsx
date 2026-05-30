"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { hasRole } from "@/lib/rbac";
import type { UserRole } from "@/db/schema";
import { cn } from "@/lib/utils";

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-canvas-white md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex size-7 items-center justify-center rounded-[var(--radius-buttons)] bg-primary text-primary-foreground font-display text-[14px] font-extrabold">
          서천
        </span>
        <span className="font-display text-[16px] font-bold tracking-[-0.26px] text-deep-space-charcoal">
          정책관리 ERP
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((group) => {
          const items = group.items.filter(
            (it) => !it.minRole || hasRole(role, it.minRole),
          );
          if (items.length === 0) return null;
          return (
            <div key={group.title} className="mb-4">
              <p className="px-2 pb-1 text-[12px] font-medium tracking-[-0.14px] text-smoke-gray">
                {group.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {items.map((it) => {
                  const active =
                    it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={cn(
                          "flex items-center justify-between rounded-[var(--radius-buttons)] px-2 py-1.5 text-[14px] tracking-[-0.15px] transition-colors",
                          active
                            ? "bg-accent font-medium text-foreground"
                            : "text-midnight-charcoal hover:bg-accent",
                        )}
                      >
                        <span>{it.label}</span>
                        {it.status === "planned" && (
                          <span className="rounded-[var(--radius-cards)] bg-black/5 px-1.5 py-0.5 text-[12px] text-smoke-gray">
                            예정
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
