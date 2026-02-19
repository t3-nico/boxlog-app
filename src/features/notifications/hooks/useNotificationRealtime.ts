/**
 * Supabase Realtime通知購読フック
 * 新しい通知をリアルタイムで検知してToast表示・ブラウザ通知
 */

'use client';

import { useEffect, useRef } from 'react';

import { createClient } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/client';
import type { NotificationType } from '@/schemas/notifications';
import { toast } from 'sonner';

import {
  checkBrowserNotificationSupport,
  showBrowserNotification,
} from '../utils/notification-helpers';

import { useNotificationPreferences } from './useNotificationPreferences';

interface NotificationPayload {
  id: string;
  title: string;
  message: string | null;
  type: NotificationType;
  priority: string;
  created_at: string;
  user_id: string;
}

export function useNotificationRealtime(userId: string | undefined, enabled = true) {
  const utils = trpc.useUtils();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  // 通知設定を取得
  const { shouldShowNotification, shouldShowBrowserNotification } = useNotificationPreferences();

  useEffect(() => {
    if (!enabled || !userId) return;

    const supabase = createClient();

    // Realtimeチャンネルを購読
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as NotificationPayload;

          // 設定に基づいてこの通知タイプを表示すべきか判定
          if (!shouldShowNotification(notification.type)) {
            // 通知タイプが無効化されている場合はキャッシュのみ更新
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
            return;
          }

          // Toast表示（既存のToastシステムを使用）
          toast.info(notification.title, {
            description: notification.message || undefined,
            duration: 5000,
          });

          // ブラウザ通知を表示（設定で有効かつブラウザがサポートしている場合）
          if (
            shouldShowBrowserNotification(notification.type) &&
            checkBrowserNotificationSupport() &&
            Notification.permission === 'granted'
          ) {
            const notificationOptions: NotificationOptions = {
              tag: notification.id, // 重複通知を防ぐ
            };
            if (notification.message) {
              notificationOptions.body = notification.message;
            }
            showBrowserNotification(notification.title, notificationOptions);
          }

          // tRPCキャッシュを無効化して最新データを取得
          utils.notifications.list.invalidate();
          utils.notifications.unreadCount.invalidate();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, enabled, utils, shouldShowNotification, shouldShowBrowserNotification]);
}
