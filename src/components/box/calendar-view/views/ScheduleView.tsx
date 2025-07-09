'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { format, startOfDay, addDays, isToday, isSameDay, isThisWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarTask } from '../utils/time-grid-helpers'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { DayGroup } from '../components/DayGroup'
import { filterTasksForDate } from '../utils/view-helpers'
import type { ViewDateRange, Task } from '../types'

interface ScheduleViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptySlotClick?: (date: Date, time: string) => void
  onDateClick?: (date: Date) => void
}

export function ScheduleView({ 
  dateRange,
  tasks,
  currentDate,
  onTaskClick,
  onEmptySlotClick,
  onDateClick
}: ScheduleViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [extendedDateRange, setExtendedDateRange] = useState({
    start: startOfDay(currentDate),
    end: addDays(startOfDay(currentDate), 30) // 初期30日分
  })
  
  // Task[]をCalendarTask[]に変換
  const calendarTasks: CalendarTask[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start || ''),
      endTime: new Date(task.planned_end || task.planned_start || ''),
      color: '#3b82f6', // デフォルト色
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium'
    }))
  }, [tasks])
  
  // 日付ごとにタスクをグループ化
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, CalendarTask[]>()
    
    // 表示範囲の全日程を生成（タスクがない日も含む）
    let currentIterDate = extendedDateRange.start
    while (currentIterDate <= extendedDateRange.end) {
      const dateKey = format(currentIterDate, 'yyyy-MM-dd')
      groups.set(dateKey, [])
      currentIterDate = addDays(currentIterDate, 1)
    }
    
    // タスクを配置
    calendarTasks.forEach(task => {
      const dateKey = format(task.startTime, 'yyyy-MM-dd')
      const dayTasks = groups.get(dateKey) || []
      dayTasks.push(task)
      groups.set(dateKey, dayTasks)
    })
    
    // ソートして配列に変換
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, tasks]) => ({
        date: new Date(date),
        tasks: tasks.sort((a, b) => 
          a.startTime.getTime() - b.startTime.getTime()
        )
      }))
  }, [calendarTasks, extendedDateRange])
  
  // 無限スクロール処理
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const { scrollTop, scrollHeight, clientHeight } = container
    
    // 下部に近づいたら追加日数を読み込み
    if (scrollHeight - scrollTop - clientHeight < 500) {
      setExtendedDateRange(prev => ({
        ...prev,
        end: addDays(prev.end, 30)
      }))
    }
  }, [])
  
  // 今日の日付へスクロール
  const scrollToToday = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const todayElement = container.querySelector(`[data-date="${format(new Date(), 'yyyy-MM-dd')}"]`)
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])
  
  // 特定の日付へスクロール
  const scrollToDate = useCallback((date: Date) => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const dateElement = container.querySelector(`[data-date="${format(date, 'yyyy-MM-dd')}"]`)
    if (dateElement) {
      dateElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])
  
  // 初期スクロール位置設定
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToDate(currentDate)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [currentDate, scrollToDate])
  
  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }
  
  const handleEmptySlotClick = (date: Date, time: string) => {
    onEmptySlotClick?.(date, time)
  }
  
  return (
    <CalendarViewAnimation viewType="schedule">
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* スクロール可能なコンテンツ */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          onScroll={handleScroll}
        >
          <div className="max-w-4xl mx-auto">
            {groupedTasks.map(({ date, tasks: dayTasks }) => (
              <DayGroup
                key={format(date, 'yyyy-MM-dd')}
                date={date}
                tasks={dayTasks}
                onTaskClick={handleTaskClick}
                onEmptySlotClick={handleEmptySlotClick}
                onDateClick={onDateClick}
              />
            ))}
            
            {/* 読み込み中インジケーター */}
            <div className="py-8 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                スクロールして続きを読み込み...
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalendarViewAnimation>
  )
}

// 週の統計情報を計算するヘルパー
export function calculateWeekStats(tasks: CalendarTask[]) {
  const now = new Date()
  const weekTasks = tasks.filter(task => {
    return isThisWeek(task.startTime)
  })
  
  const completedTasks = weekTasks.filter(t => t.status === 'completed')
  const totalDuration = weekTasks.reduce((sum, task) => {
    const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60) // 分
    return sum + duration
  }, 0)
  
  return {
    total: weekTasks.length,
    completed: completedTasks.length,
    completionRate: weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0,
    totalHours: totalDuration / 60,
    averageDuration: weekTasks.length > 0 ? totalDuration / weekTasks.length : 0
  }
}

// 今日の効率性を計算
export function calculateTodayEfficiency(tasks: CalendarTask[]) {
  const todayTasks = tasks.filter(task => isToday(task.startTime))
  
  if (todayTasks.length === 0) return null
  
  const completedTasks = todayTasks.filter(t => t.status === 'completed')
  const inProgressTasks = todayTasks.filter(t => t.status === 'in_progress')
  
  return {
    total: todayTasks.length,
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    pending: todayTasks.length - completedTasks.length - inProgressTasks.length,
    efficiency: todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0
  }
}