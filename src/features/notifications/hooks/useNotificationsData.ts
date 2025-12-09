/**
 * 通知データ取得・操作用カスタムフック
 *
 * @description
 * tRPC APIとの統合。キャッシュ戦略とリトライ設定を適用。
 *
 * @example
 * ```typescript
 * const { data: notifications, isLoading } = useNotificationsList()
 * const { markAsRead } = useNotificationMutations()
 * ```
 */

import { cacheStrategies } from '@/lib/tanstack-query/cache-config'
import { api } from '@/lib/trpc'

/**
 * 通知一覧取得
 *
 * @param params - フィルタパラメータ
 * @param params.is_read - 既読状態でフィルタ
 * @param params.limit - 取得件数上限
 */
export function useNotificationsList(params?: { is_read?: boolean; limit?: number }) {
  return api.notifications.list.useQuery(params, {
    ...cacheStrategies.notifications,
    retry: 1,
  })
}

/**
 * 未読数取得
 *
 * @remarks
 * ヘッダーのバッジ表示に使用。リアルタイム性が重要。
 */
export function useUnreadCount() {
  return api.notifications.unreadCount.useQuery(undefined, {
    ...cacheStrategies.notifications,
    retry: 1,
    refetchInterval: 60 * 1000, // 1分ごとに自動更新
  })
}

/**
 * 通知詳細取得
 *
 * @param id - 通知ID
 */
export function useNotification(id: string) {
  return api.notifications.getById.useQuery(
    { id },
    {
      ...cacheStrategies.notifications,
      retry: 1,
      enabled: !!id,
    }
  )
}

/**
 * 通知操作（既読化・削除）
 *
 * @returns mutation関数群
 */
export function useNotificationMutations() {
  const utils = api.useUtils()

  /**
   * キャッシュ無効化（通知関連の全クエリ）
   */
  const invalidateNotifications = () => {
    void utils.notifications.list.invalidate()
    void utils.notifications.unreadCount.invalidate()
  }

  const markAsRead = api.notifications.markAsRead.useMutation({
    onSuccess: invalidateNotifications,
  })

  const markAllAsRead = api.notifications.markAllAsRead.useMutation({
    onSuccess: invalidateNotifications,
  })

  const deleteNotification = api.notifications.delete.useMutation({
    onSuccess: invalidateNotifications,
  })

  const deleteAllRead = api.notifications.deleteAllRead.useMutation({
    onSuccess: invalidateNotifications,
  })

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  }
}
