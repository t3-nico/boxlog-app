'use client'

import { useState } from 'react'

import { BellRing } from 'lucide-react'

import { useTranslation } from '@/features/i18n/lib/hooks'

import { useNotificationTypeLabel } from '../utils/notification-helpers'

interface SystemNotification {
  id: number
  title: string
  content: string
  date: string
  isRead: boolean
  type: 'system' | 'feature' | 'important'
}

const getDefaultNotifications = (t: (key: string) => string): SystemNotification[] => [
  {
    id: 1,
    title: t('notifications.list.sampleNotifications.maintenance.title'),
    content: t('notifications.list.sampleNotifications.maintenance.content'),
    date: '2025-07-08',
    isRead: false,
    type: 'system',
  },
  {
    id: 2,
    title: t('notifications.list.sampleNotifications.newFeature.title'),
    content: t('notifications.list.sampleNotifications.newFeature.content'),
    date: '2025-07-05',
    isRead: true,
    type: 'feature',
  },
  {
    id: 3,
    title: t('notifications.list.sampleNotifications.termsUpdate.title'),
    content: t('notifications.list.sampleNotifications.termsUpdate.content'),
    date: '2025-07-01',
    isRead: true,
    type: 'important',
  },
]

interface NotificationsListProps {
  notifications?: SystemNotification[]
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const { t } = useTranslation()
  const getTypeLabel = useNotificationTypeLabel()
  const defaultNotifications = getDefaultNotifications(t)
  const [notificationList, setNotificationList] = useState(notifications || defaultNotifications)

  const markAsRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification))
    )
  }

  const getTypeColor = (type: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <BellRing className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('notifications.list.title')}</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('notifications.list.description')}</p>
      </div>

      <div className="space-y-4">
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={`border-border bg-card rounded-lg border p-6 shadow-sm ${
              !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {getTypeLabel(notification.type)}
                  </span>
                  {!notification.isRead && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {t('notifications.list.badges.unread')}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                <p className="mb-3 text-gray-700 dark:text-gray-300">{notification.content}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{notification.date}</p>
              </div>
              {!notification.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t('notifications.list.actions.markAsRead')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notificationList.length === 0 && (
        <div className="py-12 text-center">
          <BellRing className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('notifications.list.empty.title')}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('notifications.list.empty.description')}</p>
        </div>
      )}
    </div>
  )
}
