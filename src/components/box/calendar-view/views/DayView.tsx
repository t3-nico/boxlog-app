'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { isToday } from 'date-fns'
import { TimeGrid } from '../TimeGrid'
import { CalendarTask } from '../utils/time-grid-helpers'
import { formatFullDate, scrollToCurrentTime, getPriorityColorClass } from '../utils/view-helpers'
import type { ViewDateRange, Task } from '../types'

interface DayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
}

export function DayView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onEmptyClick,
  onTaskDrag 
}: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Task[]をCalendarTask[]に変換
  const calendarTasks: CalendarTask[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start || ''),
      endTime: new Date(task.planned_end || task.planned_start || ''),
      color: getPriorityColorClass(task.priority || 'medium').split(' ')[0], // 最初の背景色クラスを取得
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium'
    }))
  }, [tasks])

  // 初回表示時に現在時刻へスクロール
  useEffect(() => {
    if (containerRef.current && isToday(currentDate)) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          scrollToCurrentTime(containerRef.current)
        }
      }, 100) // 少し遅延してスクロール

      return () => clearTimeout(timer)
    }
  }, [currentDate])

  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  const handleEmptyClick = (date: Date, time: string) => {
    onEmptyClick?.(date, time)
  }

  const handleTaskDrop = (task: CalendarTask, newStartTime: Date) => {
    onTaskDrag?.(task.id, newStartTime)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 日付ヘッダー */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatFullDate(currentDate)}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {tasks.length}件のタスク
        </div>
      </div>

      {/* TimeGrid */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <TimeGrid
          date={currentDate}
          tasks={calendarTasks}
          gridInterval={15}
          onTaskClick={handleTaskClick}
          onEmptyClick={handleEmptyClick}
          onTaskDrop={handleTaskDrop}
          showCurrentTime={isToday(currentDate)}
        />
      </div>
    </div>
  )
}