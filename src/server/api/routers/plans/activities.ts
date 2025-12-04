/**
 * Plans Router - Activities Procedures (アクティビティ履歴)
 */

import { TRPCError } from '@trpc/server'

import type { PlanActivity } from '@/features/plans/types/activity'
import { createPlanActivitySchema, getPlanActivitiesSchema } from '@/schemas/plans/activity'
import { protectedProcedure } from '@/server/api/trpc'

/**
 * アクティビティ一覧取得
 */
export const activitiesProcedure = protectedProcedure.input(getPlanActivitiesSchema).query(async ({ ctx, input }) => {
  const { supabase, userId } = ctx
  const { plan_id, limit, offset, order } = input

  // プランの所有権確認
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('id')
    .eq('id', plan_id)
    .eq('user_id', userId)
    .single()

  if (planError || !plan) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Plan not found or access denied',
    })
  }

  // アクティビティ取得（order: desc=最新順, asc=古い順）
  const { data: activities, error } = await supabase
    .from('plan_activities')
    .select('*')
    .eq('plan_id', plan_id)
    .order('created_at', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to fetch activities: ${error.message}`,
    })
  }

  // Supabaseの型を厳密なPlanActivity型にキャスト
  return (activities ?? []) as PlanActivity[]
})

/**
 * アクティビティ作成
 */
export const createActivityProcedure = protectedProcedure
  .input(createPlanActivitySchema)
  .mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // プランの所有権確認
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', input.plan_id)
      .eq('user_id', userId)
      .single()

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plan not found or access denied',
      })
    }

    // アクティビティ作成（undefinedを除外）
    const activityData: Record<string, unknown> = {
      plan_id: input.plan_id,
      user_id: userId,
      action_type: input.action_type,
    }
    if (input.field_name !== undefined) activityData.field_name = input.field_name
    if (input.old_value !== undefined) activityData.old_value = input.old_value
    if (input.new_value !== undefined) activityData.new_value = input.new_value
    if (input.metadata !== undefined) activityData.metadata = input.metadata as never

    const { data: activity, error } = await supabase
      .from('plan_activities')
      .insert(activityData as never)
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create activity: ${error.message}`,
      })
    }

    // Supabaseの型を厳密なPlanActivity型にキャスト
    return activity as PlanActivity
  })
