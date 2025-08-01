'use client'

import React, { useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { FullDayCalendarLayout } from '../components/FullDayCalendarLayout'
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

interface ThreeDayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
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

export function ThreeDayView({ 
  dateRange, 
  tasks, 
  events,
  currentDate,
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
}: ThreeDayViewProps) {
  // 3日間の日付を計算（昨日、今日、明日）
  const days = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const calculatedDays = [yesterday, today, tomorrow];
    
    // デバッグ: 生成される3日間の日付配列の値
    console.log('🔍 ThreeDayView - currentDate input:', {
      value: currentDate,
      type: typeof currentDate,
      isDate: currentDate instanceof Date,
      toString: currentDate.toString(),
      toISOString: currentDate instanceof Date ? currentDate.toISOString() : 'not a date',
      toDateString: currentDate instanceof Date ? currentDate.toDateString() : 'not a date'
    })
    
    console.log('🔍 ThreeDayView - days (FIXED):', calculatedDays.map((d, index) => ({
      index,
      label: index === 0 ? '昨日' : index === 1 ? '今日' : '明日',
      value: d,
      type: typeof d,
      isDate: d instanceof Date,
      toString: d.toString(),
      toISOString: d instanceof Date ? d.toISOString() : 'not a date',
      toDateString: d instanceof Date ? d.toDateString() : 'not a date'
    })))
    
    return calculatedDays
  }, [currentDate])
  
  console.log('🎯 ThreeDayView - About to render FullDayCalendarLayout with days:', days.length)

  return (
    <CalendarViewAnimation viewType="3day">
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
            dates={days}
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