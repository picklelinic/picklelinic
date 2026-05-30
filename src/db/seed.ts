import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { departments, teams, users, towns, codes } from "./schema";

/**
 * 서천군 ERP 초기 기준정보 시드 (idempotent).
 *  - 읍면(2읍 11면 + 군전체/광역)
 *  - 공통코드(분야/사업유형/재원/추진단계)
 *  - 기획실 부서 + 4개 팀
 *  - 관리자 계정(admin / admin1234)
 */
async function main() {
  console.log("Seeding base data...");

  const townSeed = [
    { name: "서천읍", kind: "읍", sortOrder: 1 },
    { name: "장항읍", kind: "읍", sortOrder: 2 },
    { name: "마서면", kind: "면", sortOrder: 3 },
    { name: "화양면", kind: "면", sortOrder: 4 },
    { name: "기산면", kind: "면", sortOrder: 5 },
    { name: "한산면", kind: "면", sortOrder: 6 },
    { name: "마산면", kind: "면", sortOrder: 7 },
    { name: "시초면", kind: "면", sortOrder: 8 },
    { name: "문산면", kind: "면", sortOrder: 9 },
    { name: "판교면", kind: "면", sortOrder: 10 },
    { name: "종천면", kind: "면", sortOrder: 11 },
    { name: "비인면", kind: "면", sortOrder: 12 },
    { name: "서면", kind: "면", sortOrder: 13 },
    { name: "군전체/광역", kind: "광역", sortOrder: 99 },
  ];
  await db.insert(towns).values(townSeed).onConflictDoNothing();

  const codeSeed: {
    category: "field" | "project_type" | "fund_source" | "progress_stage";
    code: string;
    label: string;
    sortOrder: number;
  }[] = [];
  const fields = [
    "일반행정", "재정·세무", "복지", "보건·의료", "농업·축산", "수산·해양",
    "환경·산림", "문화·관광", "체육·청소년", "경제·일자리", "건설·도시", "안전·교통",
  ];
  fields.forEach((label, i) =>
    codeSeed.push({ category: "field", code: `field_${i + 1}`, label, sortOrder: i + 1 }),
  );
  const projectTypes = ["신규사업", "계속사업", "단위사업", "공모사업", "재정사업", "협력사업"];
  projectTypes.forEach((label, i) =>
    codeSeed.push({ category: "project_type", code: `ptype_${i + 1}`, label, sortOrder: i + 1 }),
  );
  const fundSources = ["국비", "도비", "군비", "기타"];
  fundSources.forEach((label, i) =>
    codeSeed.push({ category: "fund_source", code: `fund_${i + 1}`, label, sortOrder: i + 1 }),
  );
  const stages = ["기획", "추진중", "완료", "보류", "중단"];
  stages.forEach((label, i) =>
    codeSeed.push({ category: "progress_stage", code: `stage_${i + 1}`, label, sortOrder: i + 1 }),
  );
  await db.insert(codes).values(codeSeed).onConflictDoNothing();

  await db.insert(departments).values({ name: "기획실", sortOrder: 1 }).onConflictDoNothing();
  const [dept] = await db.select().from(departments).where(eq(departments.name, "기획실")).limit(1);

  if (dept) {
    const teamNames = ["정책기획팀", "투자기획팀", "예산팀", "회계팀"];
    await db
      .insert(teams)
      .values(teamNames.map((name, i) => ({ departmentId: dept.id, name, sortOrder: i + 1 })))
      .onConflictDoNothing();
  }

  const passwordHash = await bcrypt.hash("admin1234", 10);
  await db
    .insert(users)
    .values({
      username: "admin",
      name: "시스템 관리자",
      passwordHash,
      role: "admin",
      departmentId: dept?.id ?? null,
      isSecretary: false,
      isActive: true,
    })
    .onConflictDoNothing();

  console.log("Seed complete: towns, codes, departments, teams, admin user(admin/admin1234)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
