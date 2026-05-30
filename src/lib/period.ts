/** 주요업무 보고회 회차(월): 2·7·11월 */
export const REPORT_ROUNDS = [2, 7, 11] as const;
/** 순기표 분기(작성 월): 1·4·7·10월 */
export const CYCLE_QUARTERS = [1, 4, 7, 10] as const;

export const ROUND_LABEL: Record<number, string> = {
  2: "2월(연초)",
  7: "7월(상반기)",
  11: "11월(연말)",
};
export const QUARTER_LABEL: Record<number, string> = {
  1: "1분기(1월)",
  4: "2분기(4월)",
  7: "3분기(7월)",
  10: "4분기(10월)",
};

export function currentYear(): number {
  return new Date().getFullYear();
}

/** 직전 회차(연·월) 계산 — 향후계획 대비 추적용 */
export function prevRound(year: number, round: number): { year: number; round: number } {
  const idx = REPORT_ROUNDS.indexOf(round as (typeof REPORT_ROUNDS)[number]);
  if (idx > 0) return { year, round: REPORT_ROUNDS[idx - 1] };
  return { year: year - 1, round: REPORT_ROUNDS[REPORT_ROUNDS.length - 1] };
}

export function prevQuarter(year: number, quarter: number): { year: number; quarter: number } {
  const idx = CYCLE_QUARTERS.indexOf(quarter as (typeof CYCLE_QUARTERS)[number]);
  if (idx > 0) return { year, quarter: CYCLE_QUARTERS[idx - 1] };
  return { year: year - 1, quarter: CYCLE_QUARTERS[CYCLE_QUARTERS.length - 1] };
}
