/**
 * Gamification Router
 *
 * ゲーミフィケーション指標の取得: タイムボクシング遵守率、週別集中スコア
 */

import {
  getGamificationMetricsSchema,
  getWeeklyFocusScoresSchema,
} from '@/schemas/gamification';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { handleServiceError } from '@/server/services/errors';
import { createGamificationService } from '@/server/services/gamification/gamification-service';

export const gamificationRouter = createTRPCRouter({
  /**
   * 全ゲーミフィケーション指標を取得
   */
  getMetrics: protectedProcedure
    .input(getGamificationMetricsSchema)
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createGamificationService(supabase);

      try {
        return await service.getMetrics(userId, input.startDate, input.endDate);
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * タイムボクシング遵守率を取得
   */
  getTimeboxingAdherence: protectedProcedure
    .input(getGamificationMetricsSchema)
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createGamificationService(supabase);

      try {
        return await service.getTimeboxingAdherence(userId, input.startDate, input.endDate);
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * 週別集中スコアを取得
   */
  getWeeklyFocusScores: protectedProcedure
    .input(getWeeklyFocusScoresSchema)
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createGamificationService(supabase);

      try {
        return await service.getWeeklyFocusScores(userId, input.weeks);
      } catch (error) {
        handleServiceError(error);
      }
    }),
});
