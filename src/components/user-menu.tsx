import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/rbac";
import type { UserRole } from "@/db/schema";

export function UserMenu({ name, role }: { name: string; role: UserRole }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-[14px] font-medium tracking-[-0.15px] text-foreground">{name}</p>
        <p className="text-[12px] tracking-[-0.14px] text-muted-foreground">
          {ROLE_LABELS[role]}
        </p>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          로그아웃
        </Button>
      </form>
    </div>
  );
}
