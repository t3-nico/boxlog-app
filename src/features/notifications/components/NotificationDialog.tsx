'use client'

import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/features/i18n/lib/hooks'

import { useNotificationDialogStore } from '../stores/useNotificationDialogStore'

export function NotificationDialog() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const { isOpen, close } = useNotificationDialogStore()

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

  const unreadNotifications = mockNotifications.filter((n) => !n.isRead)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('notifications.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">{t('notifications.tabs.all')}</TabsTrigger>
            <TabsTrigger value="unread">{t('notifications.tabs.unread')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {mockNotifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">{t('notifications.empty.all')}</div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{mockNotifications.length}件の通知</span>
                  <Button variant="ghost" size="sm">
                    {t('notifications.actions.markAllAsRead')}
                  </Button>
                </div>
                <div className="space-y-2">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-border rounded-lg border p-4 ${!notification.isRead ? 'bg-muted' : 'bg-card'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">{notification.title}</h4>
                            {!notification.isRead && (
                              <span className="bg-primary h-2 w-2 rounded-full" aria-label="未読" />
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1 text-sm">{notification.message}</p>
                          <span className="text-muted-foreground mt-2 text-xs">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-4 space-y-4">
            {unreadNotifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">{t('notifications.empty.unread')}</div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{unreadNotifications.length}件の未読通知</span>
                  <Button variant="ghost" size="sm">
                    {t('notifications.actions.markAllAsRead')}
                  </Button>
                </div>
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <div key={notification.id} className="bg-muted border-border rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">{notification.title}</h4>
                            <span className="bg-primary h-2 w-2 rounded-full" aria-label="未読" />
                          </div>
                          <p className="text-muted-foreground mt-1 text-sm">{notification.message}</p>
                          <span className="text-muted-foreground mt-2 text-xs">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
