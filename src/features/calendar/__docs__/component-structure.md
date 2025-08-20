# Calendar Component Structure

## 📁 現在のコンポーネント構造

### Root Structure
```
src/features/calendar/components/
├── views/                      # ビューコンポーネント群
├── layout/                     # レイアウトコンポーネント
├── shared/                     # 共通コンポーネント
├── overlays/                   # UIオーバーレイ
├── interactions/               # インタラクション関連
├── event/                      # イベント関連
└── CalendarController.tsx      # メインコントローラー
```

---

## 🗂️ Views (ビューコンポーネント)

### 1. DayView - 1日表示
```
views/DayView/
├── index.tsx                   # エクスポート管理
├── DayView.tsx                 # メインコンポーネント
├── DayView.types.ts           # 型定義
├── hooks/
│   ├── useDayView.ts          # Dayビューロジック
│   └── useDayEvents.ts        # イベント位置計算
└── components/
    └── DayContent.tsx         # 日コンテンツ
```

**特徴:**
- 1日詳細表示
- 現在時刻への自動スクロール
- ViewTransitionアニメーション
- タイムゾーン対応

**Props:**
- `dateRange: ViewDateRange`
- `currentDate: Date`
- イベントハンドラー群

---

### 2. ThreeDayView - 3日表示
```
views/ThreeDayView/
├── index.tsx
├── ThreeDayView.tsx
├── ThreeDayView.types.ts
└── hooks/
    └── useThreeDayView.ts
```

**特徴:**
- [昨日, 今日, 明日] の3日表示
- 各日33.3%の均等幅
- モバイル最適化
- 中央日のハイライト

**Props:**
- `centerDate?: Date` - 中央に表示する日付
- `dateRange: ViewDateRange`

---

### 3. WeekView - 週表示
```
views/WeekView/
├── index.tsx
├── WeekView.tsx
├── WeekView.types.ts
├── WeekCalendarLayout.tsx      # レガシーレイアウト
├── hooks/
│   ├── useWeekView.ts
│   └── useWeekEvents.ts
└── components/
    └── WeekGrid.tsx
```

**特徴:**
- 7日間を均等分割表示
- 週の開始日設定可能
- イベント重複表示対応
- 週末表示の切り替え

**Props:**
- `showWeekends?: boolean`
- `weekStartsOn?: 0 | 1`

---

### 4. TwoWeekView - 2週間表示
```
views/TwoWeekView/
├── index.tsx
├── TwoWeekView.tsx
├── TwoWeekView.types.ts
└── hooks/
    └── useTwoWeekView.ts
```

**特徴:**
- 14日連続表示
- 横スクロール対応
- デスクトップ向け最適化
- MonthViewエイリアス

**Props:**
- `startDate?: Date`
- 横スクロール機能

---

### 5. AgendaView - リスト表示
```
views/AgendaView/
├── index.tsx
├── AgendaView.tsx
├── AgendaView.types.ts
├── components/
│   ├── AgendaDayGroup.tsx      # 日付グループ
│   ├── AgendaEventItem.tsx     # イベント行
│   ├── AgendaEmptyState.tsx    # 空状態
│   └── AgendaHeader.tsx        # ヘッダー
└── hooks/
    └── useAgendaView.ts
```

**特徴:**
- Googleカレンダー風リスト
- 日付ごとのグループ化
- イベント詳細表示
- スティッキーヘッダー

**Props:**
- `groupByDate?: boolean`
- `startDate?: Date`
- `endDate?: Date`

---

## 🔧 共通コンポーネント (Shared)

### TimeColumn
時間軸の表示
```typescript
interface TimeColumnProps {
  startHour: number
  endHour: number
  interval: 15 | 30 | 60
  showBusinessHours?: boolean
}
```

### DateHeader
日付ヘッダーの表示
```typescript
interface DateHeaderProps {
  date: Date
  showDayName?: boolean
  showMonthYear?: boolean
  dayNameFormat?: 'short' | 'long' | 'narrow'
  isToday?: boolean
  isSelected?: boolean
}
```

### CurrentTimeLine
現在時刻線の表示
```typescript
interface CurrentTimeLineProps {
  startHour: number
  className?: string
}
```

### EventBlock
イベントブロックの表示
```typescript
interface EventBlockProps {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
  compact?: boolean
}
```

### TimezoneOffset
タイムゾーン表示
```typescript
interface TimezoneOffsetProps {
  timezone: string
}
```

---

## 🎨 レイアウトコンポーネント (Layout)

### CalendarLayout
カレンダー全体のレイアウト管理
- ヘッダー
- サイドバー
- メインコンテンツエリア

---

## 🎯 オーバーレイ (Overlays)

### DragSelectionOverlay
ドラッグ選択範囲の視覚化

### UndoToast
Undo/Redo トースト通知

---

## 🎮 インタラクション (Interactions)

### ViewTransition
ビュー切り替えアニメーション

### DnD (Drag and Drop)
ドラッグ&ドロップ機能

---

## 📝 Event Components

### AddPopup
イベント追加・編集ポップアップ

---

## 🎛️ CalendarController

### 役割
- 全ビューの統括管理
- ルーティング
- 状態管理
- イベントハンドリング

### 主要機能
- ビュー切り替え
- 日付ナビゲーション
- イベント CRUD
- キーボードショートカット

### サポートビュー
- `day` → DayView
- `3day` → ThreeDayView  
- `week` → WeekView
- `2week` → TwoWeekView (as MonthView)
- `schedule` → AgendaView

---

## 🔗 データフロー

```
CalendarController
├── State Management (Zustand Stores)
├── Event Handling
├── URL Routing
└── View Rendering
    ├── DayView
    ├── ThreeDayView
    ├── WeekView
    ├── TwoWeekView
    └── AgendaView
        ├── Shared Components
        ├── Custom Hooks
        └── Event Handlers
```

---

## 📱 レスポンシブ対応

### デスクトップ優先
- WeekView
- TwoWeekView
- AgendaView

### モバイル最適化
- DayView
- ThreeDayView

### ユニバーサル
- AgendaView (リスト形式)

---

*このドキュメントは現在のコンポーネント構造を説明しています。*  
*更新日: 2025-01-XX*