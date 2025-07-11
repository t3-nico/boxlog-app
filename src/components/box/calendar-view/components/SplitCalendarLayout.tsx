'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { isToday, isSameDay } from 'date-fns'
import { TimeAxisLabels } from './TimeAxisLabels'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
import { CalendarTask } from '../utils/time-grid-helpers'
import type { ViewDateRange, Task, TaskRecord } from '../types'

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

interface SplitCalendarLayoutProps {
  /** 表示する日付配列（1日でも3日でも2週でも対応） */
  dates: Date[]
  /** タスクデータ */
  tasks: Task[]
  /** 日付範囲（Records取得用） */
  dateRange: ViewDateRange
  /** タスククリック時のハンドラ */
  onTaskClick?: (task: CalendarTask) => void
  /** 空の時間スロットクリック時のハンドラ */
  onEmptyClick?: (date: Date, time: string) => void
  /** タスクドラッグ時のハンドラ */
  onTaskDrag?: (taskId: string, newDate: Date) => void
  /** タスク作成時のハンドラ */
  onCreateTask?: (task: CreateTaskInput) => void
  /** 記録作成時のハンドラ */
  onCreateRecord?: (record: CreateRecordInput) => void
}

export function SplitCalendarLayout({
  dates,
  tasks,
  dateRange,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord
}: SplitCalendarLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()

  // Recordsの取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(dateRange)
    }
  }, [planRecordMode, dateRange, fetchRecords])

  // Task[]をCalendarTask[]に変換（計画用）
  const planTasks: CalendarTask[] = useMemo(() => {
    if (planRecordMode === 'record') return []
    
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start || ''),
      endTime: new Date(task.planned_end || task.planned_start || ''),
      color: '#3b82f6',
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
      color: '#10b981',
      description: record.memo || '',
      status: 'completed' as const,
      priority: 'medium' as const,
      isRecord: true,
      satisfaction: record.satisfaction,
      focusLevel: record.focus_level,
      energyLevel: record.energy_level
    }))
  }, [records, planRecordMode])

  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      {planRecordMode === 'both' ? (
        /* 分割表示モード - 2週ビューと全く同じデザイン */
        <div className="flex h-full">
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            className="z-10"
          />
          <div className="flex-1 flex overflow-y-auto relative">
            {dates.map((day, dayIndex) => {
              const dayPlanTasks = planTasks.filter(task => 
                isSameDay(task.startTime, day)
              )
              const dayRecordTasks = recordTasks.filter(task => 
                isSameDay(task.startTime, day)
              )
              
              return (
                <div key={day.toISOString()} className="flex-1 relative border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                  {/* 時間グリッド背景 */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="border-b border-gray-100 dark:border-gray-800"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      />
                    ))}
                  </div>
                  
                  {/* 中央分割線 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 z-10 -translate-x-0.5"></div>
                  
                  {/* 今日のみに現在時刻線を表示 */}
                  {isToday(day) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-red-500 z-30 flex items-center"
                      style={{
                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                      }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 flex-shrink-0"></div>
                      <div className="flex-1 h-px bg-red-500"></div>
                    </div>
                  )}
                  
                  {/* 左側：予定 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-0.5">
                    {dayPlanTasks.map(task => {
                      const startHour = task.startTime.getHours()
                      const startMinute = task.startTime.getMinutes()
                      const endHour = task.endTime.getHours()
                      const endMinute = task.endTime.getMinutes()
                      const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                      const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                      
                      return (
                        <div
                          key={task.id}
                          className="absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-blue-600 z-20"
                          style={{
                            top: `${topPosition}px`,
                            height: `${Math.max(height, 20)}px`
                          }}
                          onClick={() => handleTaskClick(task)}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* 右側：記録 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1/2 pl-0.5">
                    {dayRecordTasks.map(task => {
                      const startHour = task.startTime.getHours()
                      const startMinute = task.startTime.getMinutes()
                      const endHour = task.endTime.getHours()
                      const endMinute = task.endTime.getMinutes()
                      const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                      const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                      
                      return (
                        <div
                          key={task.id}
                          className="absolute left-1 right-1 bg-green-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-green-600 z-20"
                          style={{
                            top: `${topPosition}px`,
                            height: `${Math.max(height, 20)}px`
                          }}
                          onClick={() => handleTaskClick(task)}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : planRecordMode === 'plan' ? (
        /* 予定のみ表示 */
        <div className="flex h-full">
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            className="z-10"
          />
          <div className="flex-1 flex overflow-y-auto relative">
            {dates.map((day, dayIndex) => {
              const dayPlanTasks = planTasks.filter(task => 
                isSameDay(task.startTime, day)
              )
              
              return (
                <div key={day.toISOString()} className="flex-1 relative border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="border-b border-gray-100 dark:border-gray-800"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      />
                    ))}
                  </div>
                  
                  {/* 今日のみに現在時刻線を表示 */}
                  {isToday(day) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-red-500 z-30 flex items-center"
                      style={{
                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                      }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 flex-shrink-0"></div>
                      <div className="flex-1 h-px bg-red-500"></div>
                    </div>
                  )}
                  
                  {dayPlanTasks.map(task => {
                    const startHour = task.startTime.getHours()
                    const startMinute = task.startTime.getMinutes()
                    const endHour = task.endTime.getHours()
                    const endMinute = task.endTime.getMinutes()
                    const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                    
                    return (
                      <div
                        key={task.id}
                        className="absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-blue-600 z-20"
                        style={{
                          top: `${topPosition}px`,
                          height: `${Math.max(height, 20)}px`
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* 記録のみ表示 */
        <div className="flex h-full">
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            className="z-10"
          />
          <div className="flex-1 flex overflow-y-auto relative">
            {dates.map((day, dayIndex) => {
              const dayRecordTasks = recordTasks.filter(task => 
                isSameDay(task.startTime, day)
              )
              
              return (
                <div key={day.toISOString()} className="flex-1 relative border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="border-b border-gray-100 dark:border-gray-800"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      />
                    ))}
                  </div>
                  
                  {/* 今日のみに現在時刻線を表示 */}
                  {isToday(day) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-red-500 z-30 flex items-center"
                      style={{
                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                      }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 flex-shrink-0"></div>
                      <div className="flex-1 h-px bg-red-500"></div>
                    </div>
                  )}
                  
                  {dayRecordTasks.map(task => {
                    const startHour = task.startTime.getHours()
                    const startMinute = task.startTime.getMinutes()
                    const endHour = task.endTime.getHours()
                    const endMinute = task.endTime.getMinutes()
                    const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                    
                    return (
                      <div
                        key={task.id}
                        className="absolute left-1 right-1 bg-green-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-green-600 z-20"
                        style={{
                          top: `${topPosition}px`,
                          height: `${Math.max(height, 20)}px`
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}