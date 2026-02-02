/**
 * Record Tags Subrouter
 * Individual record-tag relationship operations: add, remove, set
 *
 * @description
 * 単一Recordへのタグ操作を提供します。
 * plan_tagsと同じパターンで実装。
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import {
  recordTagAddedActivity,
  recordTagRemovedActivity,
} from '@/server/utils/record-activity-tracker';

/** レコード・タグ操作の入力スキーマ */
const recordTagInputSchema = z.object({
  recordId: z.string().uuid(),
  tagId: z.string().uuid(),
});

/** タグ一括設定の入力スキーマ */
const setTagsInputSchema = z.object({
  recordId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()),
});

export const recordTagsRouter = createTRPCRouter({
  /**
   * レコードにタグを追加
   * 既存の関連がある場合は無視（upsert動作）
   */
  addTag: protectedProcedure.input(recordTagInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { recordId, tagId } = input;

    // レコードの所有権チェック
    const { data: record, error: recordError } = await supabase
      .from('records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (recordError || !record) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'レコードが見つかりません',
      });
    }

    // タグの所有権チェック
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single();

    if (tagError || !tag) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'タグが見つかりません',
      });
    }

    // record_tagsに追加（upsertで重複を無視）
    const { error } = await supabase.from('record_tags').upsert(
      {
        user_id: userId,
        record_id: recordId,
        tag_id: tagId,
      },
      {
        onConflict: 'record_id,tag_id',
        ignoreDuplicates: true,
      },
    );

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの追加に失敗しました: ${error.message}`,
      });
    }

    // アクティビティを記録
    await recordTagAddedActivity(supabase, recordId, userId, tag.name);

    return { success: true };
  }),

  /**
   * レコードからタグを削除
   */
  removeTag: protectedProcedure.input(recordTagInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { recordId, tagId } = input;

    // レコードの所有権チェック
    const { data: record, error: recordError } = await supabase
      .from('records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (recordError || !record) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'レコードが見つかりません',
      });
    }

    // タグ名を取得（アクティビティ記録用）
    const { data: tag } = await supabase
      .from('tags')
      .select('name')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single();

    // record_tagsから削除
    const { error, count } = await supabase
      .from('record_tags')
      .delete()
      .eq('record_id', recordId)
      .eq('tag_id', tagId)
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの削除に失敗しました: ${error.message}`,
      });
    }

    // アクティビティを記録（タグが実際に削除された場合のみ）
    if ((count ?? 0) > 0 && tag) {
      await recordTagRemovedActivity(supabase, recordId, userId, tag.name);
    }

    return { success: true, removed: (count ?? 0) > 0 };
  }),

  /**
   * レコードのタグを一括設定（既存タグをすべて置換）
   */
  setTags: protectedProcedure.input(setTagsInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { recordId, tagIds } = input;

    // レコードの所有権チェック
    const { data: record, error: recordError } = await supabase
      .from('records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (recordError || !record) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'レコードが見つかりません',
      });
    }

    // 既存タグを取得（アクティビティ記録用）
    const { data: existingTags } = await supabase
      .from('record_tags')
      .select('tag_id')
      .eq('record_id', recordId)
      .eq('user_id', userId);

    const existingTagIds = new Set(existingTags?.map((t) => t.tag_id) ?? []);
    const newTagIds = new Set(tagIds);

    // 追加されるタグと削除されるタグを計算
    const addedTagIds = tagIds.filter((id) => !existingTagIds.has(id));
    const removedTagIds = [...existingTagIds].filter((id) => !newTagIds.has(id));

    // タグの所有権チェック（指定されたタグがすべてユーザーのものか確認）
    let tagNameMap = new Map<string, string>();
    if (tagIds.length > 0 || removedTagIds.length > 0) {
      const allTagIds = [...new Set([...tagIds, ...removedTagIds])];
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', allTagIds)
        .eq('user_id', userId);

      if (tagsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの検証に失敗しました: ${tagsError.message}`,
        });
      }

      if (!tags || tags.length < tagIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '無効なタグIDが含まれています',
        });
      }

      tagNameMap = new Map(tags.map((t) => [t.id, t.name]));
    }

    // 既存の関連をすべて削除
    const { error: deleteError } = await supabase
      .from('record_tags')
      .delete()
      .eq('record_id', recordId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `既存タグの削除に失敗しました: ${deleteError.message}`,
      });
    }

    // 新しい関連を追加
    if (tagIds.length > 0) {
      const recordTagsToInsert = tagIds.map((tagId) => ({
        user_id: userId,
        record_id: recordId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase.from('record_tags').insert(recordTagsToInsert);

      if (insertError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの設定に失敗しました: ${insertError.message}`,
        });
      }
    }

    // アクティビティを記録
    for (const tagId of addedTagIds) {
      const tagName = tagNameMap.get(tagId);
      if (tagName) {
        await recordTagAddedActivity(supabase, recordId, userId, tagName);
      }
    }
    for (const tagId of removedTagIds) {
      const tagName = tagNameMap.get(tagId);
      if (tagName) {
        await recordTagRemovedActivity(supabase, recordId, userId, tagName);
      }
    }

    return { success: true, count: tagIds.length };
  }),
});
