'use client'

import { useCallback, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, CheckCheck, Loader2, Settings, Trash2 } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import type { NotificationType } from '@/schemas/notifications'

import { useNotificationMutations, useNotificationsList, useUnreadCount } from '../hooks/useNotificationsData'
import { groupNotificationsByDate } from '../utils/notification-helpers'
import { NotificationItem } from './NotificationItem'

// 通知の型定義
interface NotificationData {
  id: string
  type: NotificationType
  title: string
  message: string | null
  is_read: boolean
  created_at: string
  action_url?: string | null
}

// フィルターの選択肢
const TYPE_FILTER_OPTIONS: Array<{ value: NotificationType | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'notifications.types.all' },
  { value: 'reminder', labelKey: 'notifications.types.reminder' },
  { value: 'plan_created', labelKey: 'notifications.types.plan_created' },
  { value: 'plan_updated', labelKey: 'notifications.types.plan_updated' },
  { value: 'plan_completed', labelKey: 'notifications.types.plan_completed' },
  { value: 'trash_warning', labelKey: 'notifications.types.trash_warning' },
  { value: 'system', labelKey: 'notifications.types.system' },
]

interface NotificationDropdownProps {
  className?: string
}

/**
 * 通知ドロップダウンコンポーネント
 *
 * Account.tsxと同じDropdownMenu構造
 * - ベルアイコンをクリックでドロップダウン表示
 * - 未読バッジ表示
 * - 日付グループ化、タイプフィルター、一括操作
 */
export function NotificationDropdown({ className: _className }: NotificationDropdownProps) {
  const pathname = usePathname()
  const router = useRouter()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const { openSettings } = useSettingsDialogStore()

  // タイプフィルター
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')
  const [isOpen, setIsOpen] = useState(false)

  // データ取得
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: allNotifications = [], isLoading: isLoadingAll } = useNotificationsList()
  const { data: unreadNotifications = [], isLoading: isLoadingUnread } = useNotificationsList({
    is_read: false,
  })

  const { markAsRead, markAllAsRead, deleteNotification, deleteAllRead } =
    useNotificationMutations()

  // フィルター適用
  const filteredAllNotifications = useMemo(() => {
    if (typeFilter === 'all') return allNotifications as NotificationData[]
    return (allNotifications as NotificationData[]).filter((n) => n.type === typeFilter)
  }, [allNotifications, typeFilter])

  const filteredUnreadNotifications = useMemo(() => {
    if (typeFilter === 'all') return unreadNotifications as NotificationData[]
    return (unreadNotifications as NotificationData[]).filter((n) => n.type === typeFilter)
  }, [unreadNotifications, typeFilter])

  // 日付グループ化
  const groupedAllNotifications = useMemo(
    () => groupNotificationsByDate(filteredAllNotifications, t),
    [filteredAllNotifications, t]
  )

  const groupedUnreadNotifications = useMemo(
    () => groupNotificationsByDate(filteredUnreadNotifications, t),
    [filteredUnreadNotifications, t]
  )

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead.mutate({ id })
    },
    [markAsRead]
  )

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate()
  }, [markAllAsRead])

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification.mutate({ id })
    },
    [deleteNotification]
  )

  const handleDeleteAllRead = useCallback(() => {
    if (window.confirm(t('notifications.confirm.deleteAllRead'))) {
      deleteAllRead.mutate()
    }
  }, [deleteAllRead, t])

  const handleNavigate = useCallback(
    (url: string) => {
      setIsOpen(false)
      router.push(url)
    },
    [router]
  )

  const handleOpenSettings = useCallback(() => {
    setIsOpen(false)
    openSettings('notifications')
  }, [openSettings])

  // 通知リストのレンダリング
  const renderNotificationList = (
    groups: ReturnType<typeof groupNotificationsByDate<NotificationData>>,
    isLoading: boolean,
    emptyMessageKey: string,
    showDeleteAll: boolean
  ) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    const totalCount = groups.reduce((acc, g) => acc + g.notifications.length, 0)

    if (totalCount === 0) {
      return (
        <div className="text-muted-foreground py-8 text-center text-sm">
          {t(emptyMessageKey)}
        </div>
      )
    }

    return (
      <>
        {/* アクションバー */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-muted-foreground text-xs">
            {t(showDeleteAll ? 'notifications.count.all' : 'notifications.count.unread', {
              count: totalCount,
            })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              {t('notifications.actions.markAllAsRead')}
            </Button>
            {showDeleteAll && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleDeleteAllRead}
                disabled={deleteAllRead.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* グループ化された通知リスト */}
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.key}>
              {/* グループヘッダー */}
              <h3 className="text-muted-foreground mb-1.5 px-1 text-xs font-medium">
                {group.label}
              </h3>
              {/* 通知アイテム */}
              <div className="space-y-1">
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    id={notification.id}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    isRead={notification.is_read}
                    createdAt={notification.created_at}
                    actionUrl={notification.action_url}
                    locale={localeFromPath}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNavigate}
                    isDeleting={deleteNotification.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-foreground/8 data-[state=open]:bg-foreground/12 relative flex h-10 w-10 items-center justify-center rounded-xl outline-hidden transition-colors"
          aria-label={t('notifications.title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute top-0.5 right-0 flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 rounded-xl p-0"
        side="right"
        align="start"
        sideOffset={8}
      >
        {/* ヘッダー */}
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">{t('notifications.title')}</span>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {unreadCount}
            </span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-0" />

        {/* タブとフィルター */}
        <div className="p-3">
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-3 flex items-center justify-between gap-2">
              <TabsList className="h-8 rounded-lg p-0.5">
                <TabsTrigger value="all" className="h-7 rounded-md px-3 text-xs">
                  {t('notifications.tabs.all')}
                </TabsTrigger>
                <TabsTrigger value="unread" className="h-7 rounded-md px-3 text-xs">
                  {t('notifications.tabs.unread')}
                </TabsTrigger>
              </TabsList>

              {/* タイプフィルター */}
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as NotificationType | 'all')}
              >
                <SelectTrigger size="sm" className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* すべてタブ */}
            <TabsContent value="all" className="mt-0">
              {renderNotificationList(
                groupedAllNotifications,
                isLoadingAll,
                'notifications.empty.all',
                true
              )}
            </TabsContent>

            {/* 未読タブ */}
            <TabsContent value="unread" className="mt-0">
              {renderNotificationList(
                groupedUnreadNotifications,
                isLoadingUnread,
                'notifications.empty.unread',
                false
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* フッター：設定リンク */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleOpenSettings} className="gap-2 px-4 py-2.5">
            <Settings className="h-4 w-4" />
            {t('notifications.settings')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
