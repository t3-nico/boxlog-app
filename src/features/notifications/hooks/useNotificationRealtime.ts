/**
 * Supabase Realtime通知購読フック
 * 新しい通知をリアルタイムで検知してToast表示
 */

'use client'

import { useEffect, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'

import { useNotificationDialogStore } from '../stores/useNotificationDialogStore'

interface NotificationPayload {
  id: string
  title: string
  message: string | null
  type: string
  priority: string
  created_at: string
  user_id: string
}

export function useNotificationRealtime(userId: string | undefined, enabled = true) {
  const { open } = useNotificationDialogStore()
  const utils = trpc.useUtils()
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (!enabled || !userId) return

    const supabase = createClient()

    // Realtimeチャンネルを購読
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as NotificationPayload

          // Toast表示（既存のToastシステムを使用）
          toast.info(notification.title, {
            description: notification.message || undefined,
            duration: 5000,
          })

          // tRPCキャッシュを無効化して最新データを取得
          utils.notifications.list.invalidate()
          utils.notifications.unreadCount.invalidate()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [userId, enabled, open, utils])
}
