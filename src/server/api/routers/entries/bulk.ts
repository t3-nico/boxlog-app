/**
 * Bulk Operations Subrouter
 * Bulk update and delete operations for entries
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { bulkDeleteEntrySchema, bulkUpdateEntrySchema } from '@/schemas/entries';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import { removeUndefinedFields } from '../plans/utils';

/** 一括タグ追加のスキーマ */
const bulkAddTagsSchema = z.object({
  entryIds: z.array(z.string().uuid()).min(1).max(100),
  tagIds: z.array(z.string().uuid()).min(1).max(50),
});

export const bulkRouter = createTRPCRouter({
  update: protectedProcedure.input(bulkUpdateEntrySchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;

    const updateData = removeUndefinedFields(input.data) as Record<string, unknown>;

    const { data, error } = await supabase
      .from('entries')
      .update(updateData)
      .in('id', input.ids)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk update entries: ${error.message}`,
      });
    }

    return { count: data.length, entries: data };
  }),

  delete: protectedProcedure.input(bulkDeleteEntrySchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;

    const { error, count } = await supabase
      .from('entries')
      .delete()
      .in('id', input.ids)
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk delete entries: ${error.message}`,
      });
    }

    return { success: true, count: count ?? 0 };
  }),

  /**
   * 複数のエントリに複数のタグを一括追加
   * 既存の関連は無視（upsert動作）
   */
  addTags: protectedProcedure.input(bulkAddTagsSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { entryIds, tagIds } = input;

    const entryTagsToInsert = entryIds.flatMap((entryId) =>
      tagIds.map((tagId) => ({
        user_id: userId,
        entry_id: entryId,
        tag_id: tagId,
      })),
    );

    if (entryTagsToInsert.length === 0) {
      return { success: true, count: 0 };
    }

    const { error, count } = await supabase.from('entry_tags').upsert(entryTagsToInsert, {
      onConflict: 'user_id,entry_id,tag_id',
      ignoreDuplicates: true,
    });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to bulk add tags: ${error.message}`,
      });
    }

    return { success: true, count: count ?? entryTagsToInsert.length };
  }),
});
