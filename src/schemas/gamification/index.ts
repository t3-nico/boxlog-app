import { z } from 'zod';

/**
 * ゲーミフィケーション指標取得スキーマ
 */
export const getGamificationMetricsSchema = z.object({
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(), // YYYY-MM-DD
});

export type GetGamificationMetricsInput = z.infer<typeof getGamificationMetricsSchema>;

/**
 * 週別集中スコア取得スキーマ
 */
export const getWeeklyFocusScoresSchema = z.object({
  weeks: z.number().int().min(1).max(52).optional().default(8),
});

export type GetWeeklyFocusScoresInput = z.infer<typeof getWeeklyFocusScoresSchema>;
