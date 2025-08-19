# Calendar Data Flow Architecture

## 🔄 データフロー設計

このドキュメントでは、Calendar機能におけるデータの流れ、状態管理、イベント処理の全体的なアーキテクチャを説明します。

---

## 🎯 アーキテクチャ概要

### レイヤード・アーキテクチャ
```
┌─────────────────────────────────────────┐
│             Presentation Layer          │ ← UI Components (Views)
├─────────────────────────────────────────┤
│             Application Layer           │ ← CalendarController
├─────────────────────────────────────────┤
│             Domain Layer                │ ← Business Logic (Hooks)
├─────────────────────────────────────────┤
│             Infrastructure Layer        │ ← State Management (Stores)
└─────────────────────────────────────────┘
```

### データフロー原則
1. **単方向データフロー** - Props down, Events up
2. **状態の中央集約** - Zustand stores による管理
3. **責務の分離** - UI、ロジック、データの明確な分離
4. **型安全性** - TypeScript による厳密な型チェック

---

## 🗄️ State Management

### Store構成
```typescript
// メインストア群
interface CalendarStores {
  eventStore: EventStore           // イベントデータ管理
  taskStore: TaskStore             // タスクデータ管理
  recordsStore: RecordsStore       // 実績記録管理
  calendarSettingsStore: CalendarSettingsStore  // 設定管理
  calendarLayoutStore: CalendarLayoutStore       // レイアウト状態
}
```

#### EventStore
```typescript
interface EventStore {
  // State
  events: Event[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchEvents: () => Promise<void>
  createEvent: (data: CreateEventRequest) => Promise<Event>
  updateEvent: (data: UpdateEventRequest) => Promise<Event>
  deleteEvent: (id: string) => Promise<void>
  getEventsByDateRange: (start: Date, end: Date) => Event[]
  
  // Selectors
  getEventsForDate: (date: Date) => Event[]
  getUpcomingEvents: (limit?: number) => Event[]
}
```

#### TaskStore
```typescript
interface TaskStore {
  // State
  tasks: Task[]
  loading: boolean
  error: string | null
  
  // Actions
  createTask: (data: CreateTaskInput) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  getTasksForDateRange: (start: Date, end: Date) => Task[]
}
```

#### CalendarSettingsStore
```typescript
interface CalendarSettingsStore {
  // State
  timezone: string
  planRecordMode: 'plan' | 'record' | 'both'
  weekStartsOn: 0 | 1
  defaultView: CalendarViewType
  timeFormat: '12h' | '24h'
  
  // Actions
  updateSettings: (settings: Partial<CalendarSettings>) => void
  resetSettings: () => void
}
```

### 状態更新フロー
```
User Action
    ↓
UI Component Event Handler
    ↓
CalendarController Unified Handler
    ↓
Store Action Dispatch
    ↓
Store State Update
    ↓
React Re-render
    ↓
UI Update
```

---

## 📡 CalendarController - 中央制御

### 責務
1. **ルーティング制御** - URL と ビューの同期
2. **状態統合** - 複数ストアの状態を統合
3. **イベント配信** - UI イベントをストアアクションに変換
4. **ビュー制御** - 適切なビューコンポーネントの選択

### プロパティフロー
```typescript
// CalendarController → Views
interface ViewProps {
  // Data Props (computed from stores)
  dateRange: ViewDateRange        // 計算された日付範囲
  tasks: Task[]                   // フィルタリング済みタスク
  events: CalendarEvent[]         // 変換済みイベント
  currentDate: Date               // 現在の表示日付
  
  // Event Handlers (bound to controller)
  onEventClick: (event: CalendarEvent) => void
  onCreateEvent: (date: Date, time?: string) => void
  onUpdateEvent: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
  onEmptyClick: (date: Date, time: string) => void
  
  // Navigation Handlers
  onViewChange: (viewType: CalendarViewType) => void
  onNavigatePrev: () => void
  onNavigateNext: () => void
  onNavigateToday: () => void
}
```

### データ変換レイヤー
```typescript
// Event[] → CalendarEvent[] 変換
const transformedEvents = useMemo(() => {
  return events.map(event => ({
    ...event,
    startDate: ensureDate(event.startDate),
    endDate: ensureDate(event.endDate),
    displayStartDate: calculateDisplayDate(event.startDate, timezone),
    displayEndDate: calculateDisplayDate(event.endDate, timezone),
    duration: calculateDuration(event.startDate, event.endDate),
    isMultiDay: isMultiDayEvent(event.startDate, event.endDate),
    type: 'event' as const
  }))
}, [events, timezone])

// 日付範囲フィルタリング
const filteredEvents = useMemo(() => {
  return transformedEvents.filter(event => 
    isEventInDateRange(event, viewDateRange.start, viewDateRange.end)
  )
}, [transformedEvents, viewDateRange])
```

---

## 🎣 Custom Hooks - ビジネスロジック

### Hook責務分離
```typescript
// ビュー固有ロジック
useXxxView: {
  // 日付計算
  // イベントグループ化  
  // 表示状態管理
  // スクロール制御
}

// 汎用ロジック
useCalendarData: {
  // データ取得
  // キャッシュ管理
  // エラーハンドリング
}

// UI状態管理
useCalendarLayout: {
  // ビュー切り替え
  // 日付ナビゲーション
  // サイドバー状態
}
```

### useCalendarLayout例
```typescript
export function useCalendarLayout({
  initialViewType,
  initialDate,
  onViewChange,
  onDateChange
}: UseCalendarLayoutOptions) {
  const [viewType, setViewType] = useState(initialViewType)
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // ビュー変更
  const changeView = useCallback((newView: CalendarViewType) => {
    setViewType(newView)
    onViewChange?.(newView)
  }, [onViewChange])
  
  // 日付ナビゲーション
  const navigateRelative = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = direction === 'today' 
      ? new Date()
      : direction === 'prev'
        ? getPreviousPeriod(currentDate, viewType)
        : getNextPeriod(currentDate, viewType)
    
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }, [currentDate, viewType, onDateChange])
  
  return {
    viewType,
    currentDate,
    sidebarOpen,
    changeView,
    navigateRelative,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen)
  }
}
```

### useDayView例 (詳細)
```typescript
export function useDayView({
  date,
  events,
  onEventUpdate
}: UseDayViewOptions): UseDayViewReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // 表示日付の正規化
  const displayDate = useMemo(() => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }, [date])
  
  // その日のイベントをフィルタリング・ソート
  const dayEvents = useMemo(() => {
    return events
      .filter(event => {
        if (!event.startDate) return false
        return isSameDay(event.startDate, displayDate)
      })
      .sort((a, b) => {
        // 終日イベントを最初に
        const aIsAllDay = isAllDayEvent(a)
        const bIsAllDay = isAllDayEvent(b)
        
        if (aIsAllDay && !bIsAllDay) return -1
        if (!aIsAllDay && bIsAllDay) return 1
        
        // 時刻順
        const aTime = a.startDate?.getTime() || 0
        const bTime = b.startDate?.getTime() || 0
        return aTime - bTime
      })
  }, [events, displayDate])
  
  // イベントスタイル計算
  const eventStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {}
    
    // 重複するイベントの列配置を計算
    const eventColumns = calculateEventColumns(dayEvents)
    
    dayEvents.forEach((event, index) => {
      const position = calculateEventPosition(event)
      const columnInfo = eventColumns[index]
      
      styles[event.id] = {
        position: 'absolute',
        top: `${position.top}px`,
        height: `${position.height}px`,
        left: `${(columnInfo.column / columnInfo.totalColumns) * 100}%`,
        width: `${(1 / columnInfo.totalColumns) * 95}%`, // 5% margin
        zIndex: 20 + columnInfo.column
      }
    })
    
    return styles
  }, [dayEvents])
  
  // 今日判定
  const isToday = useMemo(() => 
    isSameDay(displayDate, new Date()), [displayDate]
  )
  
  // 現在時刻へスクロール
  const scrollToNow = useCallback(() => {
    if (!scrollContainerRef.current || !isToday) return
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const scrollTop = (currentHour + currentMinutes / 60 - 2) * 72 // 72px per hour
    
    scrollContainerRef.current.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    })
  }, [isToday])
  
  // 時間スロット生成
  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 * 4 }, (_, index) => {
      const totalMinutes = index * 15
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60
      
      return {
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        hour,
        minute,
        label: minute === 0 ? `${hour}:00` : '',
        isHour: minute === 0,
        isHalfHour: minute === 30,
        isQuarterHour: minute === 15 || minute === 45
      }
    })
  }, [])
  
  return {
    dayEvents,
    eventStyles,
    scrollToNow,
    isToday,
    timeSlots
  }
}
```

---

## 🔄 Event Handling Flow

### イベント処理の階層
```
1. DOM Event (click, drag, etc.)
   ↓
2. Component Event Handler
   ↓  
3. View-Specific Logic
   ↓
4. CalendarController Unified Handler
   ↓
5. Store Action Dispatch
   ↓
6. Side Effects (API calls, etc.)
   ↓
7. State Update
   ↓
8. UI Re-render
```

### 具体例: イベント作成フロー
```typescript
// 1. DOM Event - 空きスロットクリック
const handleEmptySlotClick = (e: MouseEvent, date: Date) => {
  const timeString = calculateTimeFromClick(e)
  onEmptyClick?.(date, timeString)  // 2. Component Event Handler
}

// 3. View-Specific Logic (DayView)
const handleEmptyClick = useCallback((date: Date, time: string) => {
  // ビュー固有の前処理
  const defaultEndTime = addMinutes(time, 60)
  onEmptyClick?.(date, time)
}, [onEmptyClick])

// 4. CalendarController Unified Handler
const handleEmptyClick = useCallback((date: Date, time: string) => {
  // AddPopupを開く
  openEventPopup({
    dueDate: date,
    status: 'Todo'
  })
  
  // デフォルト値設定
  setEventDefaultDate(date)
  setEventDefaultTime(time)
}, [openEventPopup])

// 5. Store Action (AddPopup内で実行)
const handleEventSave = async (eventData: CreateEventRequest) => {
  await eventStore.createEvent(eventData)  // 6. API call
}

// 7. State Update (eventStore内)
const createEvent = async (data: CreateEventRequest) => {
  set(state => ({
    events: [...state.events, newEvent],  // 8. UI Re-render
    loading: false
  }))
}
```

### エラーハンドリングフロー
```typescript
// エラー境界での処理
const handleEventAction = async (action: () => Promise<void>) => {
  try {
    setLoading(true)
    await action()
    setError(null)
  } catch (error) {
    console.error('Event action failed:', error)
    setError(error.message)
    
    // ユーザーへの通知
    showNotification({
      type: 'error',
      message: '操作に失敗しました。もう一度お試しください。'
    })
  } finally {
    setLoading(false)
  }
}
```

---

## 🔗 Data Synchronization

### リアルタイム同期
```typescript
// EventStore でのリアルタイム更新
useEffect(() => {
  // WebSocket接続 (将来実装)
  const ws = new WebSocket('/api/calendar/events/stream')
  
  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data)
    
    switch (type) {
      case 'event_created':
        addEvent(data)
        break
      case 'event_updated':
        updateEvent(data.id, data)
        break
      case 'event_deleted':
        removeEvent(data.id)
        break
    }
  }
  
  return () => ws.close()
}, [])
```

### オフライン対応
```typescript
// オフライン時のローカル保存
const syncManager = {
  // 未同期アクションをキューに保存
  queueAction: (action: SyncAction) => {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]')
    queue.push(action)
    localStorage.setItem('syncQueue', JSON.stringify(queue))
  },
  
  // オンライン復帰時に同期
  syncPendingActions: async () => {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]')
    
    for (const action of queue) {
      try {
        await executeAction(action)
      } catch (error) {
        console.error('Sync failed for action:', action, error)
      }
    }
    
    localStorage.removeItem('syncQueue')
  }
}
```

---

## 🎭 Context Providers

### CalendarContext
```typescript
interface CalendarContextValue {
  // Global state
  currentView: CalendarViewType
  currentDate: Date
  timezone: string
  
  // Global actions
  setView: (view: CalendarViewType) => void
  setDate: (date: Date) => void
  
  // Shared handlers
  handleEventClick: (event: CalendarEvent) => void
  handleDateSelect: (date: Date) => void
}

export const CalendarProvider = ({ children }) => {
  const value = useCalendarProvider()
  
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}

// 使用例
const SomeComponent = () => {
  const { currentDate, setDate } = useCalendarContext()
  return <DatePicker value={currentDate} onChange={setDate} />
}
```

### ThemeContext (Calendar固有)
```typescript
interface CalendarThemeContext {
  colors: CalendarColorScheme
  spacing: CalendarSpacing
  typography: CalendarTypography
  
  updateTheme: (theme: Partial<CalendarTheme>) => void
}

// カスタマイズ可能なテーマシステム
const useCalendarTheme = () => {
  const [theme, setTheme] = useState(defaultCalendarTheme)
  
  const updateTheme = useCallback((updates: Partial<CalendarTheme>) => {
    setTheme(current => ({ ...current, ...updates }))
  }, [])
  
  return { ...theme, updateTheme }
}
```

---

## 📊 Performance Optimizations

### メモ化戦略
```typescript
// 重い計算のメモ化
const expensiveCalculation = useMemo(() => {
  return events.reduce((acc, event) => {
    // 複雑な集計処理
    return acc + calculateEventMetrics(event)
  }, 0)
}, [events]) // eventsが変更された時のみ再計算

// イベントハンドラーの安定化
const handleEventClick = useCallback((event: CalendarEvent) => {
  onEventClick?.(event)
}, [onEventClick])

// コンポーネントのメモ化
const EventBlock = React.memo(({ event, onClick }) => {
  return <div onClick={() => onClick(event)}>{event.title}</div>
}, (prevProps, nextProps) => {
  // カスタム比較でより精密な更新制御
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.updatedAt === nextProps.event.updatedAt
  )
})
```

### 仮想化対応 (将来実装)
```typescript
// 大量イベント表示での仮想スクロール
const VirtualizedEventList = ({ events, itemHeight = 50 }) => {
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(20)
  
  const visibleEvents = useMemo(() => {
    return events.slice(startIndex, endIndex)
  }, [events, startIndex, endIndex])
  
  const handleScroll = useCallback((scrollTop: number) => {
    const newStartIndex = Math.floor(scrollTop / itemHeight)
    const newEndIndex = newStartIndex + Math.ceil(window.innerHeight / itemHeight)
    
    setStartIndex(newStartIndex)
    setEndIndex(newEndIndex)
  }, [itemHeight])
  
  return (
    <VirtualScrollContainer onScroll={handleScroll}>
      {visibleEvents.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </VirtualScrollContainer>
  )
}
```

---

## 🔍 Debugging & Monitoring

### デバッグフック
```typescript
// 開発時のデバッグ情報
const useCalendarDebug = () => {
  const debugInfo = {
    stores: {
      events: useEventStore.getState(),
      tasks: useTaskStore.getState(),
      settings: useCalendarSettingsStore.getState()
    },
    performance: {
      renderCount: useRef(0),
      lastRenderTime: performance.now()
    }
  }
  
  useEffect(() => {
    debugInfo.performance.renderCount.current++
    console.log('Calendar Debug:', debugInfo)
  })
  
  return debugInfo
}
```

### エラー追跡
```typescript
// エラーレポート
const useErrorReporting = () => {
  const reportError = useCallback((error: Error, context: string) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // エラー追跡サービスに送信
    sendErrorReport(errorReport)
  }, [])
  
  return { reportError }
}
```

---

## 🎯 Best Practices

### 1. State Updates
```typescript
// ✅ Good: 不変性を保った更新
const updateEvent = (eventId: string, updates: Partial<Event>) => {
  set(state => ({
    events: state.events.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    )
  }))
}

// ❌ Bad: 直接変更
const updateEventBad = (eventId: string, updates: Partial<Event>) => {
  const event = state.events.find(e => e.id === eventId)
  Object.assign(event, updates) // Mutation!
}
```

### 2. Effect Dependencies
```typescript
// ✅ Good: 適切な依存配列
useEffect(() => {
  fetchEvents(dateRange.start, dateRange.end)
}, [dateRange.start, dateRange.end, fetchEvents])

// ❌ Bad: 不完全な依存配列
useEffect(() => {
  fetchEvents(dateRange.start, dateRange.end)
}, []) // Missing dependencies
```

### 3. Error Boundaries
```typescript
// エラー境界でコンポーネントを保護
const CalendarErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<CalendarErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Calendar error:', error, errorInfo)
        reportError(error, 'calendar-component')
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

---

*このドキュメントは Calendar Data Flow Architecture の詳細を説明しています。*  
*更新日: 2025-01-XX*  
*責任者: Calendar Development Team*