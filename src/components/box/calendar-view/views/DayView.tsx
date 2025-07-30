'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const FullDayCalendarLayout = dynamic(
  () => import('../components/FullDayCalendarLayout').then(mod => ({ default: mod.FullDayCalendarLayout })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex relative" style={{ height: `${25 * 48}px` }}>
        {/* ローディング中のスケルトン */}
        <div className="flex-shrink-0 sticky left-0 z-10" style={{ height: `${25 * 48}px` }}>
          <div className="w-16 h-full bg-gray-50 dark:bg-gray-800" />
        </div>
        <div className="flex-1 flex relative">
          <div className="flex-1 relative border-r border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0">
              {Array.from({ length: 25 }, (_, hour) => (
                <div
                  key={hour}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  style={{ height: '48px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
import { CalendarViewAnimation } from '../components/ViewTransition'
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

interface DayViewProps {
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
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

export function DayView({ 
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
}: DayViewProps) {
  return (
    <CalendarViewAnimation viewType="day">
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
            dates={[currentDate]}
            tasks={tasks}
            events={events}
            dateRange={dateRange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}