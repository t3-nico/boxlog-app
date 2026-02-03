'use client';

import { Bell, CheckCheck, Loader2, Settings, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import type { NotificationType } from '@/schemas/notifications';
import { useLocale, useTranslations } from 'next-intl';

import {
  useNotificationMutations,
  useNotificationsList,
  useUnreadCount,
} from '../hooks/useNotificationsData';
import { groupNotificationsByDate } from '../utils/notification-helpers';
import { NotificationItem } from './NotificationItem';

// 型定義
interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
}

interface NotificationDropdownProps {
  className?: string;
  /** ボタンサイズ: 'default' = 40px, 'sm' = 32px */
  size?: 'default' | 'sm';
}

/**
 * 通知ドロップダウンコンポーネント
 *
 * シンプルなリスト形式で通知を表示
 * - ベルアイコンをクリックでドロップダウン表示
 * - 未読バッジ表示
 * - 日付グループ化、一括操作
 */
export function NotificationDropdown({
  className: _className,
  size = 'default',
}: NotificationDropdownProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [isOpen, setIsOpen] = useState(false);

  // データ取得
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: allNotifications = [], isLoading } = useNotificationsList();

  const { markAsRead, markAllAsRead, deleteNotification, deleteAllRead } =
    useNotificationMutations();

  // 日付グループ化
  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(allNotifications as NotificationData[], t),
    [allNotifications, t],
  );

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead.mutate({ id });
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification.mutate({ id });
    },
    [deleteNotification],
  );

  const handleDeleteAllRead = useCallback(() => {
    if (window.confirm(t('notification.confirm.deleteAllRead'))) {
      deleteAllRead.mutate();
    }
  }, [deleteAllRead, t]);

  const handleNavigate = useCallback(
    (url: string) => {
      setIsOpen(false);
      router.push(url);
    },
    [router],
  );

  const handleOpenSettings = useCallback(() => {
    setIsOpen(false);
    router.push(`/${locale}/settings/notifications`);
  }, [locale, router]);

  // 通知リストのレンダリング
  const renderNotificationList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    const totalCount = groupedNotifications.reduce((acc, g) => acc + g.notifications.length, 0);

    if (totalCount === 0) {
      return (
        <div className="text-muted-foreground py-8 text-center text-sm">
          {t('notification.empty.all')}
        </div>
      );
    }

    return (
      <>
        {/* アクションバー */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-muted-foreground text-xs">
            {t('notification.count.all', { count: totalCount })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="size-4" />
              {t('notification.actions.markAllAsRead')}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDeleteAllRead}
              disabled={deleteAllRead.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* グループ化された通知リスト */}
        <div className="max-h-[28rem] min-h-[20rem] space-y-3 overflow-y-auto">
          {groupedNotifications.map((group) => (
            <div key={group.key}>
              {/* グループヘッダー */}
              <h3 className="text-muted-foreground mb-1.5 px-1 text-xs font-normal">
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
                    locale={locale as 'ja' | 'en'}
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
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`hover:bg-state-hover data-[state=open]:bg-state-selected relative flex items-center justify-center rounded-2xl outline-hidden transition-colors ${
            size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
          }`}
          aria-label={t('notification.title')}
        >
          <Bell className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
          {unreadCount > 0 && (
            <span
              className={`bg-destructive text-destructive-foreground absolute flex items-center justify-center rounded-full font-bold ${
                size === 'sm'
                  ? 'top-0 right-0 h-3.5 w-3.5 text-xs'
                  : 'top-0.5 right-0 h-4 w-4 text-xs'
              }`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full max-w-sm overflow-visible rounded-2xl p-0 sm:w-96 sm:max-w-96"
        side="right"
        align="start"
        sideOffset={8}
      >
        {/* ヘッダー */}
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{t('notification.title')}</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </div>
          <HoverTooltip content={t('notification.settings.title')} side="top">
            <button
              type="button"
              onClick={handleOpenSettings}
              className="hover:bg-state-hover flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">{t('notification.settings.title')}</span>
            </button>
          </HoverTooltip>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-0" />

        {/* 通知リスト */}
        <div className="overflow-visible p-3">{renderNotificationList()}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
