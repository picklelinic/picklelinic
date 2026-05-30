import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { ProfileForm, PasswordForm } from "./profile-forms";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = Number(session.user.id);
  const [u] = await db
    .select({ username: users.username, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);
  if (!u) redirect("/login");

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <PageHeader title="내 정보 / 비밀번호" description="개인 정보와 비밀번호를 관리합니다" />
        <Badge variant="violet">{ROLE_LABELS[u.role]}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ProfileForm name={u.name} email={u.email ?? ""} username={u.username} />
        <PasswordForm />
      </div>
    </div>
  );
}
