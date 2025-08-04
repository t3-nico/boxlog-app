'use client'

import React, { useState } from 'react'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { GoogleLikeCalendar } from '../components/GoogleLikeCalendar'
import type { ViewDateRange, Task, CalendarViewType } from '../types'
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

interface MonthViewProps {
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

export function MonthView({
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
}: MonthViewProps) {
  // 月表示はFullCalendarがほぼ完璧なので、常にFullCalendar版を使用
  const [useFullCalendar] = useState(true)

  return (
    <CalendarViewAnimation viewType="month">
      <div className="h-full flex flex-col">
        {/* ヘッダー情報 */}
        <div className="p-2 border-b flex justify-between items-center bg-white dark:bg-gray-900">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📅 FullCalendar Month View
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {events.length} events • {tasks.length} tasks
          </span>
        </div>
        
        {/* FullCalendar月表示 */}
        <div className="flex-1">
          <GoogleLikeCalendar
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
            onUpdateEvent={onUpdateEvent}
            initialView="dayGridMonth"
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}