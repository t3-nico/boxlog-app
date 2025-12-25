# Shared Components Architecture

## 🧩 共通コンポーネント設計

このドキュメントでは、Calendar機能の全ビューで共有される再利用可能コンポーネントの設計と実装を説明します。

---

## 🎯 設計方針

### DRY (Don't Repeat Yourself) 原則

- **単一責任** - 各コンポーネントは明確な1つの責務
- **再利用性** - 複数ビューで使用可能な汎用設計
- **カスタマイズ性** - Props による柔軟な設定
- **一貫性** - 統一されたAPIとスタイル

### 共通Props パターン

```typescript
interface SharedComponentProps {
  className?: string; // カスタムスタイル
  children?: React.ReactNode; // 拡張コンテンツ
  // コンポーネント固有のProps...
}
```

---

## 📦 コンポーネントカタログ

### 🏗️ Layout Components (v2.0)

#### ScrollableCalendarLayout

**責務:** 統一されたスクロール可能レイアウトシステム  
**使用ビュー:** DayView, ThreeDayView, WeekView, TwoWeekView

```typescript
interface ScrollableCalendarLayoutProps {
  children: React.ReactNode
  className?: string
  timezone?: string
  scrollToHour?: number            // 初期スクロール位置
  showTimeColumn?: boolean         // 時間軸表示制御
  showCurrentTime?: boolean        // 現在時刻線表示制御
  showTimezone?: boolean           // UTC/タイムゾーン表示制御
  timeColumnWidth?: number         // 時間軸幅 (default: 64px)
  onTimeClick?: (hour: number, minute: number) => void
  displayDates?: Date[]            // 表示対象日付
  viewMode?: 'day' | '3day' | 'week' | '2week'
  header?: React.ReactNode         // ヘッダーコンテンツ
}

// 使用例
<ScrollableCalendarLayout
  timezone="Asia/Tokyo"
  scrollToHour={8}
  showTimeColumn={true}
  showTimezone={true}
  onTimeClick={(hour, minute) => handleTimeClick(hour, minute)}
  header={<DateHeader date={currentDate} />}
>
  {/* ビューコンテンツ */}
</ScrollableCalendarLayout>
```

**主要特徴:**

- 時間ラベルとグリッド線の完全同期
- UTCタイムゾーンの左端固定配置
- レスポンシブHOUR_HEIGHT対応
- 統一されたスクロール動作

#### CalendarLayoutWithHeader

**責務:** ヘッダー付きレイアウトのラッパー  
**内部実装:** ScrollableCalendarLayoutを使用

```typescript
interface CalendarLayoutWithHeaderProps extends ScrollableCalendarLayoutProps {
  header: React.ReactNode
}

// 使用例
<CalendarLayoutWithHeader
  header={headerComponent}
  timezone={timezone}
  viewMode="week"
>
  {/* ビューコンテンツ */}
</CalendarLayoutWithHeader>
```

### 🕒 Time & Date Components

#### TimeColumn

**責務:** 時間軸の表示  
**使用ビュー:** DayView, ThreeDayView, WeekView, TwoWeekView

```typescript
interface TimeColumnProps {
  startHour: number              // 開始時間 (0-23)
  endHour: number               // 終了時間 (1-24)
  interval: 15 | 30 | 60        // 目盛り間隔 (分)
  showBusinessHours?: boolean   // 営業時間のハイライト
  className?: string
}

// 使用例
<TimeColumn
  startHour={0}
  endHour={24}
  interval={60}
  showBusinessHours={false}
  className="h-full"
/>
```

**実装特徴:**

- 固定幅64px
- スティッキー配置対応
- 営業時間のハイライト表示
- アクセシビリティ対応

#### DateHeader

**責務:** 日付ヘッダーの表示  
**使用ビュー:** 全ビュー

```typescript
interface DateHeaderProps {
  date: Date                    // 表示日付
  className?: string
  isToday?: boolean            // 今日フラグ
  isSelected?: boolean         // 選択フラグ
  showDayName?: boolean        // 曜日表示
  showMonthYear?: boolean      // 月年表示
  dayNameFormat?: 'short' | 'long' | 'narrow'
  dateFormat?: string          // カスタム日付フォーマット
  onClick?: (date: Date) => void
  onDoubleClick?: (date: Date) => void
}

// 使用例
<DateHeader
  date={new Date()}
  className="text-center"
  showDayName={true}
  showMonthYear={false}
  dayNameFormat="short"
  dateFormat="d"
  isToday={true}
/>
```

**実装特徴:**

- date-fns による国際化対応
- 複数フォーマット対応
- インタラクティブ機能
- 状態表示 (今日、選択中)

#### CurrentTimeLine

**責務:** 現在時刻線の表示  
**使用ビュー:** DayView, ThreeDayView, WeekView, TwoWeekView (今日がある場合)

```typescript
interface CurrentTimeLineProps {
  startHour: number            // 表示開始時間
  className?: string
  showDot?: boolean           // 先頭の丸マーカー
  color?: string              // 線の色
}

// 使用例
<CurrentTimeLine
  startHour={0}
  className="absolute left-0 right-0 z-20 pointer-events-none"
/>
```

**実装特徴:**

- リアルタイム位置計算
- absolute positioning
- pointer-events: none で干渉回避
- 目立つ赤色デザイン

#### TimezoneOffset

**責務:** タイムゾーン情報の表示  
**使用ビュー:** 全ビュー

```typescript
interface TimezoneOffsetProps {
  timezone: string             // タイムゾーン識別子
  format?: 'short' | 'long'   // 表示形式
  showOffset?: boolean        // UTC オフセット表示
  className?: string
}

// 使用例
<TimezoneOffset
  timezone="Asia/Tokyo"
  format="short"
  showOffset={true}
/>
```

**実装特徴:**

- Intl.DateTimeFormat 使用
- 自動サマータイム対応
- コンパクト表示

---

### 📅 Event Components

#### EventBlock

**責務:** イベントブロックの表示  
**使用ビュー:** DayView, ThreeDayView, WeekView, TwoWeekView

```typescript
interface EventBlockProps {
  event: CalendarEvent         // イベントデータ
  onClick?: (event: CalendarEvent) => void
  onDoubleClick?: (event: CalendarEvent) => void
  onContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  compact?: boolean           // コンパクト表示
  showTime?: boolean          // 時間表示
  showLocation?: boolean      // 場所表示
  maxLines?: number          // 最大行数
  className?: string
}

// 使用例
<EventBlock
  event={event}
  onClick={handleEventClick}
  compact={false}
  showTime={true}
  showLocation={true}
  className="h-full w-full"
/>
```

**実装特徴:**

- イベント色の自動適用
- レスポンシブテキスト調整
- ホバー・フォーカス状態
- アクセシビリティ対応
- 複数インタラクション対応

#### EventActionMenu

**責務:** イベントアクションメニュー  
**使用ビュー:** 全ビュー (イベント右クリック時)

```typescript
interface EventActionMenuProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onDuplicate?: (event: CalendarEvent) => void;
  onClose?: () => void;
  visible: boolean;
}
```

**実装特徴:**

- コンテキストメニュー
- 動的位置計算
- キーボード操作対応

---

### 🎨 Layout Components

#### GridBackground

**責務:** グリッド背景の描画  
**使用ビュー:** DayView, ThreeDayView, WeekView, TwoWeekView

```typescript
interface GridBackgroundProps {
  hourHeight: number          // 1時間の高さ
  hourCount: number          // 時間数
  showQuarterLines?: boolean  // 15分線表示
  showHalfLines?: boolean    // 30分線表示
  businessHours?: { start: number; end: number }
  className?: string
}

// 使用例
<GridBackground
  hourHeight={72}
  hourCount={24}
  showQuarterLines={false}
  showHalfLines={true}
  businessHours={{ start: 9, end: 18 }}
/>
```

**実装特徴:**

- CSS Grid または SVG による描画
- 営業時間のハイライト
- 細かい時間目盛り

#### ScrollContainer

**責務:** スクロール領域の管理  
**使用ビュー:** 全ビュー

```typescript
interface ScrollContainerProps {
  direction: 'vertical' | 'horizontal' | 'both';
  className?: string;
  onScroll?: (event: React.UIEvent) => void;
  scrollToTime?: string; // 初期スクロール位置
  children: React.ReactNode;
}
```

**実装特徴:**

- スムーススクロール
- スクロール位置の復元
- パフォーマンス最適化

---

### 🎭 Interactive Components

#### DragSelectionOverlay

**責務:** ドラッグ選択範囲の視覚化  
**使用ビュー:** DayView, ThreeDayView, WeekView, TwoWeekView

```typescript
interface DragSelectionOverlayProps {
  dragState: {
    isDragging: boolean;
    dragStartTime: string | null;
    dragEndTime: string | null;
    dragDate: Date | null;
  };
  hourHeight?: number;
  className?: string;
}
```

**実装特徴:**

- 半透明オーバーレイ
- リアルタイム範囲更新
- ドラッグ終了時のイベント発火

#### UndoToast

**責務:** Undo/Redo 通知の表示  
**使用ビュー:** 全ビュー (アクション実行時)

```typescript
interface UndoToastProps {
  action: UndoAction | null;
  onUndo: (action: UndoAction) => void;
  onDismiss: () => void;
  autoHideDelay?: number;
}

interface UndoAction {
  id: string;
  type: 'create' | 'delete' | 'edit' | 'move';
  description: string;
  data: Record<string, unknown>;
  timestamp: number;
}
```

**実装特徴:**

- 自動非表示タイマー
- プログレスバー表示
- スワイプ操作対応

---

## 🎨 デザインシステム統合

### カラーパレット

```typescript
interface EventColors {
  primary: string; // #3b82f6 (Blue)
  secondary: string; // #8b5cf6 (Purple)
  success: string; // #10b981 (Green)
  warning: string; // #f59e0b (Amber)
  danger: string; // #ef4444 (Red)
  // 8色のカテゴリ色
}
```

### タイポグラフィ

```typescript
interface Typography {
  eventTitle: 'text-sm font-medium';
  eventTime: 'text-xs font-mono';
  eventLocation: 'text-xs text-muted-foreground';
  dateHeader: 'text-lg font-semibold';
  timeLabel: 'text-xs text-muted-foreground';
}
```

### スペーシング

```typescript
interface Spacing {
  hourHeight: 72; // 1時間 = 72px
  timeColumnWidth: 64; // 時間軸 = 64px
  eventPadding: 4; // イベント内余白
  gridGap: 1; // グリッド間隔
}
```

---

## 🔧 実装パターン

### Compound Component パターン

```typescript
// DateHeader を compound component として設計
const DateHeader = ({ children, ...props }) => {
  return (
    <div className="date-header" {...props}>
      {children}
    </div>
  )
}

DateHeader.DayName = ({ format, ...props }) => { /* 曜日表示 */ }
DateHeader.DayNumber = ({ format, ...props }) => { /* 日付表示 */ }
DateHeader.MonthYear = ({ format, ...props }) => { /* 月年表示 */ }

// 使用例
<DateHeader date={date}>
  <DateHeader.DayName format="short" />
  <DateHeader.DayNumber format="d" />
</DateHeader>
```

### Render Props パターン

```typescript
interface EventBlockProps {
  event: CalendarEvent
  children?: (props: EventRenderProps) => React.ReactNode
}

// カスタムレンダリング可能
<EventBlock event={event}>
  {({ event, isSelected, handlers }) => (
    <CustomEventDisplay
      event={event}
      selected={isSelected}
      {...handlers}
    />
  )}
</EventBlock>
```

### Hook Integration

```typescript
// 共通コンポーネントから専用フックを提供
export function useEventBlock(event: CalendarEvent) {
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlers = {
    onClick: () => setIsSelected(!isSelected),
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isSelected, isHovered, handlers };
}
```

---

## 📱 レスポンシブ対応

### ブレークポイント戦略

```typescript
const breakpoints = {
  sm: '640px',   // モバイル
  md: '768px',   // タブレット
  lg: '1024px',  // デスクトップ
  xl: '1280px',  // 大画面
}

// コンポーネント内での使用
const EventBlock = ({ event, compact }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const showLocation = !isMobile || !compact

  return (
    <div className={cn(
      'event-block',
      isMobile && 'text-xs',
      !isMobile && 'text-sm'
    )}>
      {/* コンテンツ */}
    </div>
  )
}
```

### アダプティブレンダリング

```typescript
// デバイスに応じたコンポーネント切り替え
const ResponsiveEventBlock = (props) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile
    ? <CompactEventBlock {...props} />
    : <DetailedEventBlock {...props} />
}
```

---

## 🔄 状態管理統合

### Zustand Store連携

```typescript
// EventBlock での状態連携例
const EventBlock = ({ event }) => {
  const { selectedEventId, setSelectedEventId } = useEventStore()
  const { timezone } = useCalendarSettingsStore()

  const isSelected = selectedEventId === event.id
  const localTime = convertToTimezone(event.startDate, timezone)

  return (
    <div
      className={cn('event-block', isSelected && 'ring-2')}
      onClick={() => setSelectedEventId(event.id)}
    >
      {format(localTime, 'HH:mm')} {event.title}
    </div>
  )
}
```

### イベント伝播

```typescript
// 上位コンポーネントへのイベント伝播
const EventBlock = ({ event, onEventAction }) => {
  const handleClick = (e) => {
    e.stopPropagation()
    onEventAction?.({
      type: 'click',
      event,
      nativeEvent: e
    })
  }

  return <div onClick={handleClick}>{/* ... */}</div>
}
```

---

## 🧪 テスト戦略

### Unit Test 例

```typescript
describe('DateHeader', () => {
  it('今日の日付を適切にハイライトする', () => {
    const today = new Date()
    render(<DateHeader date={today} isToday={true} />)

    expect(screen.getByRole('button')).toHaveClass('text-primary')
  })

  it('クリックイベントを正しく発火する', () => {
    const handleClick = jest.fn()
    const date = new Date()

    render(<DateHeader date={date} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith(date)
  })
})
```

### Integration Test

```typescript
describe('TimeColumn + EventBlock 統合', () => {
  it('時間軸とイベントの位置が正しく連動する', () => {
    const event = {
      startDate: new Date('2025-01-01 09:00'),
      endDate: new Date('2025-01-01 10:00')
    }

    render(
      <div className="relative">
        <TimeColumn startHour={0} endHour={24} />
        <EventBlock event={event} />
      </div>
    )

    // 9時の位置にイベントが配置されていることを確認
    const eventElement = screen.getByText(event.title)
    expect(eventElement).toHaveStyle({ top: '648px' }) // 9 * 72px
  })
})
```

---

## 🎯 最適化技術

### React.memo 活用

```typescript
// 重い計算を伴うコンポーネントのメモ化
const EventBlock = React.memo(({ event, ...props }) => {
  return <div>{/* レンダリング */}</div>
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.updatedAt === nextProps.event.updatedAt
  )
})
```

### useMemo による計算最適化

```typescript
const TimeColumn = ({ startHour, endHour, interval }) => {
  // 時間ラベルの計算をメモ化
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          isHour: minute === 0,
          isQuarter: minute % 15 === 0
        })
      }
    }
    return slots
  }, [startHour, endHour, interval])

  return (
    <div>
      {timeSlots.map(slot => (
        <TimeSlot key={slot.time} {...slot} />
      ))}
    </div>
  )
}
```

---

## 📚 使用例・ベストプラクティス

### 典型的な使用パターン

#### 基本的なグリッドビュー構築

```typescript
const BasicGridView = ({ events, date }) => {
  return (
    <div className="flex h-full">
      {/* 時間軸 */}
      <TimeColumn
        startHour={0}
        endHour={24}
        interval={60}
        className="w-16 border-r"
      />

      {/* メインコンテンツ */}
      <div className="flex-1 relative">
        {/* グリッド背景 */}
        <GridBackground
          hourHeight={72}
          hourCount={24}
          showHalfLines={true}
        />

        {/* 現在時刻線 */}
        {isToday(date) && (
          <CurrentTimeLine
            startHour={0}
            className="absolute inset-x-0 z-20"
          />
        )}

        {/* イベント */}
        {events.map(event => (
          <EventBlock
            key={event.id}
            event={event}
            onClick={handleEventClick}
            className="absolute"
            style={calculateEventPosition(event)}
          />
        ))}
      </div>
    </div>
  )
}
```

#### アクセシブルなイベントブロック

```typescript
const AccessibleEventBlock = ({ event, onActivate }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`イベント: ${event.title}, ${format(event.startDate, 'HH:mm')}から`}
      className="event-block focus:ring-2 focus:ring-primary"
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate()
        }
      }}
    >
      <div className="sr-only">
        イベント詳細: {event.description}
      </div>
      <div aria-hidden="true">
        {event.title}
      </div>
    </div>
  )
}
```

---

_このドキュメントは Calendar Shared Components の設計と実装を説明しています。_  
_更新日: 2025-01-XX_  
_責任者: Calendar Development Team_
