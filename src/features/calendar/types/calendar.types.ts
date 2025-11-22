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

// 古い型定義（将来削除予定 - useRecordsStoreで使用中）
export interface Task {
  id: string
  title: string
  planned_start: Date | null
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
  created_at: Date
  updated_at: Date
  planned_end?: string
  memo?: string
  record_id?: string
}

export interface TaskRecord {
  id: string
  user_id: string
  task_id?: string
  title: string
  actual_start: string
  actual_end: string
  actual_duration: number
  satisfaction?: 1 | 2 | 3 | 4 | 5
  tags?: string[]
  memo?: string
  interruptions?: number
  focus_level?: 1 | 2 | 3 | 4 | 5
  energy_level?: 1 | 2 | 3 | 4 | 5
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

// Calendar Ticket type (チケットから変換されたカレンダーチケット)
export interface CalendarTicket {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  status: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  color: string
  ticket_number?: string // チケット番号（#123 形式）
  reminder_minutes?: number | null // 通知タイミング（開始時刻の何分前か）
  tags?: Array<{
    id: string
    name: string
    color: string
    icon?: string
    parent_id?: string
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

// 後方互換性のためのエイリアス
export type CalendarEvent = CalendarTicket

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

// 繰り返しパターン
export interface RecurrencePattern {
  id: string
  ticketId: string // eventId から変更
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
  // 後方互換性
  /** @deprecated Use ticketId instead */
  eventId?: string
}

// チケットインスタンス（繰り返しチケットの個別オカレンス）
export interface TicketInstance {
  id: string
  ticketId: string // eventId から変更
  recurrencePatternId?: string
  instanceStart: Date
  instanceEnd: Date
  isException: boolean
  exceptionType?: 'modified' | 'cancelled' | 'moved'
  overrides?: Partial<CalendarTicket>
  createdAt: Date
  updatedAt: Date
}

// 後方互換性のためのエイリアス
export type EventInstance = TicketInstance

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

export interface CreateTicketInput {
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
  recurrence?: Omit<RecurrencePattern, 'id' | 'ticketId' | 'createdAt' | 'updatedAt'>
}

// 後方互換性のためのエイリアス
export type CreateEventInput = CreateTicketInput

export interface UpdateTicketInput extends Partial<CreateTicketInput> {
  id: string
}

// 後方互換性のためのエイリアス
export type UpdateEventInput = UpdateTicketInput

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
