'use client'

import React, { useMemo } from 'react'
import { isWeekend } from 'date-fns'
import { UnifiedCalendarLayout } from '../layouts/UnifiedCalendarLayout'
import type { ViewDateRange, Task, TaskRecord } from '../types'

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface CreateRecordInput {
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

interface WeekViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  showWeekends?: boolean
  onTaskClick?: (task: any) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onViewChange?: (viewType: 'day' | 'three-day' | 'week' | 'weekday') => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

export function WeekView({ 
  dateRange, 
  tasks, 
  currentDate,
  showWeekends = true,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: WeekViewProps) {
  // 表示する日付を計算（土日を除外するかどうか）
  const displayDays = useMemo(() => {
    return showWeekends 
      ? dateRange.days 
      : dateRange.days.filter(day => !isWeekend(day))
  }, [dateRange.days, showWeekends])

  return (
    <UnifiedCalendarLayout
      viewType="week"
      dates={displayDays}
      tasks={tasks}
      currentDate={currentDate}
      dateRange={dateRange}
      onTaskClick={onTaskClick}
      onEmptyClick={onEmptyClick}
      onTaskDrag={onTaskDrag}
      onCreateTask={onCreateTask}
      onCreateRecord={onCreateRecord}
      onViewChange={onViewChange}
      onNavigatePrev={onNavigatePrev}
      onNavigateNext={onNavigateNext}
      onNavigateToday={onNavigateToday}
    />
  )
}