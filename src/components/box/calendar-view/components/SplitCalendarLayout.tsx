'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { isToday, isSameDay } from 'date-fns'
import { TimeAxisLabels } from './TimeAxisLabels'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
import { CalendarTask } from '../utils/time-grid-helpers'
import { CalendarEventComponent } from './CalendarEvent'
import type { ViewDateRange, Task, TaskRecord } from '../types'
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

interface SplitCalendarLayoutProps {
  /** 表示する日付配列（1日でも3日でも2週でも対応） */
  dates: Date[]
  /** タスクデータ */
  tasks: Task[]
  /** イベントデータ */
  events?: CalendarEvent[]
  /** 日付範囲（Records取得用） */
  dateRange: ViewDateRange
  /** タスククリック時のハンドラ */
  onTaskClick?: (task: CalendarTask) => void
  /** イベントクリック時のハンドラ */
  onEventClick?: (event: CalendarEvent) => void
  /** イベント作成時のハンドラ */
  onCreateEvent?: (date: Date, time?: string) => void
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
  events = [],
  dateRange,
  onTaskClick,
  onEventClick,
  onCreateEvent,
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
        /* スケジュールビュー - Googleカレンダー風テキストベース表示 */
        <div className="flex h-full">
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            className="z-10"
          />
          <div className="flex-1 flex overflow-y-auto relative">
            {dates.map((day, dayIndex) => {
              // その日のタスクと記録を時間順でソート
              const dayPlanTasks = planTasks.filter(task => 
                isSameDay(task.startTime, day)
              ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              
              const dayRecordTasks = recordTasks.filter(task => 
                isSameDay(task.startTime, day)
              ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              
              // その日のイベント
              const dayEvents = events.filter(event => 
                isSameDay(event.startDate, day)
              ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              
              
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
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 z-10 -translate-x-1"></div>
                  
                  {/* ラベル */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 flex">
                    <div className="flex-1 text-center text-xs text-gray-600 dark:text-gray-400 py-1">event</div>
                    <div className="w-px bg-gray-400 dark:bg-gray-600"></div>
                    <div className="flex-1 text-center text-xs text-gray-600 dark:text-gray-400 py-1">log</div>
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
                  
                  {/* 左側：イベント表示 */}
                  <div className="absolute left-0 top-6 bottom-0 w-1/2 pr-1 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="text-xs text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded"
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="text-green-600 dark:text-green-400 font-mono text-xs min-w-0 flex-shrink-0">
                              {event.startDate.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}
                            </div>
                            <div className="font-medium truncate flex-1">
                              {event.title}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 右側：記録（テキストベース） */}
                  <div className="absolute left-1/2 top-6 bottom-0 w-1/2 pl-1 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {dayRecordTasks.map(task => (
                        <div
                          key={task.id}
                          className="text-xs text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1 rounded"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="text-orange-600 dark:text-orange-400 font-mono text-xs min-w-0 flex-shrink-0">
                              {task.startTime.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}
                            </div>
                            <div className="font-medium truncate flex-1">
                              {task.title}
                            </div>
                          </div>
                          <div className="text-green-600 dark:text-green-400 text-xs ml-12 mt-1">
                            {task.endTime.toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })} まで
                          </div>
                        </div>
                      ))}
                    </div>
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
                        className="absolute left-1 right-1 bg-blue-500 text-white text-xs rounded-sm cursor-pointer hover:bg-blue-600 z-20 shadow-sm border border-blue-600"
                        style={{
                          top: `${topPosition}px`,
                          height: `${Math.max(height, 24)}px`
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="p-1 h-full flex flex-col justify-start">
                          <div className="font-medium leading-tight truncate">{task.title}</div>
                          {height >= 40 && (
                            <div className="text-blue-100 text-xs mt-1 leading-tight">
                              {task.startTime.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}
                            </div>
                          )}
                        </div>
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
                        className="absolute left-1 right-1 bg-green-500 text-white text-xs rounded-sm cursor-pointer hover:bg-green-600 z-20 shadow-sm border border-green-600"
                        style={{
                          top: `${topPosition}px`,
                          height: `${Math.max(height, 24)}px`
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="p-1 h-full flex flex-col justify-start">
                          <div className="font-medium leading-tight truncate">{task.title}</div>
                          {height >= 40 && (
                            <div className="text-green-100 text-xs mt-1 leading-tight">
                              {task.startTime.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })} - {task.endTime.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}
                            </div>
                          )}
                        </div>
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