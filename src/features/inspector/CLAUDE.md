# features/inspector - Inspector機能

BoxLogアプリケーションのInspector（右サイドパネル）機能を管理するモジュール。

## 🎯 責務

- **Inspector UI**: デスクトップ/モバイル対応の右サイドパネル
- **イベント作成**: カレンダーイベントの作成・編集フォーム
- **未スケジュールタスク**: タスク一覧表示
- **AI Chat**: Inspector内でのAIチャット機能
- **状態管理**: Inspector開閉・幅調整・コンテンツタイプ管理

## 📁 ディレクトリ構造

```
features/inspector/
├── components/
│   ├── DesktopInspector.tsx          # デスクトップ用Inspector（タブ切り替え）
│   ├── MobileInspector.tsx           # モバイル用Inspector（モーダル表示）
│   ├── inspector-header.tsx          # Inspectorヘッダー（閉じるボタン）
│   ├── inspector-content.tsx         # コンテンツ振り分けロジック
│   ├── inspector-ai-chat.tsx         # AI Chatタブ
│   ├── UnscheduledTasksList.tsx      # 未スケジュールタスク一覧
│   ├── index.tsx                     # レスポンシブInspector（default export）
│   ├── index.ts                      # re-export
│   └── content/
│       ├── CalendarInspectorContent.tsx   # カレンダーイベント作成フォーム
│       ├── TaskInspectorContent.tsx       # タスク作成フォーム
│       └── DefaultInspectorContent.tsx    # デフォルトコンテンツ
├── hooks/
│   ├── useCreateEventInspector.ts          # イベント作成Inspector制御
│   └── useCreateEventInspectorShortcuts.ts # キーボードショートカット
├── stores/
│   └── inspector.store.ts            # Inspector状態管理（Zustand）
├── types.ts                          # 型定義
├── index.ts                          # エクスポート管理
├── CLAUDE.md                         # 本ドキュメント
└── README.md                         # 使用例・API仕様
```

## 🏗️ アーキテクチャ

### レスポンシブ対応

```
┌─────────────────────────────────────────┐
│ デスクトップ (lg以上)                      │
│ ┌──────────────┬──────────────────────┐ │
│ │ Main Content │ Inspector (右端固定)  │ │
│ │              │ - Tab 1: Content     │ │
│ │              │ - Tab 2: AI Chat     │ │
│ │              │ - Tab 3: Tasks       │ │
│ └──────────────┴──────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ モバイル (lg未満)                         │
│ ┌──────────────────────────────────────┐│
│ │ Inspector (フルスクリーンモーダル)       ││
│ │ ┌────────────────────────────────────┐││
│ │ │ Header: [タイトル]          [×]    │││
│ │ ├────────────────────────────────────┤││
│ │ │ タブ: [Content] [AI] [Tasks]       │││
│ │ ├────────────────────────────────────┤││
│ │ │ コンテンツ                          │││
│ │ └────────────────────────────────────┘││
│ └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Inspector State Machine

```typescript
type InspectorMode = 'calendar' | 'task' | 'event-detail' | 'default'

// 状態遷移
'default' → openCreateInspector({ mode: 'calendar' }) → 'calendar'
'calendar' → submitEvent() → 'default' + close
'default' → clickEvent(eventId) → 'event-detail'
```

## 🚨 必須ルール

### 1. 状態管理

**`useInspectorStore`を使用**:

```tsx
import { useInspectorStore } from '@/features/inspector/stores/inspector.store'

const { isInspectorOpen, toggleInspector, openInspector, closeInspector } = useInspectorStore()
```

### 2. イベント作成

**`useCreateEventInspector` hookを使用**:

```tsx
import { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'

const { openCreateInspector } = useCreateEventInspector()

// カレンダーからイベント作成
openCreateInspector({
  mode: 'calendar',
  context: {
    date: new Date(),
    source: 'calendar-grid',
  },
})
```

### 3. スタイリング

**globals.cssのセマンティックトークンを使用**:

```tsx
// ✅ 正しい
<div className="bg-card text-card-foreground border-border">

// ❌ 禁止
<div className="bg-white dark:bg-gray-900">
```

### 4. インポートパス

```tsx
// ✅ 正しい
import { Inspector } from '@/features/inspector'
import { useInspectorStore } from '@/features/inspector/stores/inspector.store'
import { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'

// ❌ 禁止（旧パス）
import { Inspector } from '@/components/layout/inspector'
```

## 📖 使用例

### Inspector開閉制御

```tsx
import { useInspectorStore } from '@/features/inspector/stores/inspector.store'

export const InspectorToggleButton = () => {
  const { isInspectorOpen, toggleInspector } = useInspectorStore()

  return <button onClick={toggleInspector}>{isInspectorOpen ? 'Close' : 'Open'} Inspector</button>
}
```

### イベント作成Inspector

```tsx
import { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'

export const CalendarGrid = () => {
  const { openCreateInspector } = useCreateEventInspector()

  const handleDateClick = (date: Date) => {
    openCreateInspector({
      mode: 'calendar',
      context: {
        date,
        source: 'calendar-grid',
      },
    })
  }

  return <div onClick={() => handleDateClick(new Date())} />
}
```

### カスタムInspectorコンテンツ

```tsx
import { useInspectorStore } from '@/features/inspector/stores/inspector.store'

export const CustomInspectorContent = () => {
  const { setInspectorMode, openInspector } = useInspectorStore()

  const showCustomContent = () => {
    setInspectorMode('custom')
    openInspector()
  }

  return <button onClick={showCustomContent}>Open Custom</button>
}
```

## 🔗 関連ドキュメント

- **機能モジュール構造**: [`../CLAUDE.md`](../CLAUDE.md)
- **イベント作成**: `../events/` - イベント管理機能
- **カレンダー統合**: `../calendar/` - カレンダー表示機能

## ⚠️ 注意事項

### Inspector幅調整（デスクトップのみ）

```typescript
// 最小幅: 360px
// 最大幅: 800px
// デフォルト: 480px

const { inspectorWidth, setInspectorWidthConstrained } = useInspectorStore()
setInspectorWidthConstrained(600) // 600pxに設定（制約内）
```

### モバイルではフルスクリーン

モバイル表示ではInspectorは常にフルスクリーンモーダルとして表示されます。幅調整は無視されます。

### AI Chat統合

AI Chatタブは`@/features/aichat`と統合されています：

```tsx
import { InspectorAIChat } from '@/features/inspector/components/inspector-ai-chat'
// 内部で useAIPanelStore を使用
```

---

**📖 最終更新**: 2025-10-07 | **バージョン**: v1.0
