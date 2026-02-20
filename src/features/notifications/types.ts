// Notification types for Dayopt notification system
// Authoritative types are in @/schemas/notifications (Zod schemas)

export type {
  NotificationIcon,
  NotificationPriority,
  NotificationType,
} from '@/schemas/notifications';

import type { NotificationIcon, NotificationType } from '@/schemas/notifications';

// データベースエンティティ（Supabaseから取得する型）
export interface NotificationEntity {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  message: string | null;
  related_plan_id: string | null;
  related_tag_id: string | null;
  action_url: string | null;
  icon: NotificationIcon | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// クライアント側の通知型
export interface Notification {
  id: string;
  type: NotificationType;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  message?: string | undefined;
  relatedPlanId?: string | undefined;
  relatedTagId?: string | undefined;
  actionUrl?: string | undefined;
  icon?: NotificationIcon | undefined;
  data?: Record<string, unknown> | undefined;
  isRead: boolean;
  readAt?: Date | undefined;
  expiresAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// 通知作成リクエスト
export interface CreateNotificationRequest {
  type: NotificationType;
  priority?: 'urgent' | 'high' | 'medium' | 'low' | undefined;
  title: string;
  message?: string | undefined;
  relatedPlanId?: string | undefined;
  relatedTagId?: string | undefined;
  actionUrl?: string | undefined;
  icon?: NotificationIcon | undefined;
  data?: Record<string, unknown> | undefined;
  expiresAt?: Date | undefined;
}

// 優先度ごとの設定
export const NOTIFICATION_PRIORITY_CONFIG = {
  urgent: {
    color: 'bg-destructive',
    textColor: 'text-destructive-foreground',
    badgeColor: 'bg-destructive',
  },
  high: {
    color: 'bg-destructive/80',
    textColor: 'text-destructive-foreground',
    badgeColor: 'bg-destructive/80',
  },
  medium: {
    color: 'bg-primary',
    textColor: 'text-primary-foreground',
    badgeColor: 'bg-primary',
  },
  low: {
    color: 'bg-surface-container',
    textColor: 'text-muted-foreground',
    badgeColor: 'bg-surface-container-foreground',
  },
} as const;

// 通知タイプごとのデフォルトアイコン
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, NotificationIcon> = {
  reminder: 'bell',
  plan_created: 'calendar',
  plan_updated: 'calendar',
  plan_deleted: 'trash',
  plan_completed: 'check',
  trash_warning: 'alert',
  system: 'info',
};
