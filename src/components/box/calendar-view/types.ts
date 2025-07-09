export type CalendarViewType = 'day' | '3day' | 'week' | 'week-no-weekend' | '2week' | 'schedule'

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
  planned_start?: string
  planned_end?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
}