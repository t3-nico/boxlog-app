import type { CSSProperties } from 'react'
import type { CalendarEvent } from '@/features/events'
import type { 
  ViewDateRange, 
  Task, 
  TaskRecord, 
  CalendarViewType,
  CreateTaskInput,
  CreateRecordInput
} from '../../../types/calendar.types'

// ThreeDayViewのメインProps
export interface ThreeDayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
  centerDate?: Date // 中央に表示する日付（指定がない場合はcurrentDateを使用）
  showWeekends?: boolean // 週末の表示/非表示（デフォルト: true）
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

// useThreeDayViewフックのオプション
export interface UseThreeDayViewOptions {
  centerDate: Date
  events: CalendarEvent[]
  onEventUpdate?: (event: CalendarEvent) => void
}

// useThreeDayViewフックの返却値
export interface UseThreeDayViewReturn {
  threeDayDates: Date[] // [yesterday, today, tomorrow]
  eventsByDate: Record<string, CalendarEvent[]>
  centerIndex: number // 中央の日付のインデックス（通常は1）
  todayIndex: number // 今日のインデックス（-1 if not in range）
  scrollToNow: () => void
  isCurrentDay: boolean // 中央の日付が今日かどうか
}

// 3日ビューでのイベント位置情報
export interface ThreeDayEventPosition {
  event: CalendarEvent
  dayIndex: number
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
}

// 時間スロット情報
export interface ThreeDayTimeSlot {
  time: string
  hour: number
  minute: number
  label: string
  isHour: boolean
  isHalfHour: boolean
  isQuarterHour: boolean
}

// 3日ビューの設定
export interface ThreeDayViewSettings {
  startHour: number
  endHour: number
  timeInterval: 15 | 30 | 60 // minutes
  showQuarterLines: boolean
  showCurrentTime: boolean
  maxEventColumns: number
  eventMinHeight: number
  dayColumnWidth: number // 各日の列幅（%） = 100/3 = 33.33%
}

// 日付ヘッダーの情報
export interface ThreeDayDateDisplay {
  date: Date
  dayName: string
  dayNumber: number
  isToday: boolean
  isCenter: boolean // 中央の日付かどうか
  isPast: boolean
  isFuture: boolean
  events: CalendarEvent[]
  eventCount: number
  label: 'yesterday' | 'today' | 'tomorrow' | 'other'
}

// イベントのスタイル情報
export interface ThreeDayEventStyle {
  position: CSSProperties
  color: string
  textColor: string
  borderColor: string
  opacity: number
}

// ThreeDay Grid コンポーネントのProps
export interface ThreeDayGridProps {
  threeDayDates: Date[]
  events: CalendarEvent[]
  eventsByDate: Record<string, CalendarEvent[]>
  centerIndex: number
  todayIndex: number
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  className?: string
}