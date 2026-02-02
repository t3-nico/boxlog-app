/**
 * Calendar Realtime購読フック
 *
 * @description
 * カレンダーイベント（チケット）のDB変更をリアルタイムで検知し、
 * TanStack Queryのキャッシュを自動更新する。
 *
 * 対象テーブル: tickets（カレンダーで表示されるチケット）
 *
 * 検知イベント:
 * - INSERT: 新規チケット作成
 * - UPDATE: チケット更新（日時変更、ステータス変更等）
 * - DELETE: チケット削除
 *
 * @see https://supabase.com/docs/guides/realtime/postgres-changes
 *
 * @example
 * ```tsx
 * // CalendarView内で使用
 * export function CalendarView() {
 *   const { data: user } = useAuth()
 *   useCalendarRealtime(user?.id)
 *
 *   return <Calendar />
 * }
 * ```
 */

'use client';

import { createRealtimeHook } from '@/lib/supabase/realtime/createRealtimeHook';

import { usePlanCacheStore } from '@/features/plans/stores/usePlanCacheStore';

export const useCalendarRealtime = createRealtimeHook({
  name: 'calendar',
  table: 'tickets',
  useMutationGuard: () => usePlanCacheStore((state) => state.isMutating),
  onInvalidate: (utils, payload) => {
    const recordId = payload.new?.id ?? payload.old?.id;

    // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
    void utils.plans.list.invalidate(undefined, { refetchType: 'all' });

    // 個別プランのキャッシュも無効化（Inspector等で使用）
    if (recordId) {
      void utils.plans.getById.invalidate({ id: recordId });
    }
  },
  // エラーはサイレントに処理
  onError: () => {},
});
