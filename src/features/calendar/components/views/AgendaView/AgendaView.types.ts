import type { CalendarPlan, CalendarViewType, ViewDateRange } from '@/features/calendar/types/calendar.types'

import type { DateTimeSelection } from '../shared'

export interface AgendaViewProps {
  dateRange: ViewDateRange
  plans: CalendarPlan[]
  currentDate: Date
  showWeekends?: boolean | undefined
  className?: string | undefined

  // Plan handlers
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
  onCreatePlan?: ((date: Date, time?: string) => void) | undefined
  onUpdatePlan?: ((plan: CalendarPlan) => void) | undefined
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

export interface AgendaItemProps {
  plan: CalendarPlan
  onClick?: ((plan: CalendarPlan) => void) | undefined
  onContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
}

export interface AgendaDayGroupProps {
  date: Date
  plans: CalendarPlan[]
  isToday: boolean
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
}
