'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { useI18n } from '@/features/i18n/lib/hooks'

import { useNotificationsList, useUnreadCount } from '../hooks/useNotificationsData'
import { useNotificationDialogStore } from '../stores/useNotificationDialogStore'

/**
 * 通知ドロップダウンコンポーネント
 *
 * - ベルアイコンをクリックするとNotificationDialogを開く
 * - 未読バッジ表示（実データ）
 * - ホバー時に最新3件のプレビュー表示（HoverCard使用）
 */
interface NotificationDropdownProps {
  className?: string
}

// プレビューに表示する最大件数
const PREVIEW_LIMIT = 3

export function NotificationDropdown({ className: _className }: NotificationDropdownProps) {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const dateLocale = localeFromPath === 'ja' ? ja : enUS

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: recentNotifications = [] } = useNotificationsList({ limit: PREVIEW_LIMIT })
  const { open } = useNotificationDialogStore()

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: dateLocale })
    } catch {
      return timestamp
    }
  }

  // プレビュー用の通知（最新3件）
  const previewNotifications = recentNotifications.slice(0, PREVIEW_LIMIT) as Array<{
    id: string
    title: string
    is_read: boolean
    created_at: string
  }>

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={open}
          className="hover:bg-accent data-[state=open]:bg-accent relative flex h-10 w-10 items-center justify-center rounded-xl outline-hidden"
          aria-label={t('notifications.title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute top-0.5 right-0 flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="w-72 rounded-xl p-0"
        sideOffset={8}
      >
        {/* ヘッダー */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">{t('notifications.title')}</span>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {unreadCount}
            </span>
          )}
        </div>

        {/* 通知プレビュー */}
        <div className="max-h-64 overflow-y-auto">
          {previewNotifications.length === 0 ? (
            <div className="text-muted-foreground px-4 py-6 text-center text-sm">
              {t('notifications.empty.all')}
            </div>
          ) : (
            <div className="divide-border divide-y">
              {previewNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 ${!notification.is_read ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <p className="flex-1 truncate text-sm font-medium">{notification.title}</p>
                    {!notification.is_read && (
                      <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="border-border border-t px-4 py-2">
          <button
            type="button"
            onClick={open}
            className="text-primary hover:text-primary/80 w-full text-center text-sm font-medium"
          >
            {t('notifications.actions.viewAll')}
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
