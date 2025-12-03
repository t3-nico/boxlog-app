/**
 * Plans Router - Statistics Procedure
 */

import { TRPCError } from '@trpc/server'

import { protectedProcedure } from '@/server/api/trpc'

export const getStatsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { supabase, userId } = ctx

  // 全プラン取得（最適化: select で必要なフィールドのみ取得）
  const { data: plans, error } = await supabase.from('plans').select('id, status').eq('user_id', userId)

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `統計情報の取得に失敗しました: ${error.message}`,
    })
  }

  // ステータス別カウント
  const byStatus = plans.reduce(
    (acc, plan) => {
      acc[plan.status] = (acc[plan.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    total: plans.length,
    byStatus,
  }
})
