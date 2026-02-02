/**
 * Plan Tags Subrouter
 * Individual plan-tag relationship operations: add, remove, set
 *
 * @description
 * 単一プランへのタグ操作を提供します。
 * 一括操作は bulk.ts の addTags を使用してください。
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

/** プラン・タグ操作の入力スキーマ */
const planTagInputSchema = z.object({
  planId: z.string().uuid(),
  tagId: z.string().uuid(),
});

/** タグ一括設定の入力スキーマ */
const setTagsInputSchema = z.object({
  planId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()),
});

export const tagsRouter = createTRPCRouter({
  /**
   * プランにタグを追加
   * 既存の関連がある場合は無視（upsert動作）
   */
  addTag: protectedProcedure.input(planTagInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { planId, tagId } = input;

    // プランの所有権チェック
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'プランが見つかりません',
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
      .from('plan_tags')
      .select('plan_id')
      .eq('plan_id', planId)
      .eq('tag_id', tagId)
      .eq('user_id', userId)
      .maybeSingle();

    // plan_tagsに追加（upsertで重複を無視）
    const { error } = await supabase.from('plan_tags').upsert(
      {
        user_id: userId,
        plan_id: planId,
        tag_id: tagId,
      },
      {
        onConflict: 'user_id,plan_id,tag_id',
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
      await supabase.from('plan_activities').insert({
        plan_id: planId,
        user_id: userId,
        action_type: 'tag_added',
        field_name: 'tag',
        new_value: tag.name,
      });
    }

    return { success: true };
  }),

  /**
   * プランからタグを削除
   */
  removeTag: protectedProcedure.input(planTagInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { planId, tagId } = input;

    // プランの所有権チェック
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'プランが見つかりません',
      });
    }

    // タグ名を取得（アクティビティ記録用）
    const { data: tag } = await supabase
      .from('tags')
      .select('name')
      .eq('id', tagId)
      .eq('user_id', userId)
      .single();

    // plan_tagsから削除
    const { error, count } = await supabase
      .from('plan_tags')
      .delete()
      .eq('plan_id', planId)
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
      await supabase.from('plan_activities').insert({
        plan_id: planId,
        user_id: userId,
        action_type: 'tag_removed',
        field_name: 'tag',
        old_value: tag.name,
      });
    }

    return { success: true, removed: (count ?? 0) > 0 };
  }),

  /**
   * プランのタグを一括設定（既存タグをすべて置換）
   */
  setTags: protectedProcedure.input(setTagsInputSchema).mutation(async ({ ctx, input }) => {
    const { supabase, userId } = ctx;
    const { planId, tagIds } = input;

    // プランの所有権チェック
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (planError || !plan) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'プランが見つかりません',
      });
    }

    // 既存のタグIDを取得（アクティビティ記録用）
    const { data: existingRelations } = await supabase
      .from('plan_tags')
      .select('tag_id')
      .eq('plan_id', planId)
      .eq('user_id', userId);

    const existingTagIds = new Set(existingRelations?.map((r) => r.tag_id) ?? []);

    // タグの所有権チェック（指定されたタグがすべてユーザーのものか確認）
    // タグ名も取得してアクティビティ記録用
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

    // 追加されたタグを特定（新しいリストにあるが既存にない）
    const addedTagIds = tagIds.filter((id) => !existingTagIds.has(id));

    // 削除されたタグを特定（既存にあるが新しいリストにない）
    const newTagIdSet = new Set(tagIds);
    const removedTagIds = [...existingTagIds].filter((id) => !newTagIdSet.has(id));

    // 削除されるタグの名前を取得（アクティビティ記録用）
    let removedTagsMap = new Map<string, string>(); // id -> name
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
      .from('plan_tags')
      .delete()
      .eq('plan_id', planId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `既存タグの削除に失敗しました: ${deleteError.message}`,
      });
    }

    // 新しい関連を追加
    if (tagIds.length > 0) {
      const planTagsToInsert = tagIds.map((tagId) => ({
        user_id: userId,
        plan_id: planId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase.from('plan_tags').insert(planTagsToInsert);

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
        plan_id: planId,
        user_id: userId,
        action_type: 'tag_added' as const,
        field_name: 'tag',
        new_value: validTagsMap.get(tagId) ?? tagId,
      }));

      await supabase.from('plan_activities').insert(activityRecords);
    }

    // 削除されたタグのアクティビティを記録
    if (removedTagIds.length > 0) {
      const removedActivityRecords = removedTagIds.map((tagId) => ({
        plan_id: planId,
        user_id: userId,
        action_type: 'tag_removed' as const,
        field_name: 'tag',
        old_value: removedTagsMap.get(tagId) ?? tagId,
      }));

      await supabase.from('plan_activities').insert(removedActivityRecords);
    }

    return { success: true, count: tagIds.length };
  }),
});
