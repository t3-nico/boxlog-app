// @ts-nocheck TODO(#389): 型エラー7件を段階的に修正する
import { useTranslation } from '@/features/i18n/lib/hooks'

export const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'system':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
    case 'feature':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
    case 'important':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800'
  }
}

export const useNotificationTypeLabel = () => {
  const t = useTranslation()

  return (type: string) => {
    switch (type) {
      case 'system':
        return t('notifications.types.system')
      case 'feature':
        return t('notifications.types.feature')
      case 'important':
        return t('notifications.types.important')
      case 'reminder':
        return t('notifications.types.reminder')
      case 'task':
        return t('notifications.types.task')
      case 'event':
        return t('notifications.types.event')
      default:
        return t('notifications.types.general')
    }
  }
}

export const formatNotificationDate = (date: string | Date, locale: string = 'ja-JP') => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString(locale)
  }
  return date.toLocaleDateString(locale)
}

export const checkBrowserNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window
}

export const requestNotificationPermission = async (t?: (key: string) => string): Promise<NotificationPermission> => {
  if (!checkBrowserNotificationSupport()) {
    const message = t
      ? t('notifications.errors.notSupported')
      : 'このブラウザは通知をサポートしていません'
    console.warn(message)
    return 'denied'
  }

  try {
    const result = await Notification.requestPermission()
    return result
  } catch (error) {
    const message = t ? t('notifications.errors.permissionFailed') : '通知許可の取得に失敗しました'
    console.error(message, error)
    return 'denied'
  }
}

export const showBrowserNotification = (title: string, options?: NotificationOptions, t?: (key: string) => string) => {
  if (!checkBrowserNotificationSupport() || Notification.permission !== 'granted') {
    return null
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
      ...options,
    })

    // デフォルト10秒後に自動で閉じる
    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  } catch (error) {
    const message = t ? t('notifications.errors.displayFailed') : 'ブラウザ通知の表示に失敗しました'
    console.error(message, error)
    return null
  }
}
