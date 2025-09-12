
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

export const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case 'system':
      return 'システム'
    case 'feature':
      return '新機能'
    case 'important':
      return '重要'
    default:
      return 'お知らせ'
  }
}

export const formatNotificationDate = (date: string | Date) => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('ja-JP')
  }
  return date.toLocaleDateString('ja-JP')
}

export const checkBrowserNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!checkBrowserNotificationSupport()) {
    console.warn('このブラウザは通知をサポートしていません')
    return 'denied'
  }

  try {
    const result = await Notification.requestPermission()
    return result
  } catch (error) {
    console.error('通知許可の取得に失敗しました:', error)
    return 'denied'
  }
}

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (!checkBrowserNotificationSupport() || Notification.permission !== 'granted') {
    return null
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
      ...options
    })

    // デフォルト10秒後に自動で閉じる
    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  } catch (error) {
    console.error('ブラウザ通知の表示に失敗しました:', error)
    return null
  }
}