import { unstable_cache } from 'next/cache';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

/**
 * タグキャッシュのTTL（秒）
 * タグは低頻度更新のため5分キャッシュ
 */
const TAG_CACHE_TTL = 300;

/**
 * ユーザーのタグリストキャッシュタグを取得
 *
 * @param userId - ユーザーID
 * @returns キャッシュタグ文字列（revalidateTag用）
 */
export function getUserTagsCacheTag(userId: string): string {
  return `user-tags-${userId}`;
}

/**
 * ユーザーの親タグリストキャッシュタグを取得
 *
 * @param userId - ユーザーID
 * @returns キャッシュタグ文字列（revalidateTag用）
 */
export function getUserParentTagsCacheTag(userId: string): string {
  return `user-parent-tags-${userId}`;
}

/**
 * キャッシュ付きタグリスト取得関数を作成
 *
 * unstable_cache()はサーバーサイドでリクエスト横断のキャッシュを提供。
 * TanStack Queryのクライアントキャッシュと相互補完的に動作。
 *
 * @param supabase - Supabaseクライアント
 * @param userId - ユーザーID
 * @returns キャッシュ付き取得関数
 *
 * @example
 * const getCachedTags = createCachedTagsFetcher(supabase, userId);
 * const tags = await getCachedTags();
 */
export function createCachedTagsFetcher(supabase: SupabaseClient<Database>, userId: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch tags: ${error.message}`);
      }

      return data;
    },
    ['tags', 'list', userId],
    {
      tags: [getUserTagsCacheTag(userId)],
      revalidate: TAG_CACHE_TTL,
    },
  );
}

/**
 * キャッシュ付き親タグリスト取得関数を作成
 *
 * @param supabase - Supabaseクライアント
 * @param userId - ユーザーID
 * @returns キャッシュ付き取得関数
 */
export function createCachedParentTagsFetcher(supabase: SupabaseClient<Database>, userId: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch parent tags: ${error.message}`);
      }

      return data;
    },
    ['tags', 'listParentTags', userId],
    {
      tags: [getUserParentTagsCacheTag(userId), getUserTagsCacheTag(userId)],
      revalidate: TAG_CACHE_TTL,
    },
  );
}
