import type { CSSProperties } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import type { CalendarViewType, Task, ViewDateRange } from '../../../types/calendar.types'
import type { DateTimeSelection, TimeSlot } from '../shared'
import type { CreateRecordInput, CreateTaskInput } from '../shared/types/base.types'

// OldDayViewのPropsを統合した完全版
export interface DayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  plans: CalendarPlan[]
  currentDate: Date
  showWeekends?: boolean // 週末の表示/非表示（デフォルト: true）
  className?: string

  // Plan handlers
  onTaskClick?: (task: CalendarPlan) => void
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, mouseEvent: React.MouseEvent) => void
  onCreatePlan?: (date: Date, time?: string) => void
  onUpdatePlan?: (plan: CalendarPlan) => void
  onDeletePlan?: (planId: string) => void
  onRestorePlan?: (plan: CalendarPlan) => Promise<void>
  onEmptyClick?: (date: Date, time: string) => void
  onTimeRangeSelect?: (selection: DateTimeSelection) => void

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
  plans?: CalendarPlan[]
  className?: string
  onPlanClick?: (plan: CalendarPlan) => void
  onEmptyClick?: (date: Date, time: string) => void
  onPlanUpdate?: (plan: CalendarPlan) => void
  onPlanCreate?: (date: Date, time: string) => void
  onPlanDelete?: (planId: string) => void
}

export interface DayContentProps {
  date: Date
  plans?: CalendarPlan[]
  events?: CalendarPlan[] // eventsはplansのエイリアス（後方互換性のため）
  planStyles?: Record<string, CSSProperties>
  eventStyles?: Record<string, CSSProperties> // eventStylesはplanStylesのエイリアス（後方互換性のため）
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, mouseEvent: React.MouseEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onPlanUpdate?: (plan: CalendarPlan) => void
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> // D&D用
  onTimeRangeSelect?: (selection: DateTimeSelection) => void
  className?: string
}

export interface UseDayViewOptions {
  date: Date
  plans: CalendarPlan[]
  onPlanUpdate?: (plan: CalendarPlan) => void
}

export interface UseDayViewReturn {
  dayPlans: CalendarPlan[]
  planStyles: Record<string, CSSProperties>
  isToday: boolean
  timeSlots: TimeSlot[]
}

export interface UseDayPlansOptions {
  date: Date
  plans: CalendarPlan[]
}

export interface UseDayPlansReturn {
  dayPlans: CalendarPlan[]
  planPositions: PlanPosition[]
  maxConcurrentPlans: number
}

export interface PlanPosition {
  plan: CalendarPlan
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
  maxPlanColumns: number
  planMinHeight: number
}
