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

import { logger } from '@/lib/logger';
import { useRealtimeSubscription } from '@/lib/supabase/realtime/useRealtimeSubscription';
import { api } from '@/lib/trpc';

import { useTagCacheStore } from '../stores/useTagCacheStore';

interface UseTagRealtimeOptions {
  /** 購読を有効化するか（デフォルト: true） */
  enabled?: boolean;
}

export function useTagRealtime(userId: string | undefined, options: UseTagRealtimeOptions = {}) {
  const { enabled = true } = options;
  const utils = api.useUtils();
  const isMutating = useTagCacheStore((state) => state.isMutating);

  useRealtimeSubscription<{ id: string }>({
    channelName: `tag-changes-${userId}`,
    table: 'tags',
    event: '*', // INSERT, UPDATE, DELETE すべて
    ...(userId && { filter: `user_id=eq.${userId}` }),
    ...(enabled !== undefined && { enabled }),
    onEvent: (payload) => {
      const newRecord = payload.new as { id: string } | undefined;
      const oldRecord = payload.old as { id: string } | undefined;

      logger.debug('[Tag Realtime] Event detected:', payload.eventType, newRecord?.id);

      // 自分のmutation中はRealtime経由の更新をスキップ（二重更新防止）
      if (isMutating) {
        logger.debug('[Tag Realtime] Skipping invalidation (mutation in progress)');
        return;
      }

      // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();

      // 個別タグのキャッシュも無効化
      const tagId = newRecord?.id ?? oldRecord?.id;
      if (tagId) {
        void utils.tags.getById.invalidate({ id: tagId });
      }
    },
    onError: (error) => {
      logger.error('[Tag Realtime] Subscription error:', error);
    },
  });
}
