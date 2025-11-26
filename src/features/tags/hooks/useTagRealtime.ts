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

'use client'

import { useQueryClient } from '@tanstack/react-query'

import { useRealtimeSubscription } from '@/lib/supabase/realtime/useRealtimeSubscription'

import { tagKeys } from './use-tags'

interface UseTagRealtimeOptions {
  /** 購読を有効化するか（デフォルト: true） */
  enabled?: boolean
}

export function useTagRealtime(userId: string | undefined, options: UseTagRealtimeOptions = {}) {
  const { enabled = true } = options
  const queryClient = useQueryClient()

  useRealtimeSubscription<{ id: string }>({
    channelName: `tag-changes-${userId}`,
    table: 'tags',
    event: '*', // INSERT, UPDATE, DELETE すべて
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled, // enabledオプションを渡す
    onEvent: (payload) => {
      const newRecord = payload.new as { id: string } | undefined
      const oldRecord = payload.old as { id: string } | undefined

      console.debug('[Tag Realtime] Event detected:', payload.eventType, newRecord?.id)

      // TanStack Queryキャッシュを無効化 → 自動で再フェッチ
      // tagKeys.all を無効化することで、全てのタグ関連クエリを再フェッチ
      queryClient.invalidateQueries({ queryKey: tagKeys.all })

      // 個別タグのキャッシュも無効化
      if (newRecord?.id) {
        queryClient.invalidateQueries({ queryKey: tagKeys.detail(newRecord.id) })
      } else if (oldRecord?.id) {
        queryClient.invalidateQueries({ queryKey: tagKeys.detail(oldRecord.id) })
      }
    },
    onError: (error) => {
      console.error('[Tag Realtime] Subscription error:', error)
    },
  })
}
