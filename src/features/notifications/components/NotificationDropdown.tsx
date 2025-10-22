'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/features/i18n/lib/hooks'

/**
 * 通知ドロップダウンコンポーネント
 *
 * - ベルアイコンをクリックして開くドロップダウンメニュー形式
 * - 未読バッジ表示
 * - スクロール可能な通知リスト
 */
interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  // TODO: 実際のデータに置き換える
  const mockNotifications = [
    {
      id: '1',
      title: t('notifications.messages.meetingReminder'),
      message: t('notifications.messages.meetingStartsIn'),
      time: '5分前',
      isRead: false,
    },
    {
      id: '2',
      title: t('notifications.messages.taskCompleted'),
      message: t('notifications.messages.taskCompletedMessage'),
      time: '1時間前',
      isRead: false,
    },
    {
      id: '3',
      title: t('notifications.messages.eventNotification'),
      message: t('notifications.messages.eventAddedMessage'),
      time: '2時間前',
      isRead: true,
    },
  ]

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent data-[state=open]:bg-accent relative flex h-10 w-10 items-center justify-center rounded-lg outline-hidden"
          aria-label={t('notifications.title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute top-0.5 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-input min-w-80 rounded-lg" side="right" align="start" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <span className="font-semibold">{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="mr-2 h-auto p-0 text-xs hover:underline">
              {t('notifications.actions.markAllAsRead')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockNotifications.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">{t('notifications.empty.all')}</div>
        ) : (
          <ScrollArea className="h-[400px]">
            <DropdownMenuGroup>
              {mockNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex cursor-pointer flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center gap-2">
                    <span className="flex-1 text-sm font-medium">{notification.title}</span>
                    {!notification.isRead && (
                      <span className="bg-primary h-2 w-2 shrink-0 rounded-full" aria-label="未読" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">{notification.message}</p>
                  <span className="text-muted-foreground text-xs">{notification.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
