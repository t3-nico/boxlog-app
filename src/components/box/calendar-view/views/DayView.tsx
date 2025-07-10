'use client'

import React from 'react'
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

interface DayViewProps {
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

export function DayView({ 
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
}: DayViewProps) {
  return (
    <UnifiedCalendarLayout
      viewType="day"
      dates={[currentDate]}
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