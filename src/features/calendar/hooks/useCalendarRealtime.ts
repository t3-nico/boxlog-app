/**
 * Calendar Realtime購読フック
 *
 * @description
 * カレンダーイベント（プラン）のDB変更をリアルタイムで検知し、
 * TanStack Queryのキャッシュを自動更新する。
 *
 * 対象テーブル: plans（カレンダーで表示されるプラン）
 *
 * 検知イベント:
 * - INSERT: 新規プラン作成
 * - UPDATE: プラン更新（日時変更、ステータス変更等）
 * - DELETE: プラン削除
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

'use client'

import { api } from '@/lib/trpc'

import { useRealtimeSubscription } from '@/lib/supabase/realtime/useRealtimeSubscription'

interface UseCalendarRealtimeOptions {
  /** 購読を有効化するか（デフォルト: true） */
  enabled?: boolean
}

export function useCalendarRealtime(userId: string | undefined, options: UseCalendarRealtimeOptions = {}) {
  const { enabled = true } = options
  const utils = api.useUtils()

  useRealtimeSubscription<{ id: string }>({
    channelName: `calendar-changes-${userId}`,
    table: 'plans',
    event: '*', // INSERT, UPDATE, DELETE すべて
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled, // enabledオプションを渡す
    onEvent: (payload) => {
      const newRecord = payload.new as { id: string } | undefined
      const oldRecord = payload.old as { id: string } | undefined

      console.debug('[Calendar Realtime] Event detected:', payload.eventType, newRecord?.id)

      // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
      // undefined を渡すことで、useplans({}) と useplans(undefined) の両方を無効化
      void utils.plans.list.invalidate(undefined, { refetchType: 'all' })

      // 個別プランのキャッシュも無効化（Inspector等で使用）
      if (newRecord?.id) {
        void utils.plans.getById.invalidate({ id: newRecord.id })
      } else if (oldRecord?.id) {
        void utils.plans.getById.invalidate({ id: oldRecord.id })
      }
    },
    onError: (error) => {
      console.error('[Calendar Realtime] Subscription error:', error)
    },
  })
}
