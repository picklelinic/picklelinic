import { asc } from "drizzle-orm";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { auth } from "@/auth";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSchedule, deleteSchedule } from "./actions";

export const dynamic = "force-dynamic";

const PRESET_CATEGORIES = ["주요업무보고회", "순기표", "공모마감", "공약점검", "기타"];

export default async function SchedulePage() {
  const session = await auth();
  const canManage = session?.user.role === "manager" || session?.user.role === "admin";
  const rows = await db.select().from(schedules).orderBy(asc(schedules.dueDate));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="업무 일정 · 알림" description="보고회·순기표·공모 마감 등 주요 일정 관리" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <table className="w-full border-collapse text-[14px] tracking-[-0.15px]">
              <thead>
                <tr className="border-b border-border bg-hint-of-sky text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">마감일</th>
                  <th className="px-3 py-2 font-medium">구분</th>
                  <th className="px-3 py-2 font-medium">제목</th>
                  <th className="px-3 py-2 font-medium">D-day</th>
                  {canManage && <th className="px-3 py-2" />}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">등록된 일정이 없습니다.</td></tr>
                ) : (
                  rows.map((s) => {
                    const dday = Math.ceil((new Date(s.dueDate).getTime() - new Date(today).getTime()) / 86400000);
                    const past = dday < 0;
                    return (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2.5 text-muted-foreground">{formatDate(s.dueDate)}</td>
                        <td className="px-3 py-2.5"><Badge variant="outline">{s.category}</Badge></td>
                        <td className="px-3 py-2.5 text-foreground">{s.title}</td>
                        <td className="px-3 py-2.5">
                          <span className={past ? "text-smoke-gray" : dday <= 7 ? "text-warm-fade font-medium" : "text-foreground"}>
                            {past ? "마감" : dday === 0 ? "D-day" : `D-${dday}`}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-3 py-2.5 text-right">
                            <form action={deleteSchedule.bind(null, s.id)}>
                              <button type="submit" className="text-[12px] text-smoke-gray hover:text-destructive">삭제</button>
                            </form>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {canManage && (
          <Card className="p-5 self-start">
            <h3 className="font-display text-[16px] font-bold tracking-[-0.3px] text-deep-space-charcoal">일정 등록</h3>
            <form action={createSchedule} className="flex flex-col gap-3">
              <input name="title" placeholder="일정 제목" required className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <select name="category" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]">
                {PRESET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="dueDate" type="date" required defaultValue={today} className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <input name="note" placeholder="비고(선택)" className="h-9 rounded-[var(--radius-buttons)] border border-input px-3 text-[14px]" />
              <button type="submit" className="h-9 rounded-[var(--radius-buttons)] bg-primary text-primary-foreground text-[14px] font-medium">등록</button>
            </form>
          </Card>
        )}
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground">
        ※ 연 3회 주요업무 보고회(2·7·11월), 분기 순기표(1·4·7·10월) 일정을 등록해 마감을 관리하세요.
        대시보드에 다가오는 일정이 표시됩니다.
      </p>
    </div>
  );
}
