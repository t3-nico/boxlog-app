'use client'

import { useState } from 'react'

import { BellRing } from 'lucide-react'

interface SystemNotification {
  id: number
  title: string
  content: string
  date: string
  isRead: boolean
  type: 'system' | 'feature' | 'important'
}

const defaultNotifications: SystemNotification[] = [
  {
    id: 1,
    title: 'システムメンテナンスのお知らせ',
    content: '2025年7月12日（土）2:00-4:00にシステムメンテナンスを実施いたします。',
    date: '2025-07-08',
    isRead: false,
    type: 'system',
  },
  {
    id: 2,
    title: '新機能のご案内',
    content: '新しいタグ機能が追加されました。より効率的な情報整理が可能になります。',
    date: '2025-07-05',
    isRead: true,
    type: 'feature',
  },
  {
    id: 3,
    title: '利用規約の更新',
    content: '利用規約を更新いたしました。変更内容をご確認ください。',
    date: '2025-07-01',
    isRead: true,
    type: 'important',
  },
]

interface NotificationsListProps {
  notifications?: SystemNotification[]
}

export const NotificationsList: React.FC<NotificationsListProps> = ({ notifications = defaultNotifications }) => {
  const [notificationList, setNotificationList] = useState(notifications)

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

  const getTypeLabel = (type: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <BellRing className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">お知らせ</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">最新のお知らせや更新情報をご確認いただけます。</p>
      </div>

      <div className="space-y-4">
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${
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
                      未読
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
                  既読にする
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notificationList.length === 0 && (
        <div className="py-12 text-center">
          <BellRing className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">お知らせはありません</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            新しいお知らせが投稿されるとここに表示されます。
          </p>
        </div>
      )}
    </div>
  )
}
