import type { UserRole } from "@/db/schema";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "관리자",
  manager: "중간관리자",
  user: "일반 사용자",
};

const ROLE_RANK: Record<UserRole, number> = {
  user: 1,
  manager: 2,
  admin: 3,
};

/** role 이 minRole 이상의 권한인지 */
export function hasRole(role: UserRole | undefined, minRole: UserRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export const isAdmin = (role?: UserRole) => role === "admin";
export const isManagerOrAbove = (role?: UserRole) => hasRole(role, "manager");
