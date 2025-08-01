'use client'

import React, { useMemo } from 'react'
import { isWeekend, startOfWeek, addDays } from 'date-fns'
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

interface TwoWeekViewProps {
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

export function TwoWeekView({ 
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

  const { planRecordMode } = useCalendarSettingsStore()

  return (
    <CalendarViewAnimation viewType="2week">
      <div 
        className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
        style={{ overscrollBehavior: 'none' }}
      >
        {/* スクロール可能なメインコンテンツ */}
        <div 
          className="flex-1 min-h-0" 
          style={{ overscrollBehavior: 'none' }}
        >
          <FullDayCalendarLayout
            dates={allDates}
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