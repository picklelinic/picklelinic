import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { grants, departments } from "@/db/schema";
import { GRANT_STAGE_LABELS } from "@/lib/phase5";
import { toCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const rows = await db
    .select({
      name: grants.name,
      agency: grants.agency,
      dept: departments.name,
      stage: grants.stage,
      requested: grants.requestedThousand,
      selected: grants.selectedThousand,
      national: grants.nationalThousand,
      provincial: grants.provincialThousand,
      county: grants.countyThousand,
      review: grants.investmentReview,
    })
    .from(grants)
    .leftJoin(departments, eq(grants.departmentId, departments.id))
    .orderBy(desc(grants.updatedAt));

  const csv = toCsv(
    ["사업명", "공모기관", "부서", "단계", "신청액(천원)", "선정액(천원)", "국비", "도비", "군비", "투자심사"],
    rows.map((r) => [r.name, r.agency, r.dept, GRANT_STAGE_LABELS[r.stage], r.requested, r.selected, r.national, r.provincial, r.county, r.review]),
  );
  return csvResponse(`공모사업_${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
