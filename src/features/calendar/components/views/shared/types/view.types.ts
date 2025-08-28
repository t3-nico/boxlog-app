/**
 * ビュー関連の型定義
 */

import type { CalendarEvent, EventInteractionHandler } from './event.types'

export type ViewType = 'day' | 'week' | 'month' | '3day' | '2week' | 'timeline' | 'schedule'

export interface ViewProps {
  dates: Date[]
  events: CalendarEvent[]
  currentDate: Date
  viewType: ViewType
  className?: string
}

export interface DayColumnProps {
  date: Date
  events: CalendarEvent[]
  hourHeight?: number
  isToday?: boolean
  isWeekend?: boolean
  onTimeClick?: (date: Date, hour: number, minute: number) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventDoubleClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  className?: string
}

export interface DayDisplayProps {
  date: Date
  isToday?: boolean
  isWeekend?: boolean
  isSelected?: boolean
  format?: 'short' | 'long' | 'numeric'
  onClick?: (date: Date) => void
  className?: string
}

export interface EmptyStateProps {
  message?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export interface ViewDimensions {
  containerWidth: number
  containerHeight: number
  contentWidth: number
  contentHeight: number
  scrollTop: number
  scrollLeft: number
  visibleTimeRange: {
    start: number // 開始時間（0-24）
    end: number // 終了時間（0-24）
  }
}

export interface ScrollSyncOptions {
  horizontal?: boolean
  vertical?: boolean
  initialScrollTop?: number
  initialScrollLeft?: number
  onScroll?: (scrollTop: number, scrollLeft: number) => void
}

export interface ViewNavigationProps {
  currentDate: Date
  viewType: ViewType
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (viewType: ViewType) => void
  onDateSelect: (date: Date) => void
  className?: string
}

export interface ViewConfiguration {
  hourHeight: number
  timeColumnWidth: number
  showTimeColumn: boolean
  showAllDaySection: boolean
  showWeekends: boolean
  showCurrentTime: boolean
  startHour: number
  endHour: number
  scrollToHour: number
}

export interface ViewContextValue extends ViewConfiguration, EventInteractionHandler {
  dates: Date[]
  events: CalendarEvent[]
  currentDate: Date
  viewType: ViewType
}