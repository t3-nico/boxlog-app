/**
 * ベースビュー型定義
 * 全カレンダービューで共通するプロパティ
 */

// CalendarPlanの型定義（外部からも使用されるため再エクスポート）
export type { CalendarPlan } from './plan.types'
import type { ViewDateRange } from '../../../../types/calendar.types'
import type { CalendarPlan } from './plan.types'

// ViewDateRange を calendar.types.ts から再エクスポート
export type { ViewDateRange } from '../../../../types/calendar.types'

export interface Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
  created_at: Date
  updated_at: Date
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
export type CalendarViewType = 'day' | 'week' | 'month' | '3day' | '5day' | '2week' | 'agenda'
export interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}
export interface CreateRecordInput {
  title: string
  actual_start: Date
  actual_end: Date
  actual_duration: number
  satisfaction?: number
  focus_level?: number
  energy_level?: number
  memo?: string
  interruptions?: number
}

/**
 * 全ビューで共通するベースプロパティ
 * 95%以上の重複を解消
 */
export interface BaseViewProps {
  // Core data
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarPlan[]
  currentDate: Date

  // Display options
  showWeekends?: boolean | undefined
  className?: string | undefined

  // Plan handlers (完全に共通)
  onTaskClick?: ((task: CalendarPlan) => void) | undefined
  onEventClick?: ((plan: CalendarPlan) => void) | undefined
  onEventContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
  onCreateEvent?: ((date: Date, time?: string) => void) | undefined
  onUpdateEvent?: ((plan: CalendarPlan) => void) | undefined
  onDeleteEvent?: ((eventId: string) => void) | undefined
  onRestoreEvent?: ((plan: CalendarPlan) => Promise<void>) | undefined
  onEmptyClick?: ((date: Date, time: string) => void) | undefined

  // Task handlers (完全に共通)
  onTaskDrag?: ((taskId: string, newDate: Date) => void) | undefined
  onCreateTask?: ((task: CreateTaskInput) => void) | undefined
  onCreateRecord?: ((record: CreateRecordInput) => void) | undefined

  // Navigation handlers (完全に共通)
  onViewChange?: ((viewType: CalendarViewType) => void) | undefined
  onNavigatePrev?: (() => void) | undefined
  onNavigateNext?: (() => void) | undefined
  onNavigateToday?: (() => void) | undefined
}

/**
 * プラン位置情報の基本型
 * 4箇所で重複していた PlanPosition を統一
 */
export interface BasePlanPosition {
  plan: CalendarPlan
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
}

/**
 * ビュー設定の基本型
 * 4箇所で重複していた ViewSettings を統一
 */
export interface BaseViewSettings {
  startHour: number
  endHour: number
  timeInterval: 15 | 30 | 60
  showQuarterLines: boolean
  showCurrentTime: boolean
  maxPlanColumns: number
  planMinHeight: number
}
