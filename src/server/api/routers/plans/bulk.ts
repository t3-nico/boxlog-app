/**
 * Plans Router - Bulk Operations Procedures
 */

import { TRPCError } from '@trpc/server'

import { bulkDeletePlanSchema, bulkUpdatePlanSchema } from '@/schemas/plans'
import { protectedProcedure } from '@/server/api/trpc'

import { removeUndefinedFields } from './utils'

export const bulkUpdateProcedure = protectedProcedure.input(bulkUpdatePlanSchema).mutation(async ({ ctx, input }) => {
  const { supabase, userId } = ctx

  // undefinedを除外してSupabaseに渡す
  const updateData = removeUndefinedFields(input.data) as Record<string, unknown>

  const { data, error } = await supabase
    .from('plans')
    .update(updateData)
    .in('id', input.ids)
    .eq('user_id', userId)
    .select()

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `プランの一括更新に失敗しました: ${error.message}`,
    })
  }

  return { count: data.length, plans: data }
})

export const bulkDeleteProcedure = protectedProcedure.input(bulkDeletePlanSchema).mutation(async ({ ctx, input }) => {
  const { supabase, userId } = ctx

  const { error, count } = await supabase.from('plans').delete().in('id', input.ids).eq('user_id', userId)

  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `プランの一括削除に失敗しました: ${error.message}`,
    })
  }

  return { success: true, count: count ?? 0 }
})
