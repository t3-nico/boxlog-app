/**
 * plan Realtime購読フック
 *
 * @description
 * チケットのDB変更をリアルタイムで検知し、
 * TanStack Queryのキャッシュを自動更新する。
 *
 * 対象テーブル: plans
 *
 * 検知イベント:
 * - INSERT: 新規チケット作成
 * - UPDATE: チケット更新（タイトル、ステータス、タグ等）
 * - DELETE: チケット削除
 *
 * 使用箇所:
 * - Board View（ボードビュー）
 * - Table View（テーブルビュー）
 * - plan Inspector（チケット詳細）
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

'use client'

import { api } from '@/lib/trpc'

import { useRealtimeSubscription } from '@/lib/supabase/realtime/useRealtimeSubscription'
import { usePlanCacheStore } from '../stores/usePlanCacheStore'

interface UsePlanRealtimeOptions {
  /** 購読を有効化するか（デフォルト: true） */
  enabled?: boolean
}

export function usePlanRealtime(userId: string | undefined, options: UsePlanRealtimeOptions = {}) {
  const { enabled = true } = options
  const utils = api.useUtils()
  const isMutating = usePlanCacheStore((state) => state.isMutating)

  useRealtimeSubscription<{ id: string }>({
    channelName: `plan-changes-${userId}`,
    table: 'plans',
    event: '*', // INSERT, UPDATE, DELETE すべて
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled, // enabledオプションを渡す
    onEvent: (payload) => {
      const newRecord = payload.new as { id: string } | undefined
      const oldRecord = payload.old as { id: string } | undefined

      console.debug('[plan Realtime] Event detected:', payload.eventType, newRecord?.id)

      // 自分のmutation中はRealtime経由の更新をスキップ（二重更新防止）
      if (isMutating) {
        console.debug('[plan Realtime] Skipping invalidation (mutation in progress)')
        return
      }

      // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
      // undefined を渡すことで、useplans({}) と useplans(undefined) の両方を無効化
      void utils.plans.list.invalidate(undefined, { refetchType: 'all' })

      // 個別チケットのキャッシュも無効化
      if (newRecord?.id) {
        void utils.plans.getById.invalidate({ id: newRecord.id })
      } else if (oldRecord?.id) {
        void utils.plans.getById.invalidate({ id: oldRecord.id })
      }

      // タグ関連のキャッシュも無効化（タグ変更時に必要）
      void utils.plans.invalidate()
    },
    onError: (error) => {
      console.error('[plan Realtime] Subscription error:', error)
    },
  })
}
