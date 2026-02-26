/**
 * plan Realtime購読フック
 *
 * @description
 * プランのDB変更をリアルタイムで検知し、
 * TanStack Queryのキャッシュを自動更新する。
 *
 * 対象テーブル: plans
 *
 * 検知イベント:
 * - INSERT: 新規プラン作成
 * - UPDATE: プラン更新（タイトル、ステータス、タグ等）
 * - DELETE: プラン削除
 *
 * 使用箇所:
 * - Board View（ボードビュー）
 * - Table View（テーブルビュー）
 * - plan Inspector（プラン詳細）
 *
 * @see https://supabase.com/docs/guides/realtime/postgres-changes
 *
 * @example
 * ```tsx
 * // Board View内で使用
 * export function BoardView() {
 *   const { data: user } = useAuth()
 *   usePlanRealtime(user?.id)
 *
 *   return <Board />
 * }
 * ```
 */

'use client';

import { createRealtimeHook } from '@/lib/supabase/realtime/createRealtimeHook';

import { usePlanCacheStore } from '@/stores/usePlanCacheStore';

export const usePlanRealtime = createRealtimeHook({
  name: 'plan',
  table: 'plans',
  useMutationGuard: () => usePlanCacheStore((state) => state.isMutating),
  onInvalidate: (utils, payload) => {
    const recordId = payload.new?.id ?? payload.old?.id;

    // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
    void utils.plans.list.invalidate(undefined, { refetchType: 'all' });

    // 個別プランのキャッシュも無効化
    if (recordId) {
      void utils.plans.getById.invalidate({ id: recordId });
    }

    // タグ関連のキャッシュも無効化（タグ変更時に必要）
    void utils.plans.invalidate();
  },
});
