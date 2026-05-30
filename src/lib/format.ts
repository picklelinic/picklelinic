/*
 * 표시용 포맷 유틸. 클라이언트 컴포넌트에서도 import 하므로 DB 스키마(@/db/schema)에
 * 의존하지 않는다 — 스키마를 import 하면 Turbopack 이 클라이언트 그래프로 끌어와
 * 서버 컴포넌트에서 테이블 객체가 client proxy 로 취급되는 문제가 생긴다.
 */
type PolicyStatus = "draft" | "active";
type IdeaStatus = "proposed" | "reviewing" | "adopted" | "rejected";

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  draft: "구상",
  active: "시행",
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  proposed: "제안됨",
  reviewing: "검토중",
  adopted: "채택",
  rejected: "반려",
};

/** 천원 단위 정수 → "1,234천원" (백만 이상은 억원 환산 병기) */
export function formatBudgetThousand(v: number | null | undefined): string {
  if (v == null) return "-";
  const won = v.toLocaleString("ko-KR");
  if (v >= 1000) {
    const eok = (v / 1_000_00).toFixed(v % 1_000_00 === 0 ? 0 : 1); // 천원→억원
    return `${won}천원 (약 ${eok}억원)`;
  }
  return `${won}천원`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
