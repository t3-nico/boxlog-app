import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import type { CalendarViewType, Task, ViewDateRange } from '../../../types/calendar.types'
import type { DateTimeSelection } from '../shared'
import type { CreateRecordInput, CreateTaskInput } from '../shared/types/base.types'

export interface AgendaViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  plans: CalendarPlan[]
  currentDate: Date
  showWeekends?: boolean
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

export interface AgendaItemProps {
  plan: CalendarPlan
  onClick?: (plan: CalendarPlan) => void
  onContextMenu?: (plan: CalendarPlan, mouseEvent: React.MouseEvent) => void
}

export interface AgendaDayGroupProps {
  date: Date
  plans: CalendarPlan[]
  isToday: boolean
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, mouseEvent: React.MouseEvent) => void
}
