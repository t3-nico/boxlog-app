'use client'

import React from 'react'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { SplitCalendarLayout } from '../components/SplitCalendarLayout'
import { UnifiedCalendarHeader } from '../components/UnifiedCalendarHeader'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import type { Task, TaskRecord, CalendarViewType } from '../types'

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

interface SplitDayViewProps {
  date: Date
  tasks: Task[]
  records: TaskRecord[]
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onTaskClick?: (task: any) => void
  onRecordClick?: (record: TaskRecord) => void
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
  onCreateEvent?: (date?: Date, time?: string) => void
}

export function SplitDayView({
  date,
  tasks,
  records,
  onCreateTask,
  onCreateRecord,
  onTaskClick,
  onRecordClick,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onCreateEvent
}: SplitDayViewProps) {
  const { planRecordMode } = useCalendarSettingsStore()

  return (
    <CalendarViewAnimation viewType="split-day">
      <div 
        className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
        style={{ overscrollBehavior: 'none' }}
      >
        {/* スクロール可能なメインコンテンツ */}
        <div 
          className="flex-1 min-h-0 overflow-hidden" 
          style={{ overscrollBehavior: 'none' }}
        >
          <SplitCalendarLayout
            dates={[date]}
            tasks={tasks}
            dateRange={{ start: date, end: date, days: [date] }}
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
            onCreateRecord={onCreateRecord}
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}