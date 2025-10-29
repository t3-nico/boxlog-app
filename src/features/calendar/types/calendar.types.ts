export type CalendarViewType = 'day' | '3day' | '5day' | 'week'

export interface CalendarViewProps {
  className?: string
}

export interface ViewDateRange {
  start: Date
  end: Date
  days: Date[]
}

export interface CalendarHeaderProps {
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
}

export interface ViewSelectorProps {
  value: CalendarViewType
  onChange: (view: CalendarViewType) => void
}

export interface Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number // 分
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
  created_at: Date
  updated_at: Date
  // 計算で取得される値
  planned_end?: string
  memo?: string
  record_id?: string // 対応する記録へのリンク
}

export interface TaskRecord {
  id: string
  user_id: string
  task_id?: string // 元の予定へのリンク（nullの場合は予定外作業）
  title: string
  actual_start: string
  actual_end: string
  actual_duration: number // 分
  satisfaction?: 1 | 2 | 3 | 4 | 5 // 満足度
  tags?: string[]
  memo?: string
  // 記録特有のフィールド
  interruptions?: number // 中断回数
  focus_level?: 1 | 2 | 3 | 4 | 5 // 集中度
  energy_level?: 1 | 2 | 3 | 4 | 5 // エネルギーレベル
  created_at: string
  updated_at: string
}

export interface RecordAdjustments {
  actualStart?: Date
  actualEnd?: Date
  satisfaction?: number
  focusLevel?: number
  energyLevel?: number
  interruptions?: number
}

export interface RecordStats {
  plannedHours: number
  actualHours: number
  completionRate: number
  avgSatisfaction: number
  unplannedTasks: number
}

// Calendar Event type (extends Event with display-specific properties)
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  // TimedEvent互換性のため追加（TODO(#389): 型の統一が必要）
  start?: Date
  end?: Date
  status: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional'
  color: string
  location?: string
  url?: string
  tags?: Array<{
    id: string
    name: string
    color: string
    icon?: string
    parent_id?: string
  }>
  items?: Array<{
    id: string
    text: string
    completed: boolean
    duration?: number
  }>
  createdAt: Date
  updatedAt: Date
  // Display-specific properties
  displayStartDate: Date
  displayEndDate: Date
  duration: number // minutes
  isMultiDay: boolean
  isRecurring: boolean
}

// インターフェース定義
export interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

export interface CreateRecordInput {
  title: string
  actual_start: Date
  actual_end: Date
  actual_duration: number
  satisfaction?: number
  focus_level?: number
  energy_level?: number
  memo?: string
  interruptions?: number
}

// ========================================
// 新しいDB設計に対応した型定義
// ========================================

// カレンダー管理
export interface Calendar {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  isDefault: boolean
  isVisible: boolean
  provider?: 'local' | 'google' | 'outlook' | 'ical'
  externalId?: string
  syncToken?: string
  lastSyncedAt?: Date
  isShared: boolean
  shareSettings?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// 拡張されたEvent型
export interface ExtendedEvent extends CalendarEvent {
  calendarId?: string
  allDay: boolean
  reminderMinutes?: number
  timezone: string
  attendees: Array<{
    email: string
    name?: string
    status?: 'pending' | 'accepted' | 'declined' | 'tentative'
  }>
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
  visibility: 'private' | 'public' | 'team'
  externalId?: string
  syncStatus: 'local' | 'syncing' | 'synced' | 'error'
}

// 繰り返しパターン
export interface RecurrencePattern {
  id: string
  eventId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number
  weekdays?: number[] // 0=日曜, 1=月曜, ..., 6=土曜
  monthlyType?: 'day_of_month' | 'day_of_week'
  dayOfMonth?: number
  weekOfMonth?: number // 1-5, 5=最終週
  endType: 'never' | 'after_occurrences' | 'on_date'
  occurrences?: number
  endDate?: Date
  excludedDates?: Date[]
  timezone: string
  createdAt: Date
  updatedAt: Date
}

// イベントインスタンス（繰り返しイベントの個別オカレンス）
export interface EventInstance {
  id: string
  eventId: string
  recurrencePatternId?: string
  instanceStart: Date
  instanceEnd: Date
  isException: boolean
  exceptionType?: 'modified' | 'cancelled' | 'moved'
  overrides?: Partial<ExtendedEvent>
  createdAt: Date
  updatedAt: Date
}

// カレンダー共有
export interface CalendarShare {
  id: string
  calendarId: string
  sharedWithUserId?: string
  sharedWithEmail?: string
  permission: 'view' | 'edit' | 'admin'
  shareToken?: string
  isPublicLink: boolean
  expiresAt?: Date
  createdAt: Date
  createdBy: string
}

// カレンダービュー状態
export interface CalendarViewState {
  id: string
  userId: string
  defaultView: CalendarViewType
  selectedCalendars: string[]
  filterTags?: string[]
  filterPriority?: string[]
  filterStatus?: string[]
  showWeekends: boolean
  showWeekNumbers: boolean
  firstDayOfWeek: number // 0=日曜, 1=月曜
  timeFormat: '12h' | '24h'
  customSettings?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// APIリクエスト用の型
export interface CreateCalendarInput {
  name: string
  description?: string
  color?: string
  isDefault?: boolean
}

export interface UpdateCalendarInput {
  name?: string
  description?: string
  color?: string
  isVisible?: boolean
  shareSettings?: Record<string, unknown>
}

export interface CreateEventInput {
  title: string
  description?: string
  calendarId?: string
  plannedStart?: Date
  plannedEnd?: Date
  allDay?: boolean
  status?: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional'
  color?: string
  location?: string
  url?: string
  reminderMinutes?: number
  timezone?: string
  visibility?: 'private' | 'public' | 'team'
  attendees?: Array<{
    email: string
    name?: string
  }>
  tags?: string[]
  items?: Array<{
    text: string
    completed?: boolean
    duration?: number
  }>
  recurrence?: Omit<RecurrencePattern, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string
}

export interface CalendarShareInput {
  calendarId: string
  sharedWithEmail?: string
  sharedWithUserId?: string
  permission: 'view' | 'edit' | 'admin'
  expiresAt?: Date
}

// フィルター条件
export interface CalendarFilter {
  calendarIds?: string[]
  startDate: Date
  endDate: Date
  status?: string[]
  priority?: string[]
  tags?: string[]
  includeRecurring?: boolean
  includeAllDay?: boolean
}
