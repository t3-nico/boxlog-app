'use client'

import { useCallback, useEffect, useState } from 'react'

import type { CalendarEvent } from '@/features/calendar/types/calendar.types'

interface UseNotificationsOptions {
  events: CalendarEvent[]
  onReminderTriggered?: (event: CalendarEvent) => void
}

interface UseNotificationsReturn {
  permission: NotificationPermission
  hasRequested: boolean
  requestPermission: () => Promise<void>
}

/**
 * ブラウザ通知を管理するフック
 *
 * @param options - 通知オプション
 * @param options.events - 監視対象のイベント配列
 * @param options.onReminderTriggered - リマインダーがトリガーされた時のコールバック
 * @returns 通知の権限状態と権限リクエスト関数
 *
 * @example
 * ```tsx
 * const { permission, hasRequested, requestPermission } = useNotifications({
 *   events: calendarEvents,
 *   onReminderTriggered: (event) => {
 *     console.log('Reminder for:', event.title)
 *   },
 * })
 * ```
 */
export function useNotifications({ events, onReminderTriggered }: UseNotificationsOptions): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [hasRequested, setHasRequested] = useState(false)

  // 初回マウント時に現在の通知権限を取得
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      // localStorage から権限リクエスト履歴を取得
      const requested = localStorage.getItem('notification-permission-requested')
      setHasRequested(requested === 'true')
    }
  }, [])

  // 通知権限をリクエストする関数
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setHasRequested(true)
      localStorage.setItem('notification-permission-requested', 'true')
    } catch (error) {
      console.error('通知権限のリクエストに失敗しました:', error)
    }
  }, [])

  // イベントのリマインダーを監視（将来の実装用）
  useEffect(() => {
    if (permission !== 'granted' || events.length === 0) {
      return
    }

    // TODO: イベントのリマインダー時刻を監視し、適切なタイミングで通知を表示
    // 現在はプレースホルダー実装

    const checkReminders = () => {
      const now = new Date()
      events.forEach((event) => {
        // イベント開始15分前に通知（例）
        if (!event.start) return
        const eventStart = new Date(event.start)
        const reminderTime = new Date(eventStart.getTime() - 15 * 60 * 1000)

        if (now >= reminderTime && now < eventStart) {
          // リマインダーをトリガー
          if (onReminderTriggered) {
            onReminderTriggered(event)
          }
        }
      })
    }

    // 1分ごとにチェック（本番では間隔を調整）
    const intervalId = setInterval(checkReminders, 60 * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [permission, events, onReminderTriggered])

  return {
    permission,
    hasRequested,
    requestPermission,
  }
}
