/**
 * Plans CRUD Subrouter
 *
 * Core plan operations: list, getById, create, update, delete
 *
 * @description
 * このルーターはサービス層（PlanService）を使用してビジネスロジックを実行します。
 * ルーターの責務は入力バリデーションとエラーハンドリングのみです。
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createPlanSchema, getPlanByIdSchema, planFilterSchema, planIdSchema, updatePlanSchema } from '@/schemas/plans'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { createPlanService, PlanServiceError } from '@/server/services/plans'

/**
 * サービスエラーをTRPCエラーに変換
 */
function handleServiceError(error: unknown): never {
  if (error instanceof PlanServiceError) {
    const codeMap: Record<string, 'INTERNAL_SERVER_ERROR' | 'NOT_FOUND' | 'BAD_REQUEST'> = {
      FETCH_FAILED: 'INTERNAL_SERVER_ERROR',
      NOT_FOUND: 'NOT_FOUND',
      CREATE_FAILED: 'INTERNAL_SERVER_ERROR',
      UPDATE_FAILED: 'INTERNAL_SERVER_ERROR',
      DELETE_FAILED: 'INTERNAL_SERVER_ERROR',
      TAG_FILTER_FAILED: 'INTERNAL_SERVER_ERROR',
    }

    throw new TRPCError({
      code: codeMap[error.code] ?? 'INTERNAL_SERVER_ERROR',
      message: error.message,
    })
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
  })
}

export const plansCrudRouter = createTRPCRouter({
  /**
   * プラン一覧取得
   */
  list: protectedProcedure.input(planFilterSchema.optional()).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const service = createPlanService(supabase)

    try {
      return await service.list({
        userId,
        ...input,
      })
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * プランをIDで取得
   */
  getById: protectedProcedure.input(getPlanByIdSchema).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const service = createPlanService(supabase)

    try {
      return await service.getById({
        userId,
        planId: input.id,
        includeTags: input.include?.tags,
      })
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * プラン作成
   */
  create: protectedProcedure.input(createPlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const service = createPlanService(supabase)

    try {
      return await service.create({
        userId,
        input,
      })
    } catch (error) {
      handleServiceError(error)
    }
  }),

  /**
   * プラン更新
   */
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updatePlanSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx
      const service = createPlanService(supabase)

      try {
        return await service.update({
          userId,
          planId: input.id,
          input: input.data,
        })
      } catch (error) {
        handleServiceError(error)
      }
    }),

  /**
   * プラン削除
   */
  delete: protectedProcedure.input(planIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const service = createPlanService(supabase)

    try {
      return await service.delete({
        userId,
        planId: input.id,
      })
    } catch (error) {
      handleServiceError(error)
    }
  }),
})
