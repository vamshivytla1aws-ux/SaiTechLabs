export function clampScore(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value * 100) / 100));
}

export function calculatePercentage(total: number, maximum: number) {
  return maximum > 0 ? Math.round((total / maximum) * 10_000) / 100 : 0;
}

export function interviewResult(percentage: number, passScore: number) {
  if (percentage >= Math.max(80, passScore + 10)) return "STRONG_PASS" as const;
  if (percentage >= passScore) return "PASS" as const;
  if (percentage >= Math.max(50, passScore - 15)) return "REVIEW" as const;
  return "FAIL" as const;
}
