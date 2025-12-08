/**
 * Bulk Operations Subrouter
 * Bulk update and delete operations for plans
 */

import { TRPCError } from '@trpc/server'

import { bulkDeletePlanSchema, bulkUpdatePlanSchema } from '@/schemas/plans'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

import { removeUndefinedFields } from './utils'

export const bulkRouter = createTRPCRouter({
  update: protectedProcedure.input(bulkUpdatePlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

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
        message: `Failed to bulk update plans: ${error.message}`,
      })
    }

    return { count: data.length, plans: data }
  }),

  delete: protectedProcedure.input(bulkDeletePlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { error, count } = await supabase.from('plans').delete().in('id', input.ids).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk delete plans: ${error.message}`,
      })
    }

    return { success: true, count: count ?? 0 }
  }),
})
