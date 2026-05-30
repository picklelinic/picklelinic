import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { cycleItems, departments, towns, codes } from "@/db/schema";
import { toCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const rows = await db
    .select({
      id: cycleItems.id,
      name: cycleItems.name,
      dept: departments.name,
      town: towns.name,
      field: codes.label,
      budget: cycleItems.budgetThousand,
      startYear: cycleItems.startYear,
      endYear: cycleItems.endYear,
      isKey: cycleItems.isKeyPolicy,
    })
    .from(cycleItems)
    .leftJoin(departments, eq(cycleItems.departmentId, departments.id))
    .leftJoin(towns, eq(cycleItems.townId, towns.id))
    .leftJoin(codes, eq(cycleItems.fieldId, codes.id))
    .orderBy(desc(cycleItems.updatedAt));

  const csv = toCsv(
    ["ID", "사업명", "부서", "읍면", "분야", "사업비(천원)", "시작연도", "종료연도", "정책적주요사업"],
    rows.map((r) => [r.id, r.name, r.dept, r.town, r.field, r.budget, r.startYear, r.endYear, r.isKey ? "Y" : "N"]),
  );
  return csvResponse(`순기표_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
