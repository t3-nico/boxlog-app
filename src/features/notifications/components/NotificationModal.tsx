// @ts-nocheck
// TODO(#389): NotificationModal型エラーを修正後、@ts-nocheckを削除
'use client'

import { useState } from 'react'

import { Bell, BellOff, Calendar, Check, Clock, Settings, X } from 'lucide-react'

import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { useCurrentLocale, useTranslation } from '@/lib/i18n/hooks'
import { cn } from '@/lib/utils'

// import { formatDistanceToNow } from 'date-fns'
// import { ja } from 'date-fns/locale'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const { t } = useTranslation()
  const locale = useCurrentLocale()

  // Mock data - 実際のデータは useNotifications から取得
  const mockNotifications = [
    {
      id: '1',
      title: t('notifications.messages.meetingReminder'),
      message: t('notifications.messages.meetingStartsIn'),
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分前
      read: false,
      type: 'reminder',
    },
    {
      id: '2',
      title: t('notifications.messages.taskCompleted'),
      message: t('notifications.messages.taskCompletedMessage'),
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分前
      read: true,
      type: 'task',
    },
    {
      id: '3',
      title: t('notifications.messages.eventNotification'),
      message: t('notifications.messages.eventAddedMessage'),
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
      read: false,
      type: 'event',
    },
  ]

  const filteredNotifications = activeTab === 'unread' ? mockNotifications.filter((n) => !n.read) : mockNotifications

  if (!isOpen) return null

  return (
    <div
      role="button"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      aria-label={t('notifications.aria.modalBackdrop')}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
        aria-label={t('notifications.aria.closeModal')}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative mx-4 w-full max-w-md',
          'bg-white dark:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-800',
          'shadow-lg ring-1',
          'rounded-lg',
          'transition-all duration-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between',
            'border-b border-neutral-200 dark:border-neutral-800',
            'p-4'
          )}
        >
          <div className="flex items-center gap-2">
            <Bell className={cn('h-5 w-5', 'text-neutral-900 dark:text-neutral-100')} />
            <h1 className={cn('text-3xl font-bold tracking-tight', 'text-neutral-900 dark:text-neutral-100')}>{t('notifications.title')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'rounded-sm',
                'transition-all duration-200'
              )}
            >
              <Settings className={cn('h-4 w-4', 'text-neutral-600 dark:text-neutral-400')} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'rounded-sm',
                'transition-all duration-200'
              )}
            >
              <X className={cn('h-4 w-4', 'text-neutral-600 dark:text-neutral-400')} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={cn('flex border-b border-neutral-200 dark:border-neutral-800')}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 py-2 text-center text-sm',
              activeTab === 'all' ? cn('text-neutral-900 dark:text-neutral-100', 'border-b-2 border-blue-500') : 'text-neutral-600 dark:text-neutral-400',
              'transition-all duration-200'
            )}
          >
            {t('notifications.tabs.all')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={cn(
              'relative flex-1 py-2 text-center text-sm',
              activeTab === 'unread' ? cn('text-neutral-900 dark:text-neutral-100', 'border-b-2 border-blue-500') : 'text-neutral-600 dark:text-neutral-400',
              'transition-all duration-200'
            )}
          >
            {t('notifications.tabs.unread')}
            {mockNotifications.filter((n) => !n.read).length > 0 && (
              <span
                className={cn(
                  'absolute -right-1 -top-1 h-5 w-5',
                  'bg-red-500 text-xs text-white',
                  'flex items-center justify-center',
                  'rounded-full'
                )}
              >
                {mockNotifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className={cn('flex flex-col items-center justify-center py-16', 'text-neutral-600 dark:text-neutral-400')}>
              <BellOff className={cn('h-6 w-6', 'mb-3')} />
              <p className="text-sm">
                {activeTab === 'unread' ? t('notifications.empty.unread') : t('notifications.empty.all')}
              </p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 px-4 py-3',
                    !notification.read && 'bg-blue-50/5',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'transition-all duration-200',
                    'cursor-pointer'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center',
                      'rounded-full',
                      notification.type === 'reminder' && 'bg-orange-100 text-orange-600',
                      notification.type === 'task' && 'bg-green-100 text-green-600',
                      notification.type === 'event' && 'bg-blue-100 text-blue-600'
                    )}
                  >
                    {notification.type === 'reminder' && <Clock className="h-4 w-4" />}
                    {notification.type === 'task' && <Check className="h-4 w-4" />}
                    {notification.type === 'event' && <Calendar className="h-4 w-4" />}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={cn('text-sm font-medium', 'text-neutral-900 dark:text-neutral-100')}>{notification.title}</p>
                        <p className={cn('text-xs', 'text-neutral-600 dark:text-neutral-400', 'mt-0.5')}>{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className={cn('h-2 w-2 rounded-full', 'bg-blue-500', 'mt-2 flex-shrink-0')} />
                      )}
                    </div>
                    <p className={cn('text-xs', 'text-neutral-600 dark:text-neutral-400', 'mt-1')}>
                      {new Date(notification.timestamp).toLocaleTimeString(locale === 'ja' ? 'ja-JP' : 'en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className={cn('border-t px-4 py-3', 'border-neutral-200 dark:border-neutral-800')}>
            <button
              type="button"
              className={cn(
                'w-full py-2 text-sm',
                'text-neutral-900 dark:text-neutral-100',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'rounded-md',
                'transition-all duration-200'
              )}
            >
              {t('notifications.actions.markAllAsRead')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
