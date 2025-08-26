import type { CalendarEvent } from '@/features/events'
import type { 
  ViewDateRange, 
  Task, 
  TaskRecord, 
  CalendarViewType,
  CreateTaskInput,
  CreateRecordInput
} from '../../../types/calendar.types'

// AgendaViewのメインProps
export interface AgendaViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
  startDate?: Date // 表示開始日（指定がない場合はdateRange.startを使用）
  endDate?: Date // 表示終了日（指定がない場合は30日後）
  groupByDate?: boolean // 日付グループ化（デフォルト: true）
  className?: string
  
  // Event handlers
  onTaskClick?: (task: any) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  onRestoreEvent?: (event: CalendarEvent) => Promise<void>
  onEmptyClick?: (date: Date, time: string) => void
  
  // Task handlers
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  
  // Navigation handlers
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

// useAgendaViewフックのオプション
export interface UseAgendaViewOptions {
  startDate: Date
  endDate: Date
  events: CalendarEvent[]
  groupByDate?: boolean
}

// useAgendaViewフックの返却値
export interface UseAgendaViewReturn {
  agendaDates: Date[]
  eventsByDate: Record<string, CalendarEvent[]>
  allEvents: CalendarEvent[]
  todayIndex: number // 今日のインデックス（-1 if not in range）
  scrollToToday: () => void
  isCurrentPeriod: boolean // 現在の期間内かどうか
  totalEvents: number
  hasEvents: boolean
}

// AgendaDayGroupのProps
export interface AgendaDayGroupProps {
  date: Date
  events: CalendarEvent[]
  isToday?: boolean
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void
  onCreateEvent?: (date: Date) => void
  className?: string
}

// AgendaEventItemのProps
export interface AgendaEventItemProps {
  event: CalendarEvent
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  compact?: boolean
  showDate?: boolean
  className?: string
}

// AgendaEmptyStateのProps
export interface AgendaEmptyStateProps {
  startDate: Date
  endDate: Date
  onCreateEvent?: (date: Date) => void
  className?: string
}

// AgendaHeaderのProps
export interface AgendaHeaderProps {
  startDate: Date
  endDate: Date
  totalEvents: number
  todayIndex: number
  onScrollToToday?: () => void
  className?: string
}

// 日付グループの情報
export interface AgendaDateGroup {
  date: Date
  events: CalendarEvent[]
  isToday: boolean
  isPast: boolean
  isFuture: boolean
  eventCount: number
  hasAllDayEvents: boolean
  hasTimedEvents: boolean
}

// イベントの表示情報
export interface AgendaEventDisplay {
  event: CalendarEvent
  timeRange: string
  isAllDay: boolean
  isMultiDay: boolean
  isOngoing: boolean
  displayTitle: string
  displayLocation?: string
  displayDescription?: string
}

// AgendaView設定
export interface AgendaViewSettings {
  groupByDate: boolean
  showEmptyDays: boolean
  showPastEvents: boolean
  defaultPeriodDays: number // デフォルト表示期間（日数）
  maxEventsPerDay?: number
  enableVirtualScrolling: boolean
  stickyHeaders: boolean
}

// 日付範囲フィルター
export interface AgendaDateRange {
  start: Date
  end: Date
  includeToday: boolean
  includePast: boolean
  includeFuture: boolean
}

// ソート・フィルター設定
export interface AgendaSortFilter {
  sortBy: 'date' | 'title' | 'created'
  sortOrder: 'asc' | 'desc'
  filterEventTypes?: string[]
  filterCalendars?: string[]
  searchQuery?: string
}