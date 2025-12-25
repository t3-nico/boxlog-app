/**
 * Bulk Operations Subrouter
 * Bulk update and delete operations for plans
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { bulkDeletePlanSchema, bulkUpdatePlanSchema } from '@/schemas/plans';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { removeUndefinedFields } from './utils';

/** 一括タグ追加のスキーマ */
const bulkAddTagsSchema = z.object({
  planIds: z.array(z.string().uuid()),
  tagIds: z.array(z.string().uuid()),
});

export const bulkRouter = createTRPCRouter({
  update: protectedProcedure.input(bulkUpdatePlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;

    const updateData = removeUndefinedFields(input.data) as Record<string, unknown>;

    const { data, error } = await supabase
      .from('plans')
      .update(updateData)
      .in('id', input.ids)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk update plans: ${error.message}`,
      });
    }

    return { count: data.length, plans: data };
  }),

  delete: protectedProcedure.input(bulkDeletePlanSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;

    const { error, count } = await supabase
      .from('plans')
      .delete()
      .in('id', input.ids)
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk delete plans: ${error.message}`,
      });
    }

    return { success: true, count: count ?? 0 };
  }),

  /**
   * 複数のプランに複数のタグを一括追加
   * 既存の関連は無視（upsert動作）
   */
  addTags: protectedProcedure.input(bulkAddTagsSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { planIds, tagIds } = input;

    // プランとタグの全組み合わせを作成
    const planTagsToInsert = planIds.flatMap((planId) =>
      tagIds.map((tagId) => ({
        user_id: userId,
        plan_id: planId,
        tag_id: tagId,
      })),
    );

    if (planTagsToInsert.length === 0) {
      return { success: true, count: 0 };
    }

    // upsertで既存の関連は無視
    const { error, count } = await supabase.from('plan_tags').upsert(planTagsToInsert, {
      onConflict: 'user_id,plan_id,tag_id',
      ignoreDuplicates: true,
    });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk add tags: ${error.message}`,
      });
    }

    return { success: true, count: count ?? planTagsToInsert.length };
  }),
});
