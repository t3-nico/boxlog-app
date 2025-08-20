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

// OldDayViewのPropsを統合した完全版
export interface DayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
  className?: string
  
  // Event handlers
  onTaskClick?: (task: any) => void
  onEventClick?: (event: CalendarEvent) => void
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

// シンプル版のProps（後方互換性のため）
export interface SimpleDayViewProps {
  date: Date
  events?: CalendarEvent[]
  className?: string
  onEventClick?: (event: CalendarEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventCreate?: (date: Date, time: string) => void
  onEventDelete?: (eventId: string) => void
}

export interface DayContentProps {
  date: Date
  events: CalendarEvent[]
  eventStyles: Record<string, CSSProperties>
  onEventClick?: (event: CalendarEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  className?: string
}

export interface UseDayViewOptions {
  date: Date
  events: CalendarEvent[]
  onEventUpdate?: (event: CalendarEvent) => void
}

export interface UseDayViewReturn {
  dayEvents: CalendarEvent[]
  eventStyles: Record<string, CSSProperties>
  scrollToNow: () => void
  isToday: boolean
  timeSlots: TimeSlot[]
}

export interface UseDayEventsOptions {
  date: Date
  events: CalendarEvent[]
}

export interface UseDayEventsReturn {
  dayEvents: CalendarEvent[]
  eventPositions: EventPosition[]
  maxConcurrentEvents: number
}

export interface TimeSlot {
  time: string
  hour: number
  minute: number
  label: string
  isHour: boolean
  isHalfHour: boolean
  isQuarterHour: boolean
}

export interface EventPosition {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
}

export interface DayViewSettings {
  startHour: number
  endHour: number
  timeInterval: 15 | 30 | 60 // minutes
  showQuarterLines: boolean
  showCurrentTime: boolean
  maxEventColumns: number
  eventMinHeight: number
}