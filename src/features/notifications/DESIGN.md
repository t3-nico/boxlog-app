# 通知機能 - 設計ドキュメント

## 📋 概要

BoxLogの通知システム設計。イベント、タスク、システムメッセージをユーザーに通知する。

## 🎯 要件

### 機能要件

1. **通知タイプ**
   - リマインダー（イベント開始前）
   - イベント/タスク変更通知
   - ゴミ箱自動削除警告
   - システム通知

2. **通知管理**
   - 未読/既読状態の管理
   - 通知の一覧表示（全て/未読）
   - 個別削除・一括既読化
   - 自動削除（30日後）

3. **優先度管理**
   - urgent（緊急）
   - high（高）
   - medium（中）
   - low（低）

### 非機能要件

- リアルタイム更新（Supabase Realtime）
- パフォーマンス: 1000件まで対応
- i18n対応（日本語・英語）

## 🗄️ データベース設計

### テーブル: `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 通知の分類
  type TEXT NOT NULL CHECK (type IN (
    'reminder',           -- リマインダー
    'event_created',      -- イベント作成
    'event_updated',      -- イベント更新
    'event_deleted',      -- イベント削除
    'task_completed',     -- タスク完了
    'trash_warning',      -- ゴミ箱自動削除警告
    'system'              -- システム通知
  )),

  -- 優先度
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'urgent',   -- 緊急（赤）
    'high',     -- 高（オレンジ）
    'medium',   -- 中（青）
    'low'       -- 低（グレー）
  )),

  -- 通知内容
  title TEXT NOT NULL,
  message TEXT,

  -- 関連データ
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  related_tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  action_url TEXT,  -- クリック時の遷移先（例: /calendar?date=2025-10-20）

  -- メタデータ
  icon TEXT,  -- 'bell' | 'calendar' | 'trash' | 'alert' | 'check' | 'info'
  data JSONB DEFAULT '{}',  -- 拡張用データ

  -- 状態管理
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- 通知の有効期限（任意）

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- インデックス
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_user_unread (user_id, is_read) WHERE is_read = false,
  INDEX idx_notifications_created_at (created_at DESC),
  INDEX idx_notifications_related_event (related_event_id)
);

-- Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 自動updated_atトリガー
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 古い通知の自動削除（30日後）
CREATE OR REPLACE FUNCTION delete_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_read = true;
END;
$$ LANGUAGE plpgsql;
```

### テーブル: `notification_preferences`（将来拡張用）

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 通知設定
  enable_browser_notifications BOOLEAN NOT NULL DEFAULT false,
  enable_email_notifications BOOLEAN NOT NULL DEFAULT false,
  enable_push_notifications BOOLEAN NOT NULL DEFAULT false,

  -- タイプ別有効/無効
  enable_reminders BOOLEAN NOT NULL DEFAULT true,
  enable_event_updates BOOLEAN NOT NULL DEFAULT true,
  enable_trash_warnings BOOLEAN NOT NULL DEFAULT true,
  enable_system_notifications BOOLEAN NOT NULL DEFAULT true,

  -- リマインダー設定
  default_reminder_minutes INTEGER DEFAULT 15,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 📦 型定義

### `src/features/notifications/types.ts`

```typescript
// 通知タイプ
export type NotificationType =
  | 'reminder'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'task_completed'
  | 'trash_warning'
  | 'system';

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
  message?: string;
  relatedEventId?: string;
  relatedTagId?: string;
  actionUrl?: string;
  icon?: NotificationIcon;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 通知作成リクエスト
export interface CreateNotificationRequest {
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message?: string;
  relatedEventId?: string;
  relatedTagId?: string;
  actionUrl?: string;
  icon?: NotificationIcon;
  data?: Record<string, unknown>;
  expiresAt?: Date;
}

// 通知フィルター
export interface NotificationFilters {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
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
```

## 🏗️ アーキテクチャ

### ディレクトリ構造

```
src/features/notifications/
├── components/
│   ├── NotificationDialog.tsx        # メインダイアログ
│   ├── NotificationItem.tsx          # 通知アイテム
│   ├── NotificationList.tsx          # 通知リスト
│   └── NotificationBadge.tsx         # 未読バッジ
├── hooks/
│   ├── useNotifications.ts           # 通知データ取得
│   ├── useNotificationActions.ts     # 通知操作
│   └── useRealtimeNotifications.ts   # リアルタイム更新
├── stores/
│   ├── useNotificationStore.ts       # Zustand store
│   └── useNotificationDialogStore.ts # ダイアログ開閉状態
├── lib/
│   ├── transformers.ts               # Entity → Notification変換
│   ├── notifications.ts              # 通知生成ヘルパー
│   └── constants.ts                  # 定数定義
├── types.ts                          # 型定義
├── index.ts                          # エクスポート
├── DESIGN.md                         # 本ドキュメント
└── CLAUDE.md                         # 実装ガイド
```

### データフロー

```
┌─────────────────────────────────────────────────────┐
│ User Action (イベント作成、削除など)                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ イベントハンドラー                                   │
│ - createEvent()                                     │
│ - deleteEvent()                                     │
│ - updateEvent()                                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 通知生成関数                                         │
│ lib/notifications.ts                                │
│ - createEventNotification()                         │
│ - createReminderNotification()                      │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Supabase                                            │
│ INSERT INTO notifications (...)                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Realtime Subscription                               │
│ useRealtimeNotifications()                          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Zustand Store更新                                    │
│ useNotificationStore.setState()                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ UIコンポーネント更新                                 │
│ - NotificationBadge (未読数)                        │
│ - NotificationDialog (リスト)                       │
└─────────────────────────────────────────────────────┘
```

## 🔔 通知生成トリガー

### 1. リマインダー（Cron Job / Edge Function）

```typescript
// Supabase Edge Function: check-reminders (1分ごと実行)
const now = new Date();
const upcomingEvents = await supabase
  .from('events')
  .select('*')
  .gte('planned_start', now.toISOString())
  .lte('planned_start', addMinutes(now, 60).toISOString());

for (const event of upcomingEvents) {
  for (const reminder of event.reminders || []) {
    if (!reminder.isTriggered && shouldTriggerReminder(event, reminder, now)) {
      await createNotification({
        type: 'reminder',
        priority: 'high',
        title: event.title,
        message: `${reminder.minutesBefore}分後に開始します`,
        relatedEventId: event.id,
        actionUrl: `/calendar?date=${format(event.planned_start, 'yyyy-MM-dd')}`,
        icon: 'bell',
      });

      // リマインダーをトリガー済みにマーク
      await markReminderTriggered(event.id, reminder.id);
    }
  }
}
```

### 2. イベント変更通知（クライアント側）

```typescript
// src/features/events/hooks/useCreateEvent.ts
export const useCreateEvent = () => {
  const createEvent = async (eventData: CreateEventRequest) => {
    const event = await supabase.from('events').insert(eventData);

    // 通知を生成
    await createNotification({
      type: 'event_created',
      priority: 'medium',
      title: eventData.title,
      message: 'イベントを作成しました',
      relatedEventId: event.id,
      actionUrl: `/calendar?date=${format(eventData.startDate, 'yyyy-MM-dd')}`,
      icon: 'calendar',
    });

    return event;
  };

  return { createEvent };
};
```

### 3. ゴミ箱警告（Cron Job）

```typescript
// Supabase Edge Function: check-trash (1日1回実行)
const threeDaysFromNow = addDays(new Date(), 3);
const trashedEvents = await supabase
  .from('events')
  .select('*')
  .eq('is_deleted', true)
  .eq('deleted_at', format(threeDaysFromNow, 'yyyy-MM-dd'));

for (const event of trashedEvents) {
  await createNotification({
    type: 'trash_warning',
    priority: 'urgent',
    title: 'イベントの自動削除',
    message: `「${event.title}」が3日後に完全削除されます`,
    relatedEventId: event.id,
    actionUrl: '/settings?tab=trash',
    icon: 'trash',
  });
}
```

## 🚀 実装フェーズ

### Phase 1: 基本実装（Week 1）

- [ ] 型定義作成
- [ ] Supabaseテーブル作成
- [ ] Zustand Store実装
- [ ] 基本的なhooks実装
- [ ] NotificationDialogの改善（既読化、削除）

### Phase 2: リアルタイム更新（Week 2）

- [ ] Supabase Realtime統合
- [ ] useRealtimeNotifications実装
- [ ] 未読バッジ実装（site-header）

### Phase 3: 通知生成（Week 3）

- [ ] イベント変更通知の統合
- [ ] リマインダー通知（Edge Function）
- [ ] ゴミ箱警告通知（Edge Function）

### Phase 4: 拡張機能（Week 4）

- [ ] ブラウザ通知（Notification API）
- [ ] 通知設定ページ
- [ ] 通知フィルター機能

## 📊 パフォーマンス考慮事項

1. **ページネーション**: 50件ずつ取得
2. **キャッシュ**: React Queryでデータキャッシュ
3. **インデックス**: `user_id`, `is_read`, `created_at`
4. **自動削除**: 既読30日後に自動削除（Cron Job）

## 🔐 セキュリティ

- **RLS有効化**: ユーザーは自分の通知のみアクセス可能
- **XSS対策**: messageフィールドのサニタイズ
- **レート制限**: 通知作成は1分間に10件まで

---

**作成日**: 2025-10-20
**更新日**: 2025-10-20
**バージョン**: v1.0
