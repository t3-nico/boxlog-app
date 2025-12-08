import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import type { CalendarViewType, Task, ViewDateRange } from '../../../types/calendar.types'
import type { DateTimeSelection } from '../shared'
import type { CreateRecordInput, CreateTaskInput } from '../shared/types/base.types'

export interface AgendaViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  plans: CalendarPlan[]
  currentDate: Date
  showWeekends?: boolean | undefined
  className?: string | undefined

  // Plan handlers
  onTaskClick?: ((task: CalendarPlan) => void) | undefined
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
  onCreatePlan?: ((date: Date, time?: string) => void) | undefined
  onUpdatePlan?: ((plan: CalendarPlan) => void) | undefined
  onDeletePlan?: ((planId: string) => void) | undefined
  onRestorePlan?: ((plan: CalendarPlan) => Promise<void>) | undefined
  onEmptyClick?: ((date: Date, time: string) => void) | undefined
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined

  // Task handlers
  onTaskDrag?: ((taskId: string, newDate: Date) => void) | undefined
  onCreateTask?: ((task: CreateTaskInput) => void) | undefined
  onCreateRecord?: ((record: CreateRecordInput) => void) | undefined

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
