import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { codes, departments, teams, towns, type CodeCategory } from "@/db/schema";

/** 분류 코드 목록 (분야/유형 등) */
export function getCodes(category: CodeCategory) {
  return db
    .select({ id: codes.id, label: codes.label })
    .from(codes)
    .where(eq(codes.category, category))
    .orderBy(asc(codes.sortOrder));
}

export function getTowns() {
  return db
    .select({ id: towns.id, name: towns.name })
    .from(towns)
    .orderBy(asc(towns.sortOrder));
}

export function getDepartments() {
  return db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .orderBy(asc(departments.sortOrder));
}

export function getTeams() {
  return db
    .select({ id: teams.id, name: teams.name, departmentId: teams.departmentId })
    .from(teams)
    .orderBy(asc(teams.sortOrder));
}
