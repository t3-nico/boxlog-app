/**
 * Plans Router - Tags CRUD
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTagSchema, tagIdSchema, updateTagSchema } from '@/schemas/plans'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const tagsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグ一覧の取得に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  create: protectedProcedure.input(createTagSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: userId,
        name: input.name,
        ...(input.color !== undefined && { color: input.color }),
        ...(input.description !== undefined && { description: input.description }),
      })
      .select()
      .single()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの作成に失敗しました: ${error.message}`,
      })
    }

    return data
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateTagSchema }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx

      // undefinedを除外してSupabaseに渡す
      const updateData: Record<string, string | null> = {}
      if (input.data.name !== undefined) updateData.name = input.data.name
      if (input.data.color !== undefined) updateData.color = input.data.color
      if (input.data.description !== undefined) updateData.description = input.data.description

      const { data, error } = await supabase
        .from('tags')
        .update(updateData)
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの更新に失敗しました: ${error.message}`,
        })
      }

      return data
    }),

  delete: protectedProcedure.input(tagIdSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx

    const { error } = await supabase.from('tags').delete().eq('id', input.id).eq('user_id', userId)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの削除に失敗しました: ${error.message}`,
      })
    }

    return { success: true }
  }),
})
