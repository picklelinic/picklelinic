import type { UserRole } from "@/db/schema";

export type NavItem = {
  label: string;
  href: string;
  /** 최소 권한 (없으면 모든 로그인 사용자) */
  minRole?: UserRole;
  phase: number;
  status: "ready" | "planned";
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV: NavGroup[] = [
  {
    title: "개요",
    items: [{ label: "대시보드", href: "/", phase: 6, status: "ready" }],
  },
  {
    title: "정책 · 협업",
    items: [
      { label: "정책 아카이브", href: "/policies", phase: 2, status: "planned" },
      { label: "의견 · 사업제안", href: "/ideas", phase: 2, status: "planned" },
    ],
  },
  {
    title: "보고 관리",
    items: [
      { label: "주요업무 보고회", href: "/major-tasks", phase: 3, status: "planned" },
      { label: "순기표", href: "/cycle", phase: 4, status: "planned" },
    ],
  },
  {
    title: "기획실 연계",
    items: [
      { label: "공약사업 이행", href: "/pledges", phase: 5, status: "planned" },
      { label: "국도비 공모사업", href: "/grants", phase: 5, status: "planned" },
      { label: "인구·지방소멸", href: "/population", phase: 5, status: "planned" },
      { label: "성과관리", href: "/performance", phase: 5, status: "planned" },
    ],
  },
  {
    title: "관리",
    items: [
      { label: "기준정보", href: "/admin/base-data", minRole: "manager", phase: 1, status: "ready" },
      { label: "사용자 관리", href: "/admin/users", minRole: "admin", phase: 1, status: "ready" },
    ],
  },
];
