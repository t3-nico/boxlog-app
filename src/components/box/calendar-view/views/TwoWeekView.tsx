'use client'

import React, { useMemo } from 'react'
import { isWeekend, startOfWeek, addDays } from 'date-fns'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { SplitCalendarLayout } from '../components/SplitCalendarLayout'
import { DateHeader } from '../components/DateHeader'
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

interface TwoWeekViewProps {
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

export function TwoWeekView({ 
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
}: TwoWeekViewProps) {
  
  // 2週間分の日付を第1週と第2週に分割
  const { firstWeek, secondWeek, allDates } = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    
    const first = []
    const second = []
    
    // 第1週（0-6日目）
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      if (showWeekends || !isWeekend(date)) {
        first.push(date)
      }
    }
    
    // 第2週（7-13日目）
    for (let i = 7; i < 14; i++) {
      const date = addDays(weekStart, i)
      if (showWeekends || !isWeekend(date)) {
        second.push(date)
      }
    }
    
    return { 
      firstWeek: first, 
      secondWeek: second,
      allDates: [...first, ...second]
    }
  }, [currentDate, showWeekends])

  return (
    <CalendarViewAnimation viewType="2week">
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        
        {/* 日付ヘッダー */}
        <DateHeader dates={allDates} />

        {/* 共通SplitCalendarLayoutコンポーネントを使用 */}
        <SplitCalendarLayout
          dates={allDates}
          tasks={tasks}
          dateRange={dateRange}
          onTaskClick={onTaskClick}
          onEmptyClick={onEmptyClick}
          onTaskDrag={onTaskDrag}
          onCreateTask={onCreateTask}
          onCreateRecord={onCreateRecord}
        />
      </div>
    </CalendarViewAnimation>
  )
}