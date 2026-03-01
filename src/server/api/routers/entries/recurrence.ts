/**
 * Entries Recurrence Subrouter
 *
 * 繰り返しエントリ関連の操作エンドポイント
 *
 * @description
 * - splitRecurrence: 繰り返しエントリを特定日で分割
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createEntryService } from '@/server/services/entries';

export const recurrenceRouter = createTRPCRouter({
  /**
   * 繰り返しエントリを分割
   *
   * 「この日以降」編集/削除時に使用。
   * 1. 親エントリのrecurrence_end_dateを前日に設定
   * 2. 新しい繰り返しエントリを作成（同じ繰り返しルール、splitDateから開始）
   * 3. overridesがある場合は新エントリに適用
   *
   * @returns 新しく作成されたエントリのID
   */
  splitRecurrence: protectedProcedure
    .input(
      z.object({
        entryId: z.string().uuid(),
        splitDate: z.string(), // YYYY-MM-DD形式
        overrides: z
          .object({
            title: z.string().optional(),
            description: z.string().nullable().optional(),
            start_time: z.string().optional(), // ISO 8601形式
            end_time: z.string().optional(), // ISO 8601形式
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, userId } = ctx;
      const { entryId, splitDate, overrides } = input;

      // 1. 親エントリを取得して所有権確認
      const { data: parentEntry, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !parentEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entry not found or access denied',
        });
      }

      // 繰り返しエントリでない場合はエラー
      if (!parentEntry.recurrence_type || parentEntry.recurrence_type === 'none') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Entry is not a recurring entry',
        });
      }

      // 2. 親エントリのrecurrence_end_dateを前日に更新
      const endDateForParent = new Date(splitDate);
      endDateForParent.setDate(endDateForParent.getDate() - 1);
      const endDateString = endDateForParent.toISOString().slice(0, 10);

      const { error: updateError } = await supabase
        .from('entries')
        .update({
          recurrence_end_date: endDateString,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update parent entry: ${updateError.message}`,
        });
      }

      // 3. 新しい繰り返しエントリを作成
      let newStartTime: string | undefined = undefined;
      let newEndTime: string | undefined = undefined;

      if (parentEntry.start_time) {
        const originalStart = new Date(parentEntry.start_time);
        const newStart = new Date(splitDate);
        newStart.setHours(
          originalStart.getHours(),
          originalStart.getMinutes(),
          originalStart.getSeconds(),
          0,
        );
        newStartTime = overrides?.start_time ?? newStart.toISOString();
      }

      if (parentEntry.end_time) {
        const originalEnd = new Date(parentEntry.end_time);
        const newEnd = new Date(splitDate);
        newEnd.setHours(
          originalEnd.getHours(),
          originalEnd.getMinutes(),
          originalEnd.getSeconds(),
          0,
        );
        newEndTime = overrides?.end_time ?? newEnd.toISOString();
      }

      // EntryServiceを使用してエントリを作成
      const service = createEntryService(supabase);
      let newEntry;

      try {
        newEntry = await service.create({
          userId,
          input: {
            title: overrides?.title ?? parentEntry.title,
            description:
              overrides?.description !== undefined
                ? (overrides.description ?? undefined)
                : (parentEntry.description ?? undefined),
            origin: parentEntry.origin as 'planned' | 'unplanned',
            start_time: newStartTime,
            end_time: newEndTime,
            recurrence_type: parentEntry.recurrence_type as
              | 'none'
              | 'daily'
              | 'weekly'
              | 'monthly'
              | 'yearly'
              | 'weekdays'
              | undefined,
            recurrence_rule: parentEntry.recurrence_rule ?? undefined,
            recurrence_end_date: parentEntry.recurrence_end_date ?? undefined,
            reminder_minutes: parentEntry.reminder_minutes ?? undefined,
          },
          preventOverlappingEntries: false, // 分割時は重複チェックをスキップ
        });
      } catch (createError) {
        // 失敗した場合、親エントリのrecurrence_end_dateを元に戻す
        await supabase
          .from('entries')
          .update({
            recurrence_end_date: parentEntry.recurrence_end_date,
            updated_at: parentEntry.updated_at,
          })
          .eq('id', entryId)
          .eq('user_id', userId);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create new entry: ${createError instanceof Error ? createError.message : 'Unknown error'}`,
        });
      }

      // 4. 親エントリのタグを新エントリにコピー
      const { data: parentTags } = await supabase
        .from('entry_tags')
        .select('tag_id')
        .eq('entry_id', entryId);

      if (parentTags && parentTags.length > 0) {
        const tagInserts = parentTags.map((t) => ({
          entry_id: newEntry.id,
          tag_id: t.tag_id,
          user_id: userId,
        }));

        await supabase.from('entry_tags').insert(tagInserts);
      }

      return {
        parentEntryId: entryId,
        newEntryId: newEntry.id,
        splitDate,
      };
    }),
});
