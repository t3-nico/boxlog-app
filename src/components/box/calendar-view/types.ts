export type CalendarViewType = 'day' | 'split-day' | '3day' | 'week' | 'week-no-weekend' | '2week' | 'schedule'

export interface CalendarViewProps {
  className?: string
}

export interface ViewDateRange {
  start: Date
  end: Date
  days: Date[]
}

export interface CalendarHeaderProps {
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
}

export interface ViewSelectorProps {
  value: CalendarViewType
  onChange: (view: CalendarViewType) => void
}

export interface Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number // 分
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
  created_at: Date
  updated_at: Date
  // 計算で取得される値
  planned_end?: string
  memo?: string
  record_id?: string // 対応する記録へのリンク
}

export interface TaskRecord {
  id: string
  user_id: string
  task_id?: string // 元の予定へのリンク（nullの場合は予定外作業）
  title: string
  actual_start: string
  actual_end: string
  actual_duration: number // 分
  satisfaction?: 1 | 2 | 3 | 4 | 5 // 満足度
  tags?: string[]
  memo?: string
  // 記録特有のフィールド
  interruptions?: number // 中断回数
  focus_level?: 1 | 2 | 3 | 4 | 5 // 集中度
  energy_level?: 1 | 2 | 3 | 4 | 5 // エネルギーレベル
  created_at: string
  updated_at: string
}

export interface RecordAdjustments {
  actualStart?: Date
  actualEnd?: Date
  satisfaction?: number
  focusLevel?: number
  energyLevel?: number
  interruptions?: number
}

export interface RecordStats {
  plannedHours: number
  actualHours: number
  completionRate: number
  avgSatisfaction: number
  unplannedTasks: number
}

// Calendar Event type (extends Event with display-specific properties)
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  isAllDay: boolean
  type: 'event' | 'task' | 'reminder'
  status: 'confirmed' | 'tentative' | 'cancelled'
  color: string
  location?: string
  url?: string
  tags?: Array<{
    id: string
    name: string
    color: string
    icon?: string
    parent_id?: string
  }>
  createdAt: Date
  updatedAt: Date
  // Display-specific properties
  displayStartDate: Date
  displayEndDate: Date
  duration: number // minutes
  isMultiDay: boolean
  isRecurring: boolean
}