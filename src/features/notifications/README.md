# Notifications Feature

BoxLogアプリケーションの通知機能を提供するfeatureモジュールです。

## 概要

このモジュールは、アプリケーション内外での通知機能を管理します。イベントリマインダー、システム通知、ユーザー通知の表示・管理を統合しています。

## 主な機能

- **通知表示**: システム・ユーザー通知の表示
- **通知履歴**: 過去の通知履歴管理
- **通知設定**: 通知の有効化・無効化
- **リマインダー**: イベント・タスクのリマインダー機能
- **モーダル通知**: 重要な通知のモーダル表示

## ディレクトリ構成

```
src/features/notifications/
├── components/
│   ├── NotificationModal.tsx       # 通知モーダル
│   ├── notification-display.tsx    # 通知表示コンポーネント
│   └── notifications-list.tsx      # 通知リスト
├── hooks/
│   ├── useNotificationModal.tsx    # 通知モーダルフック
│   └── useNotifications.ts         # 通知管理フック
├── types/
│   └── index.ts                    # 通知関連型定義
└── utils/
    └── notification-helpers.ts     # 通知ヘルパー関数
```

## 主要コンポーネント

### NotificationModal

重要な通知をモーダル形式で表示。

**特徴:**
- 緊急度に応じたスタイリング
- アクション付き通知対応
- 自動消去機能

### NotificationDisplay

通知の表示とアニメーション管理。

**特徴:**
- スライドイン・アウトアニメーション
- 通知タイプ別スタイリング
- タップ・クリックでの消去

### NotificationsList

通知履歴の一覧表示。

**特徴:**
- 時系列での表示
- 既読・未読状態管理
- フィルタリング機能

## 通知タイプ

```typescript
enum NotificationType {
  INFO = 'info',           // 情報通知
  SUCCESS = 'success',     // 成功通知
  WARNING = 'warning',     // 警告通知
  ERROR = 'error',         // エラー通知
  REMINDER = 'reminder'    // リマインダー
}
```

## フック

### useNotifications

通知の作成・管理を行うメインフック。

```typescript
const {
  notifications,        // 現在の通知一覧
  addNotification,     // 通知追加
  removeNotification,  // 通知削除
  clearAllNotifications, // 全通知クリア
  markAsRead          // 既読マーク
} = useNotifications()
```

### useNotificationModal

モーダル通知の管理フック。

```typescript
const {
  isOpen,           // モーダル開閉状態
  notification,     // 表示中の通知
  showModal,        // モーダル表示
  hideModal        // モーダル非表示
} = useNotificationModal()
```

## 通知ヘルパー

### notification-helpers.ts

通知関連のユーティリティ関数群。

**主な機能:**
- 通知フォーマット
- アイコン生成
- 優先度判定
- 表示時間計算

```typescript
// 使用例
import { createNotification, getNotificationIcon } from '../utils/notification-helpers'

const notification = createNotification({
  type: 'success',
  title: '保存完了',
  message: 'データが正常に保存されました',
  duration: 3000
})
```

## スタイリング

全コンポーネントは`/src/config/theme`の統一トークンを使用：

```tsx
import { background, text, border, semantic } from '@/config/theme'

// 通知タイプ別スタイリング
const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return cn(background.success, text.successForeground, border.success)
    case 'error':
      return cn(background.destructive, text.destructiveForeground, border.destructive)
    case 'warning':
      return cn(background.warning, text.warningForeground, border.warning)
    default:
      return cn(background.surface, text.primary, border.subtle)
  }
}
```

## 今後の改善予定

- [ ] プッシュ通知対応
- [ ] 通知音設定
- [ ] より詳細な通知設定
- [ ] 通知の一括操作
- [ ] 外部サービス連携通知

## 関連モジュール

- `src/features/settings`: 通知設定
- `src/features/calendar`: イベントリマインダー
- `src/config/theme`: デザインシステム