/**
 * Tag Realtime購読フック
 *
 * @description
 * タグのDB変更をリアルタイムで検知し、
 * TanStack Queryのキャッシュを自動更新する。
 *
 * 対象テーブル: tags
 *
 * 検知イベント:
 * - INSERT: 新規タグ作成
 * - UPDATE: タグ更新（名前、色、アイコン、親子関係等）
 * - DELETE: タグ削除
 *
 * 使用箇所:
 * - Tag Manager（タグ管理画面）
 * - Tag Select（タグ選択ダイアログ）
 * - Ticket Inspector（チケット詳細のタグ選択）
 *
 * @see https://supabase.com/docs/guides/realtime/postgres-changes
 *
 * @example
 * ```tsx
 * // Tag Manager内で使用
 * export function TagManager() {
 *   const { data: user } = useAuth()
 *   useTagRealtime(user?.id)
 *
 *   return <TagList />
 * }
 * ```
 */

'use client';

import { createRealtimeHook } from '@/lib/supabase/realtime/createRealtimeHook';

import { useTagCacheStore } from '../stores/useTagCacheStore';

export const useTagRealtime = createRealtimeHook({
  name: 'tag',
  table: 'tags',
  // mutationCountは参照カウント方式：複数mutation同時実行に対応
  useMutationGuard: () => useTagCacheStore((state) => state.mutationCount) > 0,
  onInvalidate: (utils, payload) => {
    const recordId = payload.new?.id ?? payload.old?.id;

    // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
    void utils.tags.list.invalidate();
    void utils.tags.listParentTags.invalidate();

    // 個別タグのキャッシュも無効化
    if (recordId) {
      void utils.tags.getById.invalidate({ id: recordId });
    }
  },
});
