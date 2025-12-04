/**
 * Plans Router - Statistics Procedures
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

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

/**
 * 日別の合計時間を取得（年次グリッド用）
 */
export const getDailyHoursProcedure = protectedProcedure
  .input(
    z.object({
      year: z.number().min(2020).max(2100),
    })
  )
  .query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx
    const { year } = input

    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    // start_timeとend_timeがある全プランを取得
    const { data: plans, error } = await supabase
      .from('plans')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .gte('start_time', `${startDate}T00:00:00`)
      .lte('start_time', `${endDate}T23:59:59`)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `日別時間の取得に失敗しました: ${error.message}`,
      })
    }

    // 日別に集計
    const dailyHours: Record<string, number> = {}

    for (const plan of plans) {
      if (!plan.start_time || !plan.end_time) continue

      const startTime = new Date(plan.start_time)
      const endTime = new Date(plan.end_time)
      const isoString = startTime.toISOString()
      const dateKey = isoString.split('T')[0] ?? '' // YYYY-MM-DD

      if (!dateKey) continue

      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

      if (durationHours > 0 && durationHours < 24) {
        // 24時間以上は異常値として除外
        dailyHours[dateKey] = (dailyHours[dateKey] ?? 0) + durationHours
      }
    }

    // 配列形式に変換
    const result = Object.entries(dailyHours).map(([date, hours]) => ({
      date,
      hours: Math.round(hours * 10) / 10, // 小数点1桁
    }))

    return result
  })
