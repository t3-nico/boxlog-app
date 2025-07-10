'use client'

import React, { useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
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

interface ThreeDayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
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

export function ThreeDayView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: ThreeDayViewProps) {
  // 3日間の日付を計算（昨日、今日、明日）
  const days = useMemo(() => [
    subDays(currentDate, 1),
    currentDate,
    addDays(currentDate, 1)
  ], [currentDate])

  return (
    <UnifiedCalendarLayout
      viewType="three-day"
      dates={days}
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