/**
 * Entry Realtime購読フック
 *
 * @description
 * エントリ（entries テーブル）のDB変更をリアルタイムで検知し、
 * TanStack Queryのキャッシュを自動更新する。
 *
 * 対象テーブル: entries
 *
 * 検知イベント:
 * - INSERT: 新規エントリ作成
 * - UPDATE: エントリ更新（タイトル、時間、タグ等）
 * - DELETE: エントリ削除
 *
 * @see https://supabase.com/docs/guides/realtime/postgres-changes
 */

'use client';

import { useEntryCacheStore } from '@/features/entry';
import { createRealtimeHook } from '@/platform/supabase/realtime/createRealtimeHook';

export const useEntryRealtime = createRealtimeHook({
  name: 'entry',
  table: 'entries',
  useMutationGuard: () => useEntryCacheStore((state) => state.isMutating),
  onInvalidate: (utils, payload) => {
    const recordId = payload.new?.id ?? payload.old?.id;

    // entries.list キャッシュを無効化 → カレンダー等の全ビューが再フェッチ
    void utils.entries.list.invalidate(undefined, { refetchType: 'all' });

    // 個別エントリのキャッシュも無効化（Inspector等で使用）
    if (recordId) {
      void utils.entries.getById.invalidate({ id: recordId });
    }

    // 繰り返しインスタンスも無効化
    void utils.entries.getInstances.invalidate();
  },
});
