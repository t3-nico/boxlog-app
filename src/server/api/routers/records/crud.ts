/**
 * Records CRUD Subrouter
 *
 * Core record operations: list, getById, create, update, delete, duplicate
 *
 * @description
 * このルーターはサービス層（RecordService）を使用してビジネスロジックを実行します。
 * ルーターの責務は入力バリデーションとエラーハンドリングのみです。
 */

import { z } from 'zod';

import {
  createRecordSchema,
  duplicateRecordSchema,
  getRecordByIdSchema,
  recordFilterSchema,
  recordIdSchema,
  updateRecordSchema,
} from '@/schemas/records';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { handleServiceError } from '@/server/services/errors';
import { createRecordService } from '@/server/services/records';

export const recordsCrudRouter = createTRPCRouter({
  /**
   * Record一覧取得
   */
  list: protectedProcedure.input(recordFilterSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createRecordService(supabase);

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
   * RecordをIDで取得
   */
  getById: protectedProcedure.input(getRecordByIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createRecordService(supabase);

    try {
      const options: Parameters<typeof service.getById>[0] = {
        userId,
        recordId: input.id,
      };
      if (input.include?.plan !== undefined) options.includePlan = input.include.plan;

      return await service.getById(options);
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * Record作成
   */
  create: protectedProcedure.input(createRecordSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createRecordService(supabase);

    try {
      return await service.create({
        userId,
        input,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * Record更新
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateRecordSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createRecordService(supabase);

      try {
        return await service.update({
          userId,
          recordId: input.id,
          input: input.data,
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * Record削除
   */
  delete: protectedProcedure.input(recordIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createRecordService(supabase);

    try {
      return await service.delete({
        userId,
        recordId: input.id,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * Record複製（最近のエントリ複製機能）
   */
  duplicate: protectedProcedure.input(duplicateRecordSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const service = createRecordService(supabase);

    try {
      return await service.duplicate({
        userId,
        recordId: input.id,
        workedAt: input.worked_at,
      });
    } catch (error) {
      handleServiceError(error);
    }
  }),

  /**
   * 最近のRecord取得（複製用）
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createRecordService(supabase);

      try {
        return await service.getRecentRecords(userId, input?.limit ?? 5);
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * PlanのRecord一覧取得
   */
  listByPlan: protectedProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
        sortBy: z.enum(['worked_at', 'created_at']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createRecordService(supabase);

      try {
        return await service.listByPlan({
          userId,
          planId: input.planId,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
          limit: input.limit,
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),

  /**
   * Record一括削除
   */
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const service = createRecordService(supabase);

      try {
        return await service.bulkDelete({
          userId,
          recordIds: input.ids,
        });
      } catch (error) {
        handleServiceError(error);
      }
    }),
});
