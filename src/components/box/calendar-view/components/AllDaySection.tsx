'use client'

import React, { useState, useMemo } from 'react'
import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { CalendarTask } from '../utils/time-grid-helpers'
import { ALL_DAY_ROW_HEIGHT, TIME_LABEL_WIDTH } from '../constants/grid-constants'
import { getTaskColorClass } from '../utils/view-helpers'

interface AllDaySectionProps {
  dates: Date[]
  tasks: CalendarTask[]
  maxRows?: number
  scrollLeft?: number
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date) => void
}

export function AllDaySection({ 
  dates, 
  tasks, 
  maxRows = 3,
  scrollLeft = 0,
  onTaskClick,
  onEmptyClick 
}: AllDaySectionProps) {
  const [expanded, setExpanded] = useState(false)
  
  // 全日タスクをフィルタリング
  const allDayTasks = useMemo(() => {
    return tasks.filter(task => {
      const duration = task.endTime.getTime() - task.startTime.getTime()
      const durationHours = duration / (1000 * 60 * 60)
      return durationHours >= 24 // 24時間以上のタスクを全日と見なす
    })
  }, [tasks])
  
  // 各日のタスクを取得
  const getTasksForDate = (date: Date) => {
    return allDayTasks.filter(task => 
      isSameDay(task.startTime, date) || 
      (task.startTime <= date && task.endTime >= date)
    )
  }
  
  // 最大行数の計算
  const totalRows = Math.max(...dates.map(date => getTasksForDate(date).length), 1)
  const visibleRows = expanded ? totalRows : Math.min(maxRows, totalRows)
  const needsExpansion = totalRows > maxRows
  const hiddenCount = totalRows - maxRows
  
  if (allDayTasks.length === 0) {
    return null
  }
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex">
        {/* 左側のラベル */}
        <div 
          className="shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col justify-center items-center text-xs text-gray-600 dark:text-gray-400"
          style={{ 
            width: TIME_LABEL_WIDTH,
            height: visibleRows * ALL_DAY_ROW_HEIGHT
          }}
        >
          <span>終日</span>
        </div>
        
        {/* 各日の全日タスク */}
        <div
          className="flex-1 flex overflow-hidden"
          style={{ transform: `translateX(-${scrollLeft}px)` }}
        >
          {dates.map(date => {
            const dayTasks = getTasksForDate(date)
            
            return (
              <div
                key={date.toISOString()}
                className="flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                style={{ height: visibleRows * ALL_DAY_ROW_HEIGHT }}
                onClick={() => onEmptyClick?.(date)}
              >
                <AllDayTasks
                  tasks={dayTasks}
                  maxRows={visibleRows}
                  onTaskClick={onTaskClick}
                />
              </div>
            )
          })}
        </div>
      </div>
      
      {/* 展開/折りたたみボタン */}
      {needsExpansion && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-3 h-3" />
              <span>折りたたむ</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-3 h-3" />
              <span>他{hiddenCount}件を表示</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

// 各日の全日タスク表示コンポーネント
interface AllDayTasksProps {
  tasks: CalendarTask[]
  maxRows: number
  onTaskClick?: (task: CalendarTask) => void
}

function AllDayTasks({ tasks, maxRows, onTaskClick }: AllDayTasksProps) {
  const visibleTasks = tasks.slice(0, maxRows)
  
  return (
    <div className="p-1 space-y-1">
      {visibleTasks.map((task, index) => (
        <AllDayTask
          key={task.id}
          task={task}
          onClick={() => onTaskClick?.(task)}
        />
      ))}
    </div>
  )
}

// 個別の全日タスクコンポーネント
interface AllDayTaskProps {
  task: CalendarTask
  onClick?: () => void
}

function AllDayTask({ task, onClick }: AllDayTaskProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        "px-2 py-1 rounded text-xs font-medium cursor-pointer",
        "transition-all duration-150 hover:scale-105 hover:shadow-sm",
        "truncate",
        getTaskColorClass(task.status || 'scheduled')
      )}
      style={{ height: ALL_DAY_ROW_HEIGHT - 2 }}
      title={task.title}
    >
      {task.title}
    </div>
  )
}

// 全日タスク作成用のプレースホルダー
interface AllDayPlaceholderProps {
  date: Date
  onClick?: (date: Date) => void
}

export function AllDayPlaceholder({ date, onClick }: AllDayPlaceholderProps) {
  return (
    <div
      onClick={() => onClick?.(date)}
      className="h-6 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
    >
      + 全日
    </div>
  )
}

// 全日タスクのマルチデイ表示用
interface MultiDayTaskProps {
  task: CalendarTask
  startDate: Date
  endDate: Date
  dates: Date[]
  onTaskClick?: (task: CalendarTask) => void
}

export function MultiDayTask({ 
  task, 
  startDate, 
  endDate, 
  dates, 
  onTaskClick 
}: MultiDayTaskProps) {
  const startIndex = dates.findIndex(date => isSameDay(date, startDate))
  const endIndex = dates.findIndex(date => isSameDay(date, endDate))
  
  if (startIndex === -1 || endIndex === -1) {
    return null
  }
  
  const width = ((endIndex - startIndex + 1) / dates.length) * 100
  const left = (startIndex / dates.length) * 100
  
  return (
    <div
      className="absolute top-0 h-full"
      style={{ 
        left: `${left}%`, 
        width: `${width}%`,
        zIndex: 10
      }}
    >
      <div
        onClick={() => onTaskClick?.(task)}
        className={cn(
          "h-full px-2 py-1 rounded text-xs font-medium cursor-pointer",
          "transition-all duration-150 hover:scale-105 hover:shadow-sm",
          "truncate",
          getTaskColorClass(task.status || 'scheduled')
        )}
        title={`${task.title} (${format(startDate, 'M/d')} - ${format(endDate, 'M/d')})`}
      >
        {task.title}
      </div>
    </div>
  )
}