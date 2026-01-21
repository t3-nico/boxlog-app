'use server';

import { revalidateTag } from 'next/cache';

import { getUserParentTagsCacheTag, getUserTagsCacheTag } from './tag-cache';

/**
 * ユーザーのタグキャッシュを無効化
 *
 * タグのmutation（create/update/delete/merge/reorder）後に呼び出す。
 * これにより次のリクエストで最新データがDBから取得される。
 *
 * @param userId - ユーザーID
 *
 * @example
 * // tRPCルーターで使用
 * await service.create({ ... });
 * await invalidateUserTagsCache(ctx.userId!);
 */
export async function invalidateUserTagsCache(userId: string): Promise<void> {
  revalidateTag(getUserTagsCacheTag(userId));
  revalidateTag(getUserParentTagsCacheTag(userId));
}

/**
 * ユーザーの親タグキャッシュのみを無効化
 *
 * 親タグ構造に影響する操作（親変更など）後に呼び出す。
 *
 * @param userId - ユーザーID
 */
export async function invalidateUserParentTagsCache(userId: string): Promise<void> {
  revalidateTag(getUserParentTagsCacheTag(userId));
}
