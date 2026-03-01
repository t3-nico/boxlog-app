/**
 * Entry Tags Subrouter
 * Individual entry-tag relationship operations: add, remove, set
 *
 * @description
 * 単一エントリへのタグ操作を提供します。
 * 一括操作は bulk.ts の addTags を使用してください。
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

/** エントリ・タグ操作の入力スキーマ */
const entryTagInputSchema = z.object({
  entryId: z.string().uuid(),
  tagId: z.string().uuid(),
});

/** タグ一括設定の入力スキーマ */
const setTagsInputSchema = z.object({
  entryId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()).max(50),
});

export const tagsRouter = createTRPCRouter({
  /**
   * エントリにタグを追加
   * 既存の関連がある場合は無視（upsert動作）
   */
  addTag: protectedProcedure.input(entryTagInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { entryId, tagId } = input;

    // エントリの所有権チェック
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('id')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (entryError || !entry) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'エントリが見つかりません',
      });
    }

    // タグの所有権チェック（名前も取得してアクティビティ記録用）
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

    // 既存の関連をチェック（重複の場合はアクティビティ記録しない）
    const { data: existingRelation } = await supabase
      .from('entry_tags')
      .select('entry_id')
      .eq('entry_id', entryId)
      .eq('tag_id', tagId)
      .eq('user_id', userId)
      .maybeSingle();

    // entry_tagsに追加（upsertで重複を無視）
    const { error } = await supabase.from('entry_tags').upsert(
      {
        user_id: userId,
        entry_id: entryId,
        tag_id: tagId,
      },
      {
        onConflict: 'user_id,entry_id,tag_id',
        ignoreDuplicates: true,
      },
    );

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの追加に失敗しました: ${error.message}`,
      });
    }

    // 新規追加の場合のみアクティビティを記録
    if (!existingRelation) {
      await supabase.from('entry_activities').insert({
        entry_id: entryId,
        user_id: userId,
        action_type: 'tag_added',
        field_name: 'tag',
        new_value: tag.name,
      });
    }

    return { success: true };
  }),

  /**
   * エントリからタグを削除
   */
  removeTag: protectedProcedure.input(entryTagInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { entryId, tagId } = input;

    // エントリの所有権チェック
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('id')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (entryError || !entry) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'エントリが見つかりません',
      });
    }

    // タグ名を取得（アクティビティ記録用）
    const { data: tag } = await supabase
      .from('tags')
      .select('name')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single();

    // entry_tagsから削除
    const { error, count } = await supabase
      .from('entry_tags')
      .delete()
      .eq('entry_id', entryId)
      .eq('tag_id', tagId)
      .eq('user_id', userId);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `タグの削除に失敗しました: ${error.message}`,
      });
    }

    // 削除が成功した場合のみアクティビティを記録
    if ((count ?? 0) > 0 && tag) {
      await supabase.from('entry_activities').insert({
        entry_id: entryId,
        user_id: userId,
        action_type: 'tag_removed',
        field_name: 'tag',
        old_value: tag.name,
      });
    }

    return { success: true, removed: (count ?? 0) > 0 };
  }),

  /**
   * エントリのタグを一括設定（既存タグをすべて置換）
   */
  setTags: protectedProcedure.input(setTagsInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { entryId, tagIds } = input;

    // エントリの所有権チェック
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('id')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (entryError || !entry) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'エントリが見つかりません',
      });
    }

    // 既存のタグIDを取得（アクティビティ記録用）
    const { data: existingRelations } = await supabase
      .from('entry_tags')
      .select('tag_id')
      .eq('entry_id', entryId)
      .eq('user_id', userId);

    const existingTagIds = new Set(existingRelations?.map((r) => r.tag_id) ?? []);

    // タグの所有権チェック
    let validTagsMap = new Map<string, string>(); // id -> name
    if (tagIds.length > 0) {
      const { data: validTags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', tagIds)
        .eq('user_id', userId);

      if (tagsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの検証に失敗しました: ${tagsError.message}`,
        });
      }

      if (!validTags || validTags.length !== tagIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '無効なタグIDが含まれています',
        });
      }

      validTagsMap = new Map(validTags.map((t) => [t.id, t.name]));
    }

    // 追加されたタグを特定
    const addedTagIds = tagIds.filter((id) => !existingTagIds.has(id));

    // 削除されたタグを特定
    const newTagIdSet = new Set(tagIds);
    const removedTagIds = [...existingTagIds].filter((id) => !newTagIdSet.has(id));

    // 削除されるタグの名前を取得
    let removedTagsMap = new Map<string, string>();
    if (removedTagIds.length > 0) {
      const { data: removedTags } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', removedTagIds)
        .eq('user_id', userId);

      if (removedTags) {
        removedTagsMap = new Map(removedTags.map((t) => [t.id, t.name]));
      }
    }

    // 既存の関連をすべて削除
    const { error: deleteError } = await supabase
      .from('entry_tags')
      .delete()
      .eq('entry_id', entryId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `既存タグの削除に失敗しました: ${deleteError.message}`,
      });
    }

    // 新しい関連を追加
    if (tagIds.length > 0) {
      const entryTagsToInsert = tagIds.map((tagId) => ({
        user_id: userId,
        entry_id: entryId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase.from('entry_tags').insert(entryTagsToInsert);

      if (insertError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `タグの設定に失敗しました: ${insertError.message}`,
        });
      }
    }

    // 追加されたタグのアクティビティを記録
    if (addedTagIds.length > 0) {
      const activityRecords = addedTagIds.map((tagId) => ({
        entry_id: entryId,
        user_id: userId,
        action_type: 'tag_added' as const,
        field_name: 'tag',
        new_value: validTagsMap.get(tagId) ?? tagId,
      }));

      await supabase.from('entry_activities').insert(activityRecords);
    }

    // 削除されたタグのアクティビティを記録
    if (removedTagIds.length > 0) {
      const removedActivityRecords = removedTagIds.map((tagId) => ({
        entry_id: entryId,
        user_id: userId,
        action_type: 'tag_removed' as const,
        field_name: 'tag',
        old_value: removedTagsMap.get(tagId) ?? tagId,
      }));

      await supabase.from('entry_activities').insert(removedActivityRecords);
    }

    return { success: true, count: tagIds.length };
  }),
});
