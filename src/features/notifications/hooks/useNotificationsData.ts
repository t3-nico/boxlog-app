/**
 * 通知データ取得・操作用カスタムフック
 * tRPC APIとの統合
 */

import { trpc } from '@/lib/trpc/client'

/**
 * 通知一覧取得
 */
export function useNotificationsList(params?: { is_read?: boolean; limit?: number }) {
  return trpc.notifications.list.useQuery(params)
}

/**
 * 未読数取得
 */
export function useUnreadCount() {
  return trpc.notifications.unreadCount.useQuery()
}

/**
 * 通知詳細取得
 */
export function useNotification(id: string) {
  return trpc.notifications.getById.useQuery({ id })
}

/**
 * 通知操作（既読化・削除）
 */
export function useNotificationMutations() {
  const utils = trpc.useUtils()

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      utils.notifications.unreadCount.invalidate()
    },
  })

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      utils.notifications.unreadCount.invalidate()
    },
  })

  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      utils.notifications.unreadCount.invalidate()
    },
  })

  const deleteAllRead = trpc.notifications.deleteAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      utils.notifications.unreadCount.invalidate()
    },
  })

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  }
}
