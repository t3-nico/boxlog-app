import type { CSSProperties } from 'react'

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '@/features/calendar/types/calendar.types'

import type { DateTimeSelection, TimeSlot } from '../shared'

// OldDayViewのPropsを統合した完全版
export interface DayViewProps {
  dateRange: ViewDateRange
  plans: CalendarPlan[]
  currentDate: Date
  showWeekends?: boolean | undefined // 週末の表示/非表示（デフォルト: true）
  className?: string | undefined
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined

  // Plan handlers
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
  onCreatePlan?: ((date: Date, time?: string) => void) | undefined
  onUpdatePlan?:
    | ((planIdOrPlan: string | CalendarPlan, updates?: { startTime: Date; endTime: Date }) => void | Promise<void>)
    | undefined
  onDeletePlan?: ((planId: string) => void) | undefined
  onRestorePlan?: ((plan: CalendarPlan) => Promise<void>) | undefined
  onEmptyClick?: ((date: Date, time: string) => void) | undefined
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined

  // Navigation handlers
  onViewChange?: ((viewType: CalendarViewType) => void) | undefined
  onNavigatePrev?: (() => void) | undefined
  onNavigateNext?: (() => void) | undefined
  onNavigateToday?: (() => void) | undefined
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
  plans?: CalendarPlan[] | undefined
  events?: CalendarPlan[] | undefined // eventsはplansのエイリアス（後方互換性のため）
  planStyles?: Record<string, CSSProperties> | undefined
  eventStyles?: Record<string, CSSProperties> | undefined // eventStylesはplanStylesのエイリアス（後方互換性のため）
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
  onEmptyClick?: ((date: Date, time: string) => void) | undefined
  onPlanUpdate?: ((plan: CalendarPlan) => void) | undefined
  onEventUpdate?: ((eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void>) | undefined // D&D用
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined
  className?: string | undefined
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined
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
