import { useEffect, useRef, useState, useCallback } from 'react'
import { Event, Reminder } from '@/features/events'

interface NotificationPermissionState {
  status: NotificationPermission
  hasRequested: boolean
}

interface UseNotificationsOptions {
  events: Event[]
  onReminderTriggered?: (event: Event, reminder: Reminder) => void
}

export const useNotifications = ({ events, onReminderTriggered }: UseNotificationsOptions) => {
  const [permission, setPermission] = useState<NotificationPermissionState>({
    status: 'default',
    hasRequested: false
  })
  const [visibleNotifications, setVisibleNotifications] = useState<Array<{
    id: string
    eventId: string
    title: string
    message: string
    timestamp: Date
  }>>([])
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const triggeredRemindersRef = useRef<Set<string>>(new Set())

  // 通知許可の取得
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission({ status: result, hasRequested: true })
      return result
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error)
      setPermission({ status: 'denied', hasRequested: true })
      return 'denied'
    }
  }

  // 通知の表示
  const showNotification = useCallback((event: Event, reminder: Reminder) => {
    const title = `リマインダー: ${event.title}`
    const message = `${reminder.minutesBefore}分前の通知です`
    
    // ブラウザ通知
    if (permission.status === 'granted') {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `reminder-${event.id}-${reminder.id}`,
          requireInteraction: true
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // 10秒後に自動で閉じる
        setTimeout(() => {
          notification.close()
        }, 10000)
      } catch (error) {
        console.error('ブラウザ通知の表示に失敗しました:', error)
        // フォールバック: 画面内通知
        showInAppNotification(event, reminder, title, message)
      }
    } else {
      // 通知が拒否されている場合は画面内通知
      showInAppNotification(event, reminder, title, message)
    }

    // コールバック実行
    onReminderTriggered?.(event, reminder)
  }, [permission.status, onReminderTriggered])

  // 画面内通知の表示
  const showInAppNotification = (event: Event, reminder: Reminder, title: string, message: string) => {
    const notification = {
      id: `${event.id}-${reminder.id}-${Date.now()}`,
      eventId: event.id,
      title,
      message,
      timestamp: new Date()
    }

    setVisibleNotifications(prev => [...prev, notification])

    // 10秒後に自動で削除
    setTimeout(() => {
      setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 10000)
  }

  // リマインダーのチェック
  const checkReminders = useCallback(() => {
    const now = new Date()
    
    events.forEach(event => {
      if (!event.startDate || !event.reminders?.length) return

      event.reminders.forEach(reminder => {
        const reminderKey = `${event.id}-${reminder.id}`
        
        // 既にトリガー済みの場合はスキップ
        if (triggeredRemindersRef.current.has(reminderKey)) return

        // 通知時刻の計算
        const notificationTime = new Date(event.startDate!.getTime() - (reminder.minutesBefore * 60 * 1000))
        
        // 通知時刻を過ぎているかチェック
        if (now >= notificationTime) {
          triggeredRemindersRef.current.add(reminderKey)
          showNotification(event, reminder)
        }
      })
    })
  }, [events, showNotification])

  // 画面内通知の削除
  const dismissNotification = (notificationId: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  // すべての画面内通知をクリア
  const clearAllNotifications = () => {
    setVisibleNotifications([])
  }

  // Page Visibility API でタブ復帰時の再チェック
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // タブが復帰した時に即座にチェック
        checkReminders()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [checkReminders])

  // 通知権限の初期化（マウント時のみ）
  useEffect(() => {
    if ('Notification' in window) {
      setPermission({ 
        status: Notification.permission, 
        hasRequested: Notification.permission !== 'default' 
      })
    }
  }, [])

  // 定期チェック（1分ごと）
  useEffect(() => {
    // 初回チェック
    checkReminders()

    // 1分ごとの定期チェック
    intervalRef.current = setInterval(checkReminders, 60000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkReminders])

  // eventsが変更された時にトリガー済みリストをクリア
  useEffect(() => {
    triggeredRemindersRef.current.clear()
  }, [events])

  return {
    permission: permission.status,
    hasRequested: permission.hasRequested,
    visibleNotifications,
    requestPermission,
    dismissNotification,
    clearAllNotifications,
    isSupported: typeof window !== 'undefined' && 'Notification' in window
  }
}