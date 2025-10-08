# Calendar Views Architecture

## 📐 ビューアーキテクチャ概要

このドキュメントでは、Calendar機能の5つの主要ビューとその設計思想・実装詳細を説明します。

---

## 🎯 設計方針

### 統一された設計原則

1. **一貫したファイル構造** - 全ビューで同一のディレクトリ構成
2. **TypeScript型安全性** - 包括的な型定義による品質保証
3. **カスタムフック分離** - ビューロジックとUI表示の責務分離
4. **共通コンポーネント活用** - DRY原則による再利用性向上
5. **レスポンシブ対応** - デバイスサイズに応じた最適化

### 共通Props構造

```typescript
interface CommonViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
  className?: string

  // Event handlers
  onTaskClick?: (task: TaskEvent) => void
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  onRestoreEvent?: (event: CalendarEvent) => Promise<void>
  onEmptyClick?: (date: Date, time: string) => void

  // Navigation handlers
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}
```

---

## 📱 View Types & Use Cases

### 1. DayView - 詳細表示

**用途:** 1日の詳細スケジュール管理
**最適デバイス:** 全デバイス
**特徴:**

- 最も詳細な時間管理
- 現在時刻への自動スクロール
- タスクとイベントの統合表示

### 2. ThreeDayView - バランス表示

**用途:** 短期計画と即座の文脈把握
**最適デバイス:** モバイル・タブレット
**特徴:**

- [昨日, 今日, 明日] の文脈表示
- モバイル最適化設計
- 各日33.3%の均等配分

### 3. WeekView - 標準表示

**用途:** 週単位の計画管理
**最適デバイス:** デスクトップ・タブレット
**特徴:**

- 一般的な週カレンダー表示
- 土日表示の切り替え
- 週開始日の選択可能

### 4. TwoWeekView - 俯瞰表示

**用途:** 中期計画の俯瞰
**最適デバイス:** デスクトップ
**特徴:**

- 14日連続表示
- 横スクロール対応
- MonthViewの代替機能

### 5. AgendaView - リスト表示

**用途:** イベント詳細の確認・管理
**最適デバイス:** 全デバイス
**特徴:**

- Googleカレンダー風リスト
- イベント詳細情報の表示
- 縦スクロールナビゲーション

---

## 🏗️ ファイル構造パターン

### 標準構造 (DayView, WeekView, TwoWeekView, AgendaView)

```
views/[ViewName]/
├── index.tsx                   # エクスポート管理
├── [ViewName].tsx             # メインコンポーネント
├── [ViewName].types.ts        # 型定義
├── hooks/
│   ├── use[ViewName].ts       # メインロジック
│   └── use[ViewName]Events.ts # イベント処理 (必要時)
└── components/                 # ビュー固有コンポーネント
    └── [Specific].tsx
```

### 簡略構造 (ThreeDayView)

```
views/ThreeDayView/
├── index.tsx
├── ThreeDayView.tsx
├── ThreeDayView.types.ts
└── hooks/
    └── useThreeDayView.ts
```

### 拡張構造 (AgendaView)

```
views/AgendaView/
├── index.tsx
├── AgendaView.tsx
├── AgendaView.types.ts
├── components/
│   ├── AgendaDayGroup.tsx     # 日付グループ
│   ├── AgendaEventItem.tsx    # イベント行
│   ├── AgendaEmptyState.tsx   # 空状態
│   └── AgendaHeader.tsx       # ヘッダー
└── hooks/
    └── useAgendaView.ts
```

---

## 🎨 レイアウトシステム

### グリッドベースビュー (Day, ThreeDay, Week, TwoWeek)

#### 基本構造

```
┌─────────────────────────────────────────┐
│                Header                   │ ← 日付ヘッダー行
├─────┬───────────────────────────────────┤
│Time │           Content Grid            │ ← メインコンテンツ
│Axis │                                   │
│     │  ┌─────┐ ┌─────┐ ┌─────┐         │
│ 9   │  │Event│ │     │ │Event│         │
│10   │  │     │ │Event│ │     │         │
│11   │  └─────┘ │     │ └─────┘         │
│     │          └─────┘                 │
└─────┴───────────────────────────────────┘
```

#### 共通要素

- **TimeColumn (64px固定幅)** - 時間軸表示
- **DateHeader** - 日付・曜日表示
- **CurrentTimeLine** - 現在時刻線
- **EventBlock** - イベント表示ブロック
- **TimezoneOffset** - タイムゾーン表示

#### ビュー別レイアウト特性

**DayView**

- 列数: 1
- 列幅: 100%
- 時間範囲: 0-24時
- 特殊機能: 現在時刻スクロール

**ThreeDayView**

- 列数: 3
- 列幅: 33.3% each
- ラベル: [昨日, 今日, 明日]
- 特殊機能: 中央日ハイライト

**WeekView**

- 列数: 7 (土日除外時は5)
- 列幅: 14.3% each (20% for weekdays-only)
- 週開始: 設定可能 (日曜/月曜)
- 特殊機能: 週末背景色

**TwoWeekView**

- 列数: 14
- 列幅: 7.1% each (画面幅に均等分割)
- スクロール: 縦スクロールのみ（横スクロール廃止）
- 特殊機能: 週境界線削除、日付ヘッダー縦線削除

### リストベースビュー (Agenda)

#### 基本構造

```
┌─────────────────────────────────────────┐
│                Header                   │ ← 期間・統計情報
├─────────────────────────────────────────┤
│ 12月20日（木）              [+]         │ ← 日付グループ (sticky)
├─────────────────────────────────────────┤
│ 🕘 09:00-10:00  朝会                   │ ← イベント行
│               📍 会議室A                │
├─────────────────────────────────────────┤
│ 🕐 14:00-15:30  クライアントMTG         │
│               📍 オンライン             │
├─────────────────────────────────────────┤
│ 12月21日（金）              [+]         │ ← 次の日付グループ
└─────────────────────────────────────────┘
```

#### 構成要素

- **AgendaHeader** - 期間情報・今日へジャンプ
- **AgendaDayGroup** - 日付グループ (sticky header)
- **AgendaEventItem** - イベント詳細行
- **AgendaEmptyState** - 空状態表示

---

## ⚙️ 技術実装詳細

### カスタムフック設計

#### useXxxView の責務

```typescript
// 共通パターン
interface UseViewReturn {
  dates: Date[] // 表示日付配列
  eventsByDate: Record<string, CalendarEvent[]> // 日付別イベント
  todayIndex: number // 今日のインデックス
  scrollToNow: () => void // 現在時刻スクロール
  isCurrentPeriod: boolean // 現在期間判定
}
```

#### 実装例: useDayView

```typescript
export function useDayView({ date, events, onEventUpdate }: UseDayViewOptions): UseDayViewReturn {
  // 日付正規化
  const displayDates = useMemo(() => [date], [date])

  // イベントフィルタリング・ソート
  const dayEvents = useMemo(() => {
    return events
      .filter((event) => isSameDay(event.startDate, date))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }, [events, date])

  // 今日判定・スクロール処理
  const isToday = useMemo(() => isToday(date), [date])
  const scrollToNow = useCallback(() => {
    // 現在時刻スクロール実装
  }, [isToday])

  return { dayEvents, scrollToNow, isToday /* ... */ }
}
```

### イベント位置計算

#### グリッドビューでの配置

```typescript
// イベント位置計算の基本アルゴリズム
function calculateEventPosition(event: CalendarEvent): EventPosition {
  const HOUR_HEIGHT = 72 // 1時間=72px

  // 開始位置計算
  const startHour = event.startDate.getHours()
  const startMinute = event.startDate.getMinutes()
  const top = (startHour + startMinute / 60) * HOUR_HEIGHT

  // 高さ計算
  const duration = calculateDuration(event.startDate, event.endDate)
  const height = Math.max(20, duration * HOUR_HEIGHT) // 最小20px

  return { top, height /* ... */ }
}
```

#### 重複イベント処理

```typescript
// イベント重複時の列配置
function calculateEventColumns(events: CalendarEvent[]): ColumnInfo[] {
  const columns: ColumnInfo[] = []
  const occupiedColumns: { end: number }[] = []

  events.forEach((event) => {
    // 利用可能な列を探索
    let columnIndex = 0
    while (columnIndex < occupiedColumns.length && occupiedColumns[columnIndex].end > event.start) {
      columnIndex++
    }

    // 列を占有
    if (columnIndex >= occupiedColumns.length) {
      occupiedColumns.push({ end: event.end })
    } else {
      occupiedColumns[columnIndex].end = event.end
    }

    columns.push({
      column: columnIndex,
      totalColumns: occupiedColumns.length,
    })
  })

  return columns
}
```

---

## 🎛️ CalendarController 統合

### ビューの切り替えロジック

```typescript
const renderView = () => {
  const commonProps = {
    dateRange: viewDateRange,
    tasks: filteredTasks,
    events: filteredEvents,
    currentDate,
    // 共通イベントハンドラー
    onEventClick: handleEventClick,
    onCreateEvent: handleCreateEvent,
    // ...
  }

  switch (viewType) {
    case 'day':
      return <DayView {...commonProps} />
    case '3day':
      return <ThreeDayView {...commonProps} />
    case 'week':
      return <WeekView {...commonProps} />
    case '2week':
    case 'month':  // TwoWeekView as MonthView
      return <TwoWeekView {...commonProps} />
    case 'schedule':
      return <AgendaView {...commonProps} />
    default:
      return <DayView {...commonProps} />
  }
}
```

### キーボードショートカット

```typescript
// ビュー切り替えショートカット
const shortcuts = {
  'Cmd+1': 'day', // 1日表示
  'Cmd+3': '3day', // 3日表示
  'Cmd+7': 'week', // 週表示
  'Cmd+14': '2week', // 2週間表示
  'Cmd+A': 'schedule', // アジェンダ表示
  'Cmd+T': 'today', // 今日へジャンプ
}
```

---

## 🔄 データフロー

### Props Down, Events Up パターン

```
CalendarController
├── State & Event Handlers
├── Common Props Generation
└── View-Specific Props
    ├── DayView
    │   ├── useDayView Hook
    │   ├── Shared Components
    │   └── Event Callbacks ↗
    ├── WeekView
    │   ├── useWeekView Hook
    │   ├── Shared Components
    │   └── Event Callbacks ↗
    └── Other Views...
```

### イベント処理フロー

```
1. User Interaction (click, drag, etc.)
   ↓
2. View Component Event Handler
   ↓
3. CalendarController Unified Handler
   ↓
4. Store Update (EventStore, TaskStore)
   ↓
5. Props Update & Re-render
```

---

## 📏 スタイリング規約

### 共通デザイントークン

```css
/* 基本サイズ */
--hour-height: 72px; /* 1時間の高さ */
--time-column-width: 64px; /* 時間軸の幅 */
--day-min-width: 120px; /* 日列の最小幅 (TwoWeekView) */

/* 色彩 */
--primary-color: hsl(var(--primary));
--border-color: hsl(var(--border));
--muted-color: hsl(var(--muted));

/* 間隔 */
--grid-gap: 1px;
--padding-standard: 1rem;
--padding-compact: 0.5rem;
```

### レスポンシブブレークポイント

```typescript
const breakpoints = {
  mobile: '768px', // ThreeDayView 最適
  tablet: '1024px', // WeekView 推奨
  desktop: '1280px', // TwoWeekView 推奨
}
```

---

## 🔧 パフォーマンス最適化

### React最適化

```typescript
// メモ化による不要な再レンダリング防止
const EventBlock = React.memo(({ event, onClick }) => {
  // イベント表示コンポーネント
})

// useMemo による重い計算のキャッシュ
const eventsByDate = useMemo(() => {
  return groupEventsByDate(events)
}, [events])

// useCallback によるイベントハンドラーの安定化
const handleEventClick = useCallback(
  (event) => {
    onEventClick?.(event)
  },
  [onEventClick]
)
```

### 仮想スクロール対応準備

```typescript
// 大量イベント対応 (将来実装)
interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan: number
}
```

---

## 🎯 今後の拡張計画

### 新ビュー候補

1. **MonthView** - 真の月表示 (カレンダーグリッド)
2. **YearView** - 年間俯瞰表示
3. **TimelineView** - 横軸時間のタイムライン
4. **KanbanView** - タスク管理特化

### 機能拡張

1. **マルチカレンダー** - 複数カレンダーの重ね合わせ
2. **カスタムビュー** - ユーザー定義期間
3. **分割画面** - 複数ビューの同時表示
4. **印刷対応** - PDF出力機能

---

_このドキュメントは Calendar Views Architecture の詳細を説明しています。_  
_更新日: 2025-01-XX_  
_責任者: Calendar Development Team_
