'use client'

import React, { useMemo } from 'react'
import { isWeekend } from 'date-fns'
import { UnifiedCalendarLayout } from '../layouts/UnifiedCalendarLayout'
import type { ViewDateRange, Task, TaskRecord } from '../types'
import { CalendarTask } from '../utils/time-grid-helpers'

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

interface WeekdayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
}

export function WeekdayView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord
}: WeekdayViewProps) {
  // 平日のみを表示（土日を除外）
  const weekdays = useMemo(() => {
    return dateRange.days.filter(day => !isWeekend(day))
  }, [dateRange.days])

  return (
    <UnifiedCalendarLayout
      viewType="weekday"
      dates={weekdays}
      tasks={tasks}
      currentDate={currentDate}
      dateRange={dateRange}
      onTaskClick={onTaskClick}
      onEmptyClick={onEmptyClick}
      onTaskDrag={onTaskDrag}
      onCreateTask={onCreateTask}
      onCreateRecord={onCreateRecord}
    />
  )
}