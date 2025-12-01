'use client'

import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/features/i18n/lib/hooks'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'
import { Loader2, Trash2 } from 'lucide-react'

import { useNotificationMutations, useNotificationsList } from '../hooks/useNotificationsData'
import { useNotificationDialogStore } from '../stores/useNotificationDialogStore'

export function NotificationDialog() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const dateLocale = localeFromPath === 'ja' ? ja : enUS

  const { isOpen, close } = useNotificationDialogStore()

  // 全通知取得
  const { data: allNotifications = [], isLoading: isLoadingAll } = useNotificationsList()
  // 未読通知取得
  const { data: unreadNotifications = [], isLoading: isLoadingUnread } = useNotificationsList({ is_read: false })

  const { markAsRead, markAllAsRead, deleteNotification, deleteAllRead } = useNotificationMutations()

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ id })
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDelete = (id: string) => {
    deleteNotification.mutate({ id })
  }

  const handleDeleteAllRead = () => {
    if (window.confirm(t('notifications.confirm.deleteAllRead'))) {
      deleteAllRead.mutate()
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: dateLocale })
    } catch {
      return timestamp
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="top-4 max-w-xl !left-20 !translate-x-0 !translate-y-0">
        <DialogHeader>
          <DialogTitle>{t('notifications.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">{t('notifications.tabs.all')}</TabsTrigger>
            <TabsTrigger value="unread">{t('notifications.tabs.unread')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {isLoadingAll ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">{t('notifications.empty.all')}</div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {t('notifications.count.all', { count: allNotifications.length })}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={markAllAsRead.isPending}>
                      {t('notifications.actions.markAllAsRead')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDeleteAllRead} disabled={deleteAllRead.isPending}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      {t('notifications.actions.deleteAllRead')}
                    </Button>
                  </div>
                </div>
                <div className="max-h-[31rem] space-y-2 overflow-y-auto">
                  {allNotifications.map(
                    (notification: {
                      id: string
                      title: string
                      message: string | null
                      is_read: boolean
                      created_at: string
                    }) => (
                      <div
                        key={notification.id}
                        className={`border-border rounded-xl border p-4 ${!notification.is_read ? 'bg-muted' : 'bg-card'}`}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        role={!notification.is_read ? 'button' : undefined}
                        tabIndex={!notification.is_read ? 0 : undefined}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold">{notification.title}</h4>
                              {!notification.is_read && (
                                <span className="bg-primary h-2 w-2 rounded-full" aria-label="未読" />
                              )}
                            </div>
                            {notification.message && (
                              <p className="text-muted-foreground mt-1 text-sm">{notification.message}</p>
                            )}
                            <span className="text-muted-foreground mt-2 text-xs">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(notification.id)
                            }}
                            disabled={deleteNotification.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-4 space-y-4">
            {isLoadingUnread ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">{t('notifications.empty.unread')}</div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {t('notifications.count.unread', { count: unreadNotifications.length })}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={markAllAsRead.isPending}>
                    {t('notifications.actions.markAllAsRead')}
                  </Button>
                </div>
                <div className="max-h-[31rem] space-y-2 overflow-y-auto">
                  {unreadNotifications.map(
                    (notification: {
                      id: string
                      title: string
                      message: string | null
                      is_read: boolean
                      created_at: string
                    }) => (
                      <div
                        key={notification.id}
                        className="bg-muted border-border rounded-xl border p-4"
                        onClick={() => handleMarkAsRead(notification.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold">{notification.title}</h4>
                              <span className="bg-primary h-2 w-2 rounded-full" aria-label="未読" />
                            </div>
                            {notification.message && (
                              <p className="text-muted-foreground mt-1 text-sm">{notification.message}</p>
                            )}
                            <span className="text-muted-foreground mt-2 text-xs">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(notification.id)
                            }}
                            disabled={deleteNotification.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
