/**
 * Plans CRUD Subrouter
 *
 * Core plan operations: list, getById, create, update, delete
 *
 * @description
 * このルーターはサービス層（PlanService）を使用してビジネスロジックを実行します。
 * ルーターの責務は入力バリデーションとエラーハンドリングのみです。
 */

import { z } from 'zod';

import {
  createPlanSchema,
  getPlanByIdSchema,
  planFilterSchema,
  planIdSchema,
  updatePlanSchema,
} from '@/schemas/plans';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { handleServiceError } from '@/server/services/errors';
import { createPlanService } from '@/server/services/plans';

export const plansCrudRouter = createTRPCRouter({
  /**
   * プラン一覧取得
   */
  list: protectedProcedure.input(planFilterSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createPlanService(supabase);

    try {
      return await service.list({
        userId,
        ...input,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * プランをIDで取得
   */
  getById: protectedProcedure.input(getPlanByIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createPlanService(supabase);

    try {
      const options: Parameters<typeof service.getById>[0] = {
        userId,
        planId: input.id,
      };
      if (input.include?.tags !== undefined) options.includeTags = input.include.tags;

      return await service.getById(options);
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * プラン作成
   */
  create: protectedProcedure.input(createPlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createPlanService(supabase);

    try {
      return await service.create({
        userId,
        input,
        preventOverlappingPlans: true, // 重複は常にブロック
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * プラン更新
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updatePlanSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createPlanService(supabase);

      try {
        return await service.update({
          userId,
          planId: input.id,
          input: input.data,
          preventOverlappingPlans: true, // 重複は常にブロック
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * プラン削除
   */
  delete: protectedProcedure.input(planIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createPlanService(supabase);

    try {
      return await service.delete({
        userId,
        planId: input.id,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),
});
