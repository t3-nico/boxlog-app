'use client'

import React, { useMemo } from 'react'
import { isWeekend } from 'date-fns'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { FullDayCalendarLayout } from '../components/FullDayCalendarLayout'
import { UnifiedCalendarHeader } from '../components/UnifiedCalendarHeader'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import type { ViewDateRange, Task, TaskRecord, CalendarViewType } from '../types'
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

interface WeekViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
  showWeekends?: boolean
  onTaskClick?: (task: any) => void
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

export function WeekView({ 
  dateRange, 
  tasks, 
  events,
  currentDate,
  showWeekends = true,
  onTaskClick,
  onEventClick,
  onCreateEvent,
  onUpdateEvent,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: WeekViewProps) {
  const { planRecordMode } = useCalendarSettingsStore()
  
  // 表示する日付を計算（土日を除外するかどうか）
  const displayDays = useMemo(() => {
    return showWeekends 
      ? dateRange.days 
      : dateRange.days.filter(day => !isWeekend(day))
  }, [dateRange.days, showWeekends])

  return (
    <CalendarViewAnimation viewType="week">
      <div 
        className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
        style={{ overscrollBehavior: 'none' }}
      >
        {/* スクロール可能なメインコンテンツ */}
        <div 
          className="flex-1 min-h-0 overflow-hidden" 
          style={{ overscrollBehavior: 'none' }}
        >
          <FullDayCalendarLayout
            dates={displayDays}
            tasks={tasks}
            events={events}
            dateRange={dateRange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
            onUpdateEvent={onUpdateEvent}
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}