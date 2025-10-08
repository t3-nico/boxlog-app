/**
 * ベースビュー型定義
 * 全カレンダービューで共通するプロパティ
 */

// CalendarEventの型定義（外部からも使用されるため再エクスポート）
export type { CalendarEvent } from './event.types'
import type { CalendarEvent } from './event.types'

// 基本的なビューの共通型（他ファイルから参照のため互換性考慮）
export type ViewDateRange = {
  start: Date
  end: Date
}

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
export type CalendarViewType = 'day' | 'week' | 'month' | '3day' | '2week'
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
  events: CalendarEvent[]
  currentDate: Date

  // Display options
  showWeekends?: boolean
  className?: string

  // Event handlers (完全に共通)
  onTaskClick?: (task: Task) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  onRestoreEvent?: (event: CalendarEvent) => Promise<void>
  onEmptyClick?: (date: Date, time: string) => void

  // Task handlers (完全に共通)
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void

  // Navigation handlers (完全に共通)
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

/**
 * イベント位置情報の基本型
 * 4箇所で重複していた EventPosition を統一
 */
export interface BaseEventPosition {
  event: CalendarEvent
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
  maxEventColumns: number
  eventMinHeight: number
}
