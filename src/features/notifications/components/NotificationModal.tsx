'use client'

import { useState } from 'react'

import { Bell, BellOff, Calendar, Check, Clock, Settings, X } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

// import { formatDistanceToNow } from 'date-fns'
// import { ja } from 'date-fns/locale'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const t = useTranslations()
  const locale = useLocale()

  // Mock data - 実際のデータは useNotifications から取得
  const mockNotifications = [
    {
      id: '1',
      title: t('notification.messages.meetingReminder'),
      message: t('notification.messages.meetingStartsIn'),
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分前
      read: false,
      type: 'reminder',
    },
    {
      id: '2',
      title: t('notification.messages.taskCompleted'),
      message: t('notification.messages.taskCompletedMessage'),
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分前
      read: true,
      type: 'task',
    },
    {
      id: '3',
      title: t('notification.messages.eventNotification'),
      message: t('notification.messages.eventAddedMessage'),
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
      aria-label={t('notification.aria.modalBackdrop')}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 bg-black backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
        aria-label={t('notification.aria.closeModal')}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative mx-4 w-full max-w-md',
          'bg-popover',
          'border-border border',
          'shadow-lg ring-1',
          'rounded-xl',
          'transition-all duration-200'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between', 'border-border border-b', 'p-4')}>
          <div className="flex items-center gap-2">
            <Bell className={cn('h-5 w-5', 'text-foreground')} />
            <h1 className={cn('text-3xl font-bold tracking-tight', 'text-foreground')}>{t('notification.title')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'hover:bg-foreground/8',
                'rounded-sm',
                'transition-all duration-200'
              )}
            >
              <Settings className={cn('h-4 w-4', 'text-muted-foreground')} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'hover:bg-foreground/8',
                'rounded-sm',
                'transition-all duration-200'
              )}
            >
              <X className={cn('h-4 w-4', 'text-muted-foreground')} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={cn('border-border flex border-b')}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 py-2 text-center text-sm',
              activeTab === 'all' ? cn('text-foreground', 'border-primary border-b-2') : 'text-muted-foreground',
              'transition-all duration-200'
            )}
          >
            {t('notification.tabs.all')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={cn(
              'relative flex-1 py-2 text-center text-sm',
              activeTab === 'unread' ? cn('text-foreground', 'border-primary border-b-2') : 'text-muted-foreground',
              'transition-all duration-200'
            )}
          >
            {t('notification.tabs.unread')}
            {mockNotifications.filter((n) => !n.read).length > 0 && (
              <span
                className={cn(
                  'absolute -top-1 -right-1 h-5 w-5',
                  'bg-destructive text-destructive-foreground text-xs',
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
            <div className={cn('flex flex-col items-center justify-center py-16', 'text-muted-foreground')}>
              <BellOff className={cn('h-6 w-6', 'mb-3')} />
              <p className="text-sm">
                {activeTab === 'unread' ? t('notification.empty.unread') : t('notification.empty.all')}
              </p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 px-4 py-3',
                    !notification.read && 'bg-muted',
                    'hover:bg-foreground/8',
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
                        <p className={cn('text-sm font-medium', 'text-foreground')}>{notification.title}</p>
                        <p className={cn('text-xs', 'text-muted-foreground', 'mt-0.5')}>{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className={cn('h-2 w-2 rounded-full', 'bg-primary', 'mt-2 flex-shrink-0')} />
                      )}
                    </div>
                    <p className={cn('text-xs', 'text-muted-foreground', 'mt-1')}>
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
          <div className={cn('border-t px-4 py-3', 'border-border')}>
            <button
              type="button"
              className={cn(
                'w-full py-2 text-sm',
                'text-foreground',
                'hover:bg-foreground/8',
                'rounded-md',
                'transition-all duration-200'
              )}
            >
              {t('notification.actions.markAllAsRead')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
