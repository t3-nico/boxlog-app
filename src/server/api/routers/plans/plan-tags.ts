/**
 * Plans Router - Plan Tags Management Procedures
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure } from '@/server/api/trpc'

export const addTagProcedure = protectedProcedure
  .input(z.object({ planId: z.string().uuid(), tagId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // タグ名を取得
    const { data: tag } = await supabase.from('tags').select('name').eq('id', input.tagId).single()

    const { data, error } = await supabase
      .from('plan_tags')
      .insert({
        user_id: userId,
        plan_id: input.planId,
        tag_id: input.tagId,
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの追加に失敗しました: ${error.message}`,
      })
    }

    // アクティビティ記録: タグ追加
    await supabase.from('plan_activities').insert({
      plan_id: input.planId,
      user_id: userId,
      action_type: 'tag_added',
      field_name: 'tag',
      new_value: tag?.name || '',
    })

    return data
  })

export const removeTagProcedure = protectedProcedure
  .input(z.object({ planId: z.string().uuid(), tagId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    // タグ名を取得
    const { data: tag } = await supabase.from('tags').select('name').eq('id', input.tagId).single()

    const { error } = await supabase
      .from('plan_tags')
      .delete()
      .eq('plan_id', input.planId)
      .eq('tag_id', input.tagId)
      .eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの削除に失敗しました: ${error.message}`,
      })
    }

    // アクティビティ記録: タグ削除
    await supabase.from('plan_activities').insert({
      plan_id: input.planId,
      user_id: userId,
      action_type: 'tag_removed',
      field_name: 'tag',
      old_value: tag?.name || '',
    })

    return { success: true }
  })

export const getTagsProcedure = protectedProcedure
  .input(z.object({ planId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('plan_tags')
      .select('tag_id, tags(*)')
      .eq('plan_id', input.planId)
      .eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグ一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data.map((item) => item.tags).filter(Boolean)
  })

export const getTagPlanCountsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { supabase, userId } = ctx

  // ユーザーのプランIDを取得
  const { data: userPlans, error: plansError } = await supabase.from('plans').select('id').eq('user_id', userId)

  if (plansError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `プランの取得に失敗しました: ${plansError.message}`,
    })
  }

  const planIds = userPlans.map((t) => t.id)

  if (planIds.length === 0) {
    return {}
  }

  // plan_tags からタグごとのカウントを取得
  const { data: tagCounts, error: countsError } = await supabase
    .from('plan_tags')
    .select('tag_id')
    .in('plan_id', planIds)

  if (countsError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `タグカウントの取得に失敗しました: ${countsError.message}`,
    })
  }

  // タグIDごとにカウント
  const counts: Record<string, number> = {}
  tagCounts.forEach((item) => {
    counts[item.tag_id] = (counts[item.tag_id] || 0) + 1
  })

  return counts
})
