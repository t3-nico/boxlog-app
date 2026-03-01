/**
 * Reflections Router
 *
 * 振り返りレポートの一覧取得、詳細取得、ノート更新、AI生成、集計データ取得
 */

import {
  generateReflectionSchema,
  getAggregationDataSchema,
  getEnergyMapSchema,
  getFulfillmentTrendSchema,
  getReflectionByIdSchema,
  listReflectionsSchema,
  updateReflectionNoteSchema,
} from '@/schemas/reflections';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { handleServiceError } from '@/server/services/errors';
import { createDataReadinessService } from '@/server/services/gamification/data-readiness-service';
import { createDataAggregationService } from '@/server/services/reflections/data-aggregation-service';
import { createReflectionGenerationService } from '@/server/services/reflections/generation-service';
import { createReflectionService } from '@/server/services/reflections/reflection-service';

export const reflectionsRouter = createTRPCRouter({
  /**
   * 振り返り一覧取得
   */
  list: protectedProcedure.input(listReflectionsSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createReflectionService(supabase);

    try {
      return await service.list({
        userId,
        periodType: input.periodType,
        limit: input.limit,
        offset: input.offset,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * 振り返り詳細取得
   */
  getById: protectedProcedure.input(getReflectionByIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createReflectionService(supabase);

    try {
      return await service.getById({
        userId,
        reflectionId: input.id,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * ユーザーメモ更新
   */
  updateNote: protectedProcedure
    .input(updateReflectionNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createReflectionService(supabase);

      try {
        return await service.updateNote({
          userId,
          reflectionId: input.id,
          userNote: input.userNote,
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * 振り返りAI生成（冪等: 同一期間の既存レポートがあればそれを返す）
   */
  generate: protectedProcedure.input(generateReflectionSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createReflectionGenerationService(supabase);

    try {
      return await service.generate({
        userId,
        periodType: input.periodType,
        periodStart: input.periodStart,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * 週次集計データ取得
   */
  getAggregationData: protectedProcedure
    .input(getAggregationDataSchema)
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createDataAggregationService(supabase);

      try {
        return await service.getWeeklyReflectionData(userId, input.weekStart);
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * 充実度トレンド取得
   */
  getFulfillmentTrend: protectedProcedure
    .input(getFulfillmentTrendSchema)
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createDataAggregationService(supabase);

      try {
        return await service.getFulfillmentTrend(userId, input.startDate, input.endDate);
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * エネルギーマップ取得
   */
  getEnergyMap: protectedProcedure.input(getEnergyMapSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createDataAggregationService(supabase);

    try {
      return await service.getEnergyMap(userId, input.startDate, input.endDate);
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * データ蓄積状況取得（コールドスタート対策）
   */
  getReadiness: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx;
    const service = createDataReadinessService(supabase);

    try {
      return await service.getReadiness(userId);
    } catch (error) {
      handleServiceError(error);
    }
  }),
});
