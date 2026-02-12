// Notification types for Dayopt notification system

// 通知タイプ
export type NotificationType =
  | 'reminder' // リマインダー
  | 'event_created' // イベント作成
  | 'event_updated' // イベント更新
  | 'event_deleted' // イベント削除
  | 'task_completed' // タスク完了
  | 'trash_warning' // ゴミ箱自動削除警告
  | 'system'; // システム通知

// 優先度
export type NotificationPriority = 'urgent' | 'high' | 'medium' | 'low';

// アイコンタイプ
export type NotificationIcon = 'bell' | 'calendar' | 'trash' | 'alert' | 'check' | 'info';

// データベースエンティティ（Supabaseから取得する型）
export interface NotificationEntity {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string | null;
  related_event_id: string | null;
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
  priority: NotificationPriority;
  title: string;
  message?: string | undefined;
  relatedEventId?: string | undefined;
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
  priority?: NotificationPriority | undefined;
  title: string;
  message?: string | undefined;
  relatedEventId?: string | undefined;
  relatedTagId?: string | undefined;
  actionUrl?: string | undefined;
  icon?: NotificationIcon | undefined;
  data?: Record<string, unknown> | undefined;
  expiresAt?: Date | undefined;
}

// 通知フィルター
export interface NotificationFilters {
  types?: NotificationType[] | undefined;
  priorities?: NotificationPriority[] | undefined;
  isRead?: boolean | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}

// Zustand Store型
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface NotificationActions {
  // データ取得
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  // 既読管理
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // 削除
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;

  // フィルタリング
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];

  // エラー処理
  clearError: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

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
  event_created: 'calendar',
  event_updated: 'calendar',
  event_deleted: 'trash',
  task_completed: 'check',
  trash_warning: 'alert',
  system: 'info',
};
