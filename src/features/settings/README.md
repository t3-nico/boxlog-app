# Settings Feature

BoxLogアプリケーションの設定機能を提供するfeatureモジュールです。

## 概要

このモジュールは、アプリケーション設定の管理を提供します。ユーザー設定、カレンダー設定、通知設定、統合設定、データエクスポートなど、アプリケーション全体の設定機能を統合しています。

## 主な機能

- **アカウント設定**: プロフィール、認証設定
- **カレンダー設定**: タイムゾーン、表示設定、時間設定
- **通知設定**: 通知の有効化・無効化、タイミング設定
- **統合設定**: 外部サービスとの連携設定
- **データエクスポート**: データのバックアップ・エクスポート
- **タグ設定**: タグの管理・設定
- **テンプレート設定**: イベント・タスクテンプレート管理

## ディレクトリ構成

```
src/features/settings/
├── components/
│   ├── SettingsCard.tsx             # 設定項目カード
│   ├── SettingsLayout.tsx           # 設定レイアウト
│   ├── SettingsSection.tsx          # 設定セクション
│   ├── about-legal-settings.tsx     # About・法的情報設定
│   ├── account-settings.tsx         # アカウント設定
│   ├── calendar-settings.tsx        # カレンダー設定
│   ├── data-export-settings.tsx     # データエクスポート設定
│   ├── integration-settings.tsx     # 統合設定
│   ├── notification-settings.tsx    # 通知設定
│   ├── plan-billing-settings.tsx    # プラン・課金設定
│   ├── preferences-settings.tsx     # 一般設定
│   ├── settings-navigation.tsx      # 設定ナビゲーション
│   ├── tags-settings.tsx            # タグ設定
│   ├── templates-settings.tsx       # テンプレート設定
│   ├── examples/
│   │   └── AccountSettingsAutoSave.tsx  # 自動保存設定例
│   └── fields/
│       └── SettingField.tsx         # 設定フィールドコンポーネント
├── hooks/
│   ├── useAutoSaveSettings.ts       # 自動保存フック
│   └── useFormattedTime.ts          # 時間フォーマットフック
├── stores/
│   └── useCalendarSettingsStore.ts  # カレンダー設定状態管理
├── types/
│   └── index.ts                     # 設定関連型定義
└── utils/
    ├── timezone-utils.ts            # タイムゾーンユーティリティ
    └── timezone.ts                  # タイムゾーン処理
```

## 主要コンポーネント

### SettingsLayout

設定ページの全体レイアウトを管理。

**特徴:**

- 左側ナビゲーション + 右側設定パネル
- レスポンシブ対応
- 統一されたスタイリング

### SettingsCard

個別の設定項目を表示するカードコンポーネント。

**特徴:**

- タイトル・説明・設定内容の構造化表示
- 統一されたカードデザイン
- 自動保存対応

### AccountSettings

アカウント関連設定のメインコンポーネント。

**主な機能:**

- プロフィール情報編集
- パスワード変更
- 認証設定
- アバター変更

## 設定カテゴリ

### 1. アカウント設定 (`account-settings.tsx`)

- プロフィール情報
- セキュリティ設定
- 認証方法

### 2. カレンダー設定 (`calendar-settings.tsx`)

- タイムゾーン設定
- 週の開始日
- 時間表示形式
- デフォルト期間

### 3. 通知設定 (`notification-settings.tsx`)

- 通知の有効化
- 通知タイミング
- 通知方法

### 4. 統合設定 (`integration-settings.tsx`)

- 外部カレンダー連携
- API連携
- サードパーティ連携

### 5. データエクスポート (`data-export-settings.tsx`)

- データバックアップ
- エクスポート形式選択
- 定期バックアップ設定

## 自動保存機能

設定変更時の自動保存機能を提供：

```typescript
import { useAutoSaveSettings } from '../hooks/useAutoSaveSettings'

function SettingsComponent() {
  const { saveSettings, isLoading, lastSaved } = useAutoSaveSettings()

  const handleChange = (value: string | number | boolean) => {
    saveSettings({ key: value })
  }

  return (
    <div>
      <input onChange={(e) => handleChange(e.target.value)} />
      {isLoading && <span>保存中...</span>}
      {lastSaved && <span>最終保存: {lastSaved}</span>}
    </div>
  )
}
```

## スタイリング

全コンポーネントは`/src/config/theme`の統一トークンを使用：

```tsx
import { background, text, border, typography, spacing } from '@/config/theme'

// 設定カードの例
;<div className={cn('rounded-lg border p-6', background.surface, border.subtle, spacing.component.lg)}>
  <h3 className={cn(typography.heading.h6, text.primary)}>設定タイトル</h3>
  <p className={cn(typography.body.small, text.muted)}>設定の説明</p>
</div>
```

## 状態管理

### useCalendarSettingsStore

カレンダー関連設定の状態管理。

```typescript
interface CalendarSettingsStore {
  timezone: string
  startOfWeek: number
  timeFormat: '12h' | '24h'
  defaultDuration: number
  updateTimezone: (timezone: string) => void
  updateTimeFormat: (format: '12h' | '24h') => void
}
```

## タイムゾーン処理

### timezone-utils.ts

タイムゾーン関連のユーティリティ関数群。

**主な機能:**

- タイムゾーン一覧取得
- タイムゾーン変換
- ローカルタイムゾーン検出
- タイムゾーン表示名生成

## バリデーション

設定値のバリデーション機能：

```typescript
// 設定値の検証
const validateSettings = (settings: SettingsData) => {
  const errors: string[] = []

  if (!settings.timezone) {
    errors.push('タイムゾーンは必須です')
  }

  if (settings.defaultDuration < 15) {
    errors.push('デフォルト期間は15分以上である必要があります')
  }

  return errors
}
```

## 今後の改善予定

- [ ] 設定のインポート・エクスポート機能
- [ ] 設定テンプレート機能
- [ ] より詳細な通知設定
- [ ] キーボードショートカット設定
- [ ] アクセシビリティ設定

## 関連モジュール

- `src/features/auth`: 認証関連設定
- `src/features/calendar`: カレンダー設定
- `src/features/notifications`: 通知設定
- `src/config/theme`: デザインシステム
