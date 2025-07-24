'use client'

import React, { useMemo } from 'react'
import { isWeekend } from 'date-fns'
import { SplitCalendarLayout } from '../components/SplitCalendarLayout'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { UnifiedCalendarHeader } from '../components/UnifiedCalendarHeader'
import type { ViewDateRange, Task, TaskRecord, CalendarViewType } from '../types'
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
  onTaskClick?: (task: any) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

export function WeekdayView({ 
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
}: WeekdayViewProps) {
  // 平日のみを表示（土日を除外）
  const weekdays = useMemo(() => {
    return dateRange.days.filter(day => !isWeekend(day))
  }, [dateRange.days])

  return (
    <CalendarViewAnimation viewType="week-no-weekend">
      <div 
        className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
        style={{ overscrollBehavior: 'none' }}
      >
        {/* 統一ヘッダー */}
        <UnifiedCalendarHeader
          viewType="week-no-weekend"
          currentDate={currentDate}
          dates={weekdays}
          onNavigate={(direction) => {
            if (direction === 'prev') onNavigatePrev?.()
            else if (direction === 'next') onNavigateNext?.()
            else if (direction === 'today') onNavigateToday?.()
          }}
          onViewChange={onViewChange || (() => {})}
        />
        
        {/* スクロール可能なメインコンテンツ */}
        <main 
          className="flex-1 min-h-0 overflow-hidden" 
          style={{ overscrollBehavior: 'none' }}
        >
          <SplitCalendarLayout
            dates={weekdays}
            tasks={tasks}
            dateRange={dateRange}
            onTaskClick={onTaskClick}
            onEmptyClick={onEmptyClick}
            onTaskDrag={onTaskDrag}
            onCreateTask={onCreateTask}
            onCreateRecord={onCreateRecord}
          />
        </main>
      </div>
    </CalendarViewAnimation>
  )
}