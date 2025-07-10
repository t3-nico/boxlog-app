'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { format, startOfDay, addDays, isToday, isSameDay, isThisWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarTask } from '../utils/time-grid-helpers'
import { DayGroup } from '../components/DayGroup'
import { TimeGrid } from '../TimeGrid'
import { SplitGridBackground } from '../components/SplitGridBackground'
import { filterTasksForDate } from '../utils/view-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import type { ViewDateRange, Task, TaskRecord } from '../types'

interface ScheduleViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptySlotClick?: (date: Date, time: string) => void
  onDateClick?: (date: Date) => void
  useSplitLayout?: boolean
}

export function ScheduleView({ 
  dateRange,
  tasks,
  currentDate,
  onTaskClick,
  onEmptySlotClick,
  onDateClick,
  useSplitLayout = false
}: ScheduleViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  const [extendedDateRange, setExtendedDateRange] = useState({
    start: startOfDay(currentDate),
    end: addDays(startOfDay(currentDate), 30) // 初期30日分
  })
  
  // Recordsの取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(extendedDateRange)
    }
  }, [planRecordMode, extendedDateRange, fetchRecords])
  
  // Task[]をCalendarTask[]に変換（計画用）
  const planTasks: CalendarTask[] = useMemo(() => {
    if (planRecordMode === 'record') return []
    
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: task.planned_start,
      endTime: new Date(task.planned_start.getTime() + task.planned_duration * 60000),
      color: '#3b82f6', // 計画は青色
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium',
      isPlan: true
    }))
  }, [tasks, planRecordMode])
  
  // TaskRecord[]をCalendarTask[]に変換（実績用）
  const recordTasks: CalendarTask[] = useMemo(() => {
    if (planRecordMode === 'plan') return []
    
    return records.map(record => ({
      id: record.id,
      title: record.title,
      startTime: new Date(record.actual_start),
      endTime: new Date(record.actual_end),
      color: '#10b981', // 実績は緑色
      description: record.memo || '',
      status: 'completed' as const,
      priority: 'medium' as const,
      isRecord: true,
      satisfaction: record.satisfaction,
      focusLevel: record.focus_level,
      energyLevel: record.energy_level
    }))
  }, [records, planRecordMode])
  
  // 表示するタスクを決定
  const calendarTasks: CalendarTask[] = useMemo(() => {
    switch (planRecordMode) {
      case 'plan':
        return planTasks
      case 'record':
        return recordTasks
      case 'both':
        return [...planTasks, ...recordTasks]
      default:
        return planTasks
    }
  }, [planTasks, recordTasks, planRecordMode])
  
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
  
  // スクロール機能は無効化（自動スクロールを防ぐため）
  const scrollToToday = useCallback(() => {
    // 自動スクロールを無効化
  }, [])
  
  const scrollToDate = useCallback((date: Date) => {
    // 自動スクロールを無効化
  }, [])
  
  
  const handleTaskClick = useCallback((task: CalendarTask) => {
    onTaskClick?.(task)
  }, [onTaskClick])
  
  const handleEmptySlotClick = useCallback((date: Date, time: string) => {
    onEmptySlotClick?.(date, time)
  }, [onEmptySlotClick])

  const handleTaskDrop = useCallback((task: CalendarTask, newDate: Date, newStartTime: Date) => {
    // タスクドロップ処理（必要に応じて実装）
    console.log('Task dropped:', task, newDate, newStartTime)
  }, [])
  
  // 分割表示を使用するかの判定
  const shouldUseSplit = useSplitLayout || (planRecordMode === 'both' && (planTasks.length > 0 || recordTasks.length > 0))
  
  // 表示する日付の配列を生成
  const displayDates = useMemo(() => {
    const dates: Date[] = []
    let currentIterDate = extendedDateRange.start
    while (currentIterDate <= extendedDateRange.end) {
      dates.push(new Date(currentIterDate))
      currentIterDate = addDays(currentIterDate, 1)
    }
    return dates
  }, [extendedDateRange])

  // 分割表示用のTask[]を準備（CalendarTask[]からTask[]に変換）
  const splitTasks = useMemo(() => {
    return tasks.filter(task => 
      task.planned_start && displayDates.some(date => 
        isSameDay(new Date(task.planned_start!), date)
      )
    )
  }, [tasks, displayDates])

  // 分割表示用のコンテンツ（左側：予定）
  const planContent = useMemo(() => {
    if (!shouldUseSplit) return null
    
    return (
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="max-w-4xl mx-auto">
          {groupedTasks.map(({ date, tasks: dayTasks }) => {
            const dayPlanTasks = dayTasks.filter(task => task.isPlan)
            if (dayPlanTasks.length === 0 && planRecordMode !== 'both') return null
            
            return (
              <DayGroup
                key={format(date, 'yyyy-MM-dd')}
                date={date}
                tasks={dayPlanTasks}
                onTaskClick={handleTaskClick}
                onEmptySlotClick={handleEmptySlotClick}
                onDateClick={onDateClick}
              />
            )
          })}
        </div>
      </div>
    )
  }, [shouldUseSplit, groupedTasks, handleTaskClick, handleEmptySlotClick, onDateClick, planRecordMode])

  // 分割表示の場合は通常表示と同じTimeGridを使用

  // 通常表示の場合
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          スケジュール表示{shouldUseSplit && '（分割モード）'}
        </h3>
      </div>
      
      {shouldUseSplit ? (
        /* 分割表示モード */
        <div className="flex-1 relative">
          <SplitGridBackground />
          
          {/* 中央の区切り線（各日の中央） */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {displayDates.map((day, index) => {
              const dayWidth = 100 / displayDates.length
              const dayStart = index * dayWidth
              const centerLine = dayStart + (dayWidth / 2)
              
              return (
                <div
                  key={day.toISOString()}
                  className="absolute top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600"
                  style={{
                    left: `${centerLine}%`
                  }}
                />
              )
            })}
          </div>

          {/* TimeGridを使用した分割表示 */}
          <TimeGrid
            dates={displayDates}
            tasks={calendarTasks}
            gridInterval={60}
            scrollToTime="08:00"
            showAllDay={true}
            showCurrentTime={displayDates.some(day => isToday(day))}
            showDateHeader={false}
            businessHours={{ start: 9, end: 18 }}
            onTaskClick={handleTaskClick}
            onEmptyClick={handleEmptySlotClick}
            onTaskDrop={handleTaskDrop}
            className="h-full"
            splitMode={true}
          />
        </div>
      ) : (
        /* スクロール可能なコンテンツ */
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          onScroll={handleScroll}
        >
          <div className="max-w-4xl mx-auto">
            {/* 統一表示モード（計画と実績を同一タイムライン上に表示） */}
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
      )}
    </div>
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