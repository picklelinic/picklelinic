import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, departments } from "@/db/schema";
import { isAdmin, ROLE_LABELS } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export default async function UsersPage() {
  const session = await auth();
  if (!isAdmin(session?.user.role)) redirect("/");

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      isSecretary: users.isSecretary,
      isActive: users.isActive,
      department: departments.name,
    })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .orderBy(asc(users.id));

  return (
    <div>
      <PageHeader title="사용자 관리" description="계정·권한 관리 (관리자 전용)" />
      <Card className="p-0 overflow-hidden">
        <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
          <thead>
            <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">아이디</th>
              <th className="px-4 py-2 font-medium">이름</th>
              <th className="px-4 py-2 font-medium">부서</th>
              <th className="px-4 py-2 font-medium">권한</th>
              <th className="px-4 py-2 font-medium">서무</th>
              <th className="px-4 py-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-[13px]">{u.username}</td>
                <td className="px-4 py-2.5 text-foreground">{u.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.department ?? "-"}</td>
                <td className="px-4 py-2.5">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-2.5">{u.isSecretary ? "○" : "-"}</td>
                <td className="px-4 py-2.5">
                  <span className={u.isActive ? "text-deep-violet" : "text-smoke-gray"}>
                    {u.isActive ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
