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

/**
 * タグ別の合計時間を取得
 */
export const getTimeByTagProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { supabase, userId } = ctx

  // プランとタグの紐付けを取得
  const { data: planTags, error: planTagsError } = await supabase
    .from('plan_tags')
    .select('plan_id, tag_id')
    .eq('user_id', userId)

  if (planTagsError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `タグ情報の取得に失敗しました: ${planTagsError.message}`,
    })
  }

  // タグ情報を取得
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('id, name, color')
    .eq('user_id', userId)

  if (tagsError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `タグ情報の取得に失敗しました: ${tagsError.message}`,
    })
  }

  // プランの時間情報を取得
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('id, start_time, end_time')
    .eq('user_id', userId)
    .not('start_time', 'is', null)
    .not('end_time', 'is', null)

  if (plansError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `プラン情報の取得に失敗しました: ${plansError.message}`,
    })
  }

  // プランIDごとの時間を計算
  const planHours: Record<string, number> = {}
  for (const plan of plans) {
    if (!plan.start_time || !plan.end_time) continue
    const startTime = new Date(plan.start_time)
    const endTime = new Date(plan.end_time)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    if (durationHours > 0 && durationHours < 24) {
      planHours[plan.id] = durationHours
    }
  }

  // タグ別に集計
  const tagHours: Record<string, number> = {}
  for (const pt of planTags) {
    const hours = planHours[pt.plan_id]
    if (hours) {
      tagHours[pt.tag_id] = (tagHours[pt.tag_id] ?? 0) + hours
    }
  }

  // タグ情報とマージして返却
  const tagsMap = new Map(tags.map((t) => [t.id, t]))
  const result = Object.entries(tagHours)
    .map(([tagId, hours]) => {
      const tag = tagsMap.get(tagId)
      return {
        tagId,
        name: tag?.name ?? 'Unknown',
        color: tag?.color ?? '#888888',
        hours: Math.round(hours * 10) / 10,
      }
    })
    .sort((a, b) => b.hours - a.hours) // 時間順でソート

  return result
})

/**
 * サマリー統計を取得（累計時間、今月の時間、前月比、完了タスク数）
 */
export const getSummaryProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { supabase, userId } = ctx

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // 全プランを取得
  const { data: allPlans, error: allPlansError } = await supabase
    .from('plans')
    .select('id, status, start_time, end_time')
    .eq('user_id', userId)

  if (allPlansError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `統計情報の取得に失敗しました: ${allPlansError.message}`,
    })
  }

  // 時間計算用のヘルパー
  const calculateHours = (startTime: string, endTime: string): number => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours > 0 && hours < 24 ? hours : 0
  }

  // 累計時間
  let totalHours = 0
  // 今月の時間
  let thisMonthHours = 0
  // 前月の時間
  let lastMonthHours = 0
  // 完了タスク数
  let completedTasks = 0
  // 今週の完了タスク数
  let thisWeekCompleted = 0

  // 今週の開始日（月曜日）
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset)

  for (const plan of allPlans) {
    // 完了タスク
    if (plan.status === 'done') {
      completedTasks++
    }

    // 時間計算
    if (plan.start_time && plan.end_time) {
      const hours = calculateHours(plan.start_time, plan.end_time)
      const startDate = new Date(plan.start_time)

      // 累計
      totalHours += hours

      // 今月
      if (startDate >= thisMonthStart) {
        thisMonthHours += hours
      }

      // 前月
      if (startDate >= lastMonthStart && startDate <= lastMonthEnd) {
        lastMonthHours += hours
      }

      // 今週の完了
      if (plan.status === 'done' && startDate >= thisWeekStart) {
        thisWeekCompleted++
      }
    }
  }

  // 前月比（パーセント）
  const monthComparison = lastMonthHours > 0
    ? Math.round(((thisMonthHours - lastMonthHours) / lastMonthHours) * 100)
    : thisMonthHours > 0 ? 100 : 0

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    thisMonthHours: Math.round(thisMonthHours * 10) / 10,
    lastMonthHours: Math.round(lastMonthHours * 10) / 10,
    monthComparison,
    completedTasks,
    thisWeekCompleted,
  }
})
