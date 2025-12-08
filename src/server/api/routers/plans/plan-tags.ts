/**
 * Plan Tags Subrouter
 * Plan-Tag relationship management
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const planTagsRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({ planId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // Get tag name
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
          message: `Failed to add tag: ${error.message}`,
        })
      }

      // Record activity: tag added
      await supabase.from('plan_activities').insert({
        plan_id: input.planId,
        user_id: userId,
        action_type: 'tag_added',
        field_name: 'tag',
        new_value: tag?.name || '',
      })

      return data
    }),

  remove: protectedProcedure
    .input(z.object({ planId: z.string().uuid(), tagId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // Get tag name
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
          message: `Failed to remove tag: ${error.message}`,
        })
      }

      // Record activity: tag removed
      await supabase.from('plan_activities').insert({
        plan_id: input.planId,
        user_id: userId,
        action_type: 'tag_removed',
        field_name: 'tag',
        old_value: tag?.name || '',
      })

      return { success: true }
    }),

  get: protectedProcedure.input(z.object({ planId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('plan_tags')
      .select('tag_id, tags(*)')
      .eq('plan_id', input.planId)
      .eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch tags: ${error.message}`,
      })
    }

    return data.map((item) => item.tags).filter(Boolean)
  }),
})
