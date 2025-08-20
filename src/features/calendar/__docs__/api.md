# Calendar API Documentation

カレンダー機能のAPI仕様とデータフロー

## 🗂️ データ型

### 基本エンティティ

```typescript
// Task（予定）
interface Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number // 分
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

// TaskRecord（実績）
interface TaskRecord {
  id: string
  task_id?: string // 元の予定へのリンク
  title: string
  actual_start: string
  actual_end: string
  actual_duration: number // 分
  satisfaction?: 1 | 2 | 3 | 4 | 5
  focus_level?: 1 | 2 | 3 | 4 | 5
  energy_level?: 1 | 2 | 3 | 4 | 5
}

// Calendar（カレンダー）
interface Calendar {
  id: string
  userId: string
  name: string
  color: string
  isDefault: boolean
  isVisible: boolean
}
```

### 表示用データ型

```typescript
// CalendarEvent（表示用統合型）
interface CalendarEvent {
  id: string
  title: string
  startDate: Date
  endDate?: Date
  status: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional'
  color: string
  duration: number // minutes
  isMultiDay: boolean
}
```

## 🔄 データフロー

### データ取得フロー

```mermaid
graph TD
    A[CalendarView] --> B[useCalendarData]
    B --> C[API Service]
    C --> D[Supabase]
    D --> E[PostgreSQL]
    
    B --> F[Data Transformation]
    F --> G[CalendarEvent[]]
    G --> H[Views Components]
```

### 状態管理

```typescript
// Zustand Store
interface CalendarStore {
  // 状態
  currentView: CalendarViewType
  currentDate: Date
  selectedEvents: CalendarEvent[]
  filters: CalendarFilter
  
  // アクション
  setCurrentView: (view: CalendarViewType) => void
  setCurrentDate: (date: Date) => void
  selectEvent: (event: CalendarEvent) => void
  updateFilters: (filters: Partial<CalendarFilter>) => void
}
```

## 📡 API エンドポイント

### Tasks API

```typescript
// タスク取得
GET /api/tasks
Query Parameters:
  - start_date?: string (ISO date)
  - end_date?: string (ISO date)
  - status?: TaskStatus[]
  - calendar_id?: string

Response: Task[]

// タスク作成
POST /api/tasks
Body: CreateTaskInput
Response: Task

// タスク更新
PATCH /api/tasks/{id}
Body: Partial<Task>
Response: Task

// タスク削除
DELETE /api/tasks/{id}
Response: void
```

### TaskRecords API

```typescript
// 記録取得
GET /api/task-records
Query Parameters:
  - start_date?: string
  - end_date?: string
  - task_id?: string

Response: TaskRecord[]

// 記録作成
POST /api/task-records
Body: CreateRecordInput
Response: TaskRecord

// 記録更新
PATCH /api/task-records/{id}
Body: Partial<TaskRecord>
Response: TaskRecord
```

### Calendars API

```typescript
// カレンダー一覧取得
GET /api/calendars
Response: Calendar[]

// カレンダー作成
POST /api/calendars
Body: CreateCalendarInput
Response: Calendar

// カレンダー更新
PATCH /api/calendars/{id}
Body: UpdateCalendarInput
Response: Calendar
```

## 🔧 Hooks API

### useCalendarData

カレンダーデータの取得・管理

```typescript
function useCalendarData(options: CalendarDataOptions) {
  // 戻り値
  return {
    events: CalendarEvent[]        // 表示用イベント一覧
    loading: boolean              // ローディング状態
    error: Error | null           // エラー状態
    refetch: () => void           // データ再取得
    
    // イベント操作
    createEvent: (input: CreateEventInput) => Promise<void>
    updateEvent: (id: string, input: Partial<CalendarEvent>) => Promise<void>
    deleteEvent: (id: string) => Promise<void>
    
    // バッチ操作
    createBatch: (events: CreateEventInput[]) => Promise<void>
    updateBatch: (updates: EventUpdate[]) => Promise<void>
  }
}

interface CalendarDataOptions {
  viewType: CalendarViewType
  dateRange: { start: Date; end: Date }
  calendarIds?: string[]
  filters?: CalendarFilter
  enableRealtime?: boolean
}
```

### useCalendarNavigation

カレンダーナビゲーション管理

```typescript
function useCalendarNavigation(initialView?: CalendarViewType) {
  return {
    // 現在の状態
    currentView: CalendarViewType
    currentDate: Date
    dateRange: ViewDateRange
    
    // ナビゲーション
    goToToday: () => void
    goToPrevious: () => void
    goToNext: () => void
    goToDate: (date: Date) => void
    
    // ビュー切り替え
    setView: (view: CalendarViewType) => void
    
    // URL同期
    updateUrl: boolean
  }
}
```

### useEventInteraction

イベントインタラクション管理

```typescript
function useEventInteraction() {
  return {
    // 選択状態
    selectedEvents: CalendarEvent[]
    selectEvent: (event: CalendarEvent) => void
    selectMultiple: (events: CalendarEvent[]) => void
    clearSelection: () => void
    
    // ドラッグ&ドロップ
    isDragging: boolean
    draggedEvent: CalendarEvent | null
    startDrag: (event: CalendarEvent) => void
    updateDragPosition: (position: { x: number; y: number }) => void
    endDrag: (dropTarget?: DropTarget) => void
    
    // コンテキストメニュー
    contextMenu: {
      isOpen: boolean
      position: { x: number; y: number }
      event: CalendarEvent | null
    }
    openContextMenu: (event: CalendarEvent, position: Point) => void
    closeContextMenu: () => void
  }
}
```

## 🎨 コンポーネント API

### CalendarView Props

```typescript
interface CalendarViewProps {
  initialViewType?: CalendarViewType
  initialDate?: Date
  className?: string
  
  // カスタマイズ
  enabledViews?: CalendarViewType[]
  defaultCalendars?: string[]
  
  // イベントハンドラー
  onEventSelect?: (event: CalendarEvent) => void
  onEventCreate?: (input: CreateEventInput) => void
  onViewChange?: (view: CalendarViewType) => void
  onDateChange?: (date: Date) => void
  
  // 高度な設定
  customRenderers?: {
    eventCard?: ComponentType<EventCardProps>
    timeSlot?: ComponentType<TimeSlotProps>
    header?: ComponentType<HeaderProps>
  }
}
```

### ViewComponent Props

```typescript
interface ViewComponentProps {
  events: CalendarEvent[]
  dateRange: ViewDateRange
  selectedEvents: CalendarEvent[]
  
  // インタラクション
  onEventSelect: (event: CalendarEvent) => void
  onEventMove: (eventId: string, newStart: Date) => void
  onEventResize: (eventId: string, newDuration: number) => void
  onSlotClick: (date: Date) => void
  
  // 表示設定
  showWeekends: boolean
  timeFormat: '12h' | '24h'
  firstDayOfWeek: number
  
  // カスタマイズ
  className?: string
  style?: CSSProperties
}
```

## 🔄 リアルタイム API

### Subscription API

```typescript
// リアルタイム購読
function useRealtimeCalendar(calendarIds: string[]) {
  useEffect(() => {
    const subscription = supabase
      .channel('calendar-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `calendar_id=in.(${calendarIds.join(',')})`
        },
        handleTaskChange
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'task_records',
          filter: `calendar_id=in.(${calendarIds.join(',')})`
        },
        handleRecordChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [calendarIds])
}
```

### イベント形式

```typescript
interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'tasks' | 'task_records' | 'calendars'
  new?: DbRecord
  old?: DbRecord
  timestamp: string
}
```

## 📊 パフォーマンス API

### データ最適化

```typescript
// 仮想化設定
interface VirtualizationConfig {
  enabled: boolean
  itemHeight: number
  bufferSize: number
  scrollThreshold: number
}

// キャッシュ設定
interface CacheConfig {
  enableMemoryCache: boolean
  cacheSize: number
  ttl: number // Time to live in seconds
}
```

### バッチ処理

```typescript
// バッチ更新API
async function batchUpdateEvents(updates: EventBatchUpdate[]): Promise<void> {
  const batches = chunk(updates, BATCH_SIZE)
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(update => updateSingleEvent(update))
    )
  }
}

interface EventBatchUpdate {
  id: string
  operation: 'update' | 'delete'
  data?: Partial<CalendarEvent>
}
```

## 🛠️ 開発者ツール

### Debug API

```typescript
// デバッグ情報取得
if (process.env.NODE_ENV === 'development') {
  window.__CALENDAR_API__ = {
    getCurrentState: () => store.getState(),
    getEventById: (id: string) => findEventById(id),
    simulateRealtimeEvent: (event: RealtimeEvent) => handleRealtimeEvent(event),
    clearCache: () => cache.clear(),
    getPerformanceMetrics: () => performanceMonitor.getMetrics()
  }
}
```

## 🏷️ タグ

`#api` `#calendar` `#typescript` `#hooks` `#realtime`