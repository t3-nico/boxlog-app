'use client'

import React, { useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { FullDayCalendarLayout } from '../components/FullDayCalendarLayout'
import { DateHeader } from '../components/DateHeader'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import type { ViewDateRange, Task, TaskRecord } from '../types'
import type { CalendarEvent } from '@/types/events'

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
  events: CalendarEvent[]
  currentDate: Date
  onTaskClick?: (task: any) => void
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
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
  events,
  currentDate,
  onTaskClick,
  onEventClick,
  onCreateEvent,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: ThreeDayViewProps) {
  const { planRecordMode } = useCalendarSettingsStore()
  
  // 3日間の日付を計算（昨日、今日、明日）
  const days = useMemo(() => [
    subDays(currentDate, 1),
    currentDate,
    addDays(currentDate, 1)
  ], [currentDate])

  return (
    <CalendarViewAnimation viewType="3day">
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        
        {/* 日付ヘッダー */}
        <DateHeader dates={days} planRecordMode={planRecordMode} />
        
        {/* 24時間表示のFullDayCalendarLayoutを使用 */}
        <FullDayCalendarLayout
          dates={days}
          tasks={tasks}
          events={events}
          dateRange={dateRange}
          onEventClick={onEventClick}
          onCreateEvent={onCreateEvent}
        />
      </div>
    </CalendarViewAnimation>
  )
}