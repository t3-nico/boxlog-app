'use client'

import React, { useMemo } from 'react'
import { addDays, subDays, isToday } from 'date-fns'
import { TimeGrid } from '../TimeGrid'
import { CalendarTask } from '../utils/time-grid-helpers'
import { 
  formatShortDate, 
  formatShortWeekday, 
  filterTasksForDate, 
  getPriorityColorClass,
  cn
} from '../utils/view-helpers'
import type { ViewDateRange, Task } from '../types'

interface ThreeDayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
}

export function ThreeDayView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onEmptyClick,
  onTaskDrag 
}: ThreeDayViewProps) {
  // 3日間の日付を計算（昨日、今日、明日）
  const days = useMemo(() => [
    subDays(currentDate, 1),
    currentDate,
    addDays(currentDate, 1)
  ], [currentDate])

  // Task[]をCalendarTask[]に変換
  const calendarTasks: CalendarTask[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start || ''),
      endTime: new Date(task.planned_end || task.planned_start || ''),
      color: getPriorityColorClass(task.priority || 'medium').split(' ')[0],
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium'
    }))
  }, [tasks])

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
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex">
          <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-800"></div>
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-1 px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                isToday(day) && "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500",
                index === 1 && "font-semibold" // 中央（今日）を強調
              )}
            >
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {formatShortWeekday(day)}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatShortDate(day)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filterTasksForDate(calendarTasks, day).length}件
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3日分のTimeGrid */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* 時間軸を共有するためのスペース */}
        </div>
        
        {days.map((day, index) => (
          <div key={day.toISOString()} className="flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
            <TimeGrid
              date={day}
              tasks={filterTasksForDate(calendarTasks, day)}
              gridInterval={30} // 3日表示は30分グリッド
              onTaskClick={handleTaskClick}
              onEmptyClick={handleEmptyClick}
              onTaskDrop={handleTaskDrop}
              showCurrentTime={isToday(day)}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}