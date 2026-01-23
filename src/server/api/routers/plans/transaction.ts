/**
 * Plans Transaction Router
 *
 * トランザクション対応のプラン操作エンドポイント
 * Phase 3: PL/pgSQL Stored Proceduresを使用したACID保証
 *
 * エンドポイント:
 * - plans.createWithTags: プラン作成 + タグ関連付け（アトミック）
 * - plans.updateWithTags: プラン更新 + タグ関連付け更新（アトミック）
 * - plans.deleteWithCleanup: プラン削除 + カスケード削除 + アクティビティ記録（アトミック）
 */

import { z } from 'zod';

import { handleServiceError } from '@/server/services/errors';
import { createPlanTransactionService } from '@/server/services/plans/transaction-service';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

/**
 * Plans Transaction Router
 */
export const plansTransactionRouter = createTRPCRouter({
  /**
   * プラン作成（タグ付き）
   *
   * プラン作成、タグ関連付け、アクティビティ記録をトランザクション的に実行します。
   * エラー時は全操作がロールバックされます。
   */
  createWithTags: protectedProcedure
    .input(
      z.object({
        title: z.string().max(200),
        description: z.string().optional(),
        scheduledDate: z.string().optional(),
        tagIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createPlanTransactionService(ctx.supabase);
        const plan = await service.createWithTags({
          userId: ctx.userId!,
          title: input.title,
          description: input.description,
          scheduledDate: input.scheduledDate,
          tagIds: input.tagIds,
        });

        return plan;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * プラン更新（タグ付き）
   *
   * プラン更新、タグ関連付け更新、アクティビティ記録をトランザクション的に実行します。
   * エラー時は全操作がロールバックされます。
   */
  updateWithTags: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().max(200).optional(),
        description: z.string().nullable().optional(),
        scheduledDate: z.string().nullable().optional(),
        tagIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createPlanTransactionService(ctx.supabase);
        const plan = await service.updateWithTags({
          userId: ctx.userId!,
          planId: input.id,
          title: input.title,
          description: input.description,
          scheduledDate: input.scheduledDate,
          tagIds: input.tagIds,
        });

        return plan;
      } catch (error) {
        return handleServiceError(error);
      }
    }),

  /**
   * プラン削除（クリーンアップ付き）
   *
   * プラン削除、plan_tags削除、アクティビティ記録をトランザクション的に実行します。
   * エラー時は全操作がロールバックされます。
   */
  deleteWithCleanup: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const service = createPlanTransactionService(ctx.supabase);
        const result = await service.deleteWithCleanup({
          userId: ctx.userId!,
          planId: input.id,
        });

        return result;
      } catch (error) {
        return handleServiceError(error);
      }
    }),
});
