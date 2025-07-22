'use client'

import { useState } from 'react'
import { BellRing } from 'lucide-react'

const notifications = [
  {
    id: 1,
    title: 'システムメンテナンスのお知らせ',
    content: '2025年7月12日（土）2:00-4:00にシステムメンテナンスを実施いたします。',
    date: '2025-07-08',
    isRead: false,
    type: 'system'
  },
  {
    id: 2,
    title: '新機能のご案内',
    content: '新しいタグ機能が追加されました。より効率的な情報整理が可能になります。',
    date: '2025-07-05',
    isRead: true,
    type: 'feature'
  },
  {
    id: 3,
    title: '利用規約の更新',
    content: '利用規約を更新いたしました。変更内容をご確認ください。',
    date: '2025-07-01',
    isRead: true,
    type: 'important'
  }
]

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)

  const markAsRead = (id: number) => {
    setNotificationList(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-blue-600 bg-blue-50'
      case 'feature':
        return 'text-green-600 bg-green-50'
      case 'important':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BellRing className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">お知らせ</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">最新のお知らせや更新情報をご確認いただけます。</p>
      </div>

      <div className="space-y-4">
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 ${
              !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {getTypeLabel(notification.type)}
                  </span>
                  {!notification.isRead && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      未読
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {notification.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{notification.content}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{notification.date}</p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  既読にする
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notificationList.length === 0 && (
        <div className="text-center py-12">
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