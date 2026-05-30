// Phase 5 공통 라벨 (클라이언트/서버 공용, @/db/schema 미import)
export const PLEDGE_STATUS_LABELS: Record<string, string> = {
  normal: "정상추진",
  partial: "일부추진",
  delayed: "지연",
  completed: "완료",
  changed: "실천계획 변경",
};

export const PLEDGE_LEVEL_LABELS: Record<number, string> = {
  1: "대과제",
  2: "세부과제",
  3: "단위사업",
};

export const GRANT_STAGE_LABELS: Record<string, string> = {
  applied: "신청",
  selected: "선정",
  rejected: "미선정",
  granted: "교부",
  executing: "집행",
};
