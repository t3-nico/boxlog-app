'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import type { NotificationType } from '@/schemas/notifications'
import { Loader2, Settings, Trash2 } from 'lucide-react'

import { useNotificationMutations, useNotificationsList } from '../hooks/useNotificationsData'
import { useNotificationDialogStore } from '../stores/useNotificationDialogStore'
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

export function NotificationDialog() {
  const pathname = usePathname()
  const router = useRouter()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const { isOpen, close } = useNotificationDialogStore()
  const { openSettings } = useSettingsDialogStore()

  // タイプフィルター
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')

  // 全通知取得
  const { data: allNotifications = [], isLoading: isLoadingAll } = useNotificationsList()
  // 未読通知取得
  const { data: unreadNotifications = [], isLoading: isLoadingUnread } = useNotificationsList({
    is_read: false,
  })

  const { markAsRead, markAllAsRead, deleteNotification, deleteAllRead } = useNotificationMutations()

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
    if (window.confirm(t('notification.confirm.deleteAllRead'))) {
      deleteAllRead.mutate()
    }
  }, [deleteAllRead, t])

  const handleNavigate = useCallback(
    (url: string) => {
      close()
      router.push(url)
    },
    [close, router]
  )

  const handleOpenSettings = useCallback(() => {
    close()
    openSettings('notifications')
  }, [close, openSettings])

  // 通知リストのレンダリング
  const renderNotificationList = (
    groups: ReturnType<typeof groupNotificationsByDate<NotificationData>>,
    isLoading: boolean,
    emptyMessageKey: string,
    showActions: boolean
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
      return <div className="text-muted-foreground py-8 text-center text-sm">{t(emptyMessageKey)}</div>
    }

    return (
      <>
        {/* アクションバー */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {t(showActions ? 'notifications.count.all' : 'notifications.count.unread', {
              count: totalCount,
            })}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={markAllAsRead.isPending}>
              {t('notification.actions.markAllAsRead')}
            </Button>
            {showActions && (
              <Button variant="ghost" size="sm" onClick={handleDeleteAllRead} disabled={deleteAllRead.isPending}>
                <Trash2 className="mr-1 h-4 w-4" />
                {t('notification.actions.deleteAllRead')}
              </Button>
            )}
          </div>
        </div>

        {/* グループ化された通知リスト */}
        <div className="max-h-[28rem] space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.key}>
              {/* グループヘッダー */}
              <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">{group.label}</h3>
              {/* 通知アイテム */}
              <div className="space-y-2">
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="top-4 !left-20 max-w-xl !translate-x-0 !translate-y-0">
        <DialogHeader>
          <DialogTitle>{t('notification.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          {/* タブとフィルター */}
          <div className="flex items-center justify-between gap-4">
            <TabsList className="grid w-full max-w-[200px] grid-cols-2">
              <TabsTrigger value="all">{t('notification.tabs.all')}</TabsTrigger>
              <TabsTrigger value="unread">{t('notification.tabs.unread')}</TabsTrigger>
            </TabsList>

            {/* タイプフィルター */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | 'all')}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* すべてタブ */}
          <TabsContent value="all" className="mt-4 space-y-4">
            {renderNotificationList(groupedAllNotifications, isLoadingAll, 'notifications.empty.all', true)}
          </TabsContent>

          {/* 未読タブ */}
          <TabsContent value="unread" className="mt-4 space-y-4">
            {renderNotificationList(groupedUnreadNotifications, isLoadingUnread, 'notifications.empty.unread', false)}
          </TabsContent>
        </Tabs>

        {/* フッター：設定リンク */}
        <Separator className="my-2" />
        <button
          type="button"
          onClick={handleOpenSettings}
          className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-transparent"
        >
          <Settings className="h-4 w-4" />
          {t('notification.settings')}
        </button>
      </DialogContent>
    </Dialog>
  )
}
