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
  
  // 実際のplanRecordModeを使用
  const effectivePlanRecordMode = planRecordMode
  
  // 初期スクロール位置を現在時刻に設定
  useEffect(() => {
    const scrollToCurrentTime = () => {
      const now = new Date()
      const currentHour = now.getHours()
      
      // 現在時刻の2時間前にスクロール（見やすくするため）
      const scrollHour = Math.max(0, currentHour - 2)
      const scrollPosition = scrollHour * HOUR_HEIGHT
      
      // スクロールコンテナを見つけてスクロール
      const scrollContainers = document.querySelectorAll('.calendar-scroll')
      
      scrollContainers.forEach((container, index) => {
        container.scrollTop = scrollPosition
      })
    }
    
    // 少し遅延をつけてスクロール（レンダリング完了後）
    const timer = setTimeout(scrollToCurrentTime, 500)
    return () => clearTimeout(timer)
  }, [effectivePlanRecordMode])

  // Recordsの取得
  useEffect(() => {
    if (effectivePlanRecordMode === 'record' || effectivePlanRecordMode === 'both') {
      fetchRecords(dateRange)
    }
  }, [effectivePlanRecordMode, dateRange, fetchRecords])

  // Task[]をCalendarTask[]に変換（計画用）
  const planTasks: CalendarTask[] = useMemo(() => {
    if (effectivePlanRecordMode === 'record') return []
    
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
  }, [tasks, effectivePlanRecordMode])

  // TaskRecord[]をCalendarTask[]に変換（実績用）
  const recordTasks: CalendarTask[] = useMemo(() => {
    if (effectivePlanRecordMode === 'plan') return []
    
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
  }, [records, effectivePlanRecordMode])

  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      {effectivePlanRecordMode === 'both' ? (
        /* スケジュールビュー - Googleカレンダー風テキストベース表示 */
        <div className="flex h-full">
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            className="z-10"
            planRecordMode={effectivePlanRecordMode}
          />
          <div className="flex-1 flex overflow-y-auto relative calendar-scroll" style={{ minHeight: `${24 * HOUR_HEIGHT}px` }}>
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
                    <div className="p-1 space-y-1">
                      {dayEvents.map(event => {
                        const startTime = `${String(event.startDate.getHours()).padStart(2, '0')}:${String(event.startDate.getMinutes()).padStart(2, '0')}`
                        const endTime = event.endDate ? `${String(event.endDate.getHours()).padStart(2, '0')}:${String(event.endDate.getMinutes()).padStart(2, '0')}` : null
                        const eventColor = event.color || '#1a73e8'
                        
                        return (
                          <div
                            key={event.id}
                            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                            onClick={() => onEventClick?.(event)}
                            style={{
                              backgroundColor: `${eventColor}08`,
                              borderLeft: `3px solid ${eventColor}`
                            }}
                          >
                            <div className="p-2">
                              {/* ヘッダー: 時間とタイトル */}
                              <div className="flex items-start gap-2 mb-1">
                                <div 
                                  className="text-xs font-medium px-1.5 py-0.5 rounded text-white flex-shrink-0"
                                  style={{ backgroundColor: eventColor }}
                                >
                                  {startTime}{endTime && ` - ${endTime}`}
                                </div>
                              </div>
                              
                              {/* タイトル */}
                              <div 
                                className="text-sm font-medium leading-tight mb-1 group-hover:text-opacity-80"
                                style={{ color: eventColor }}
                              >
                                {event.title}
                              </div>
                              
                              {/* 説明 */}
                              {event.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 leading-snug line-clamp-1 mb-1">
                                  {event.description}
                                </div>
                              )}
                              
                              {/* 場所 */}
                              {event.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate text-xs">{event.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* ホバー時の編集アイコン */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 bg-white dark:bg-gray-700 rounded shadow-sm flex items-center justify-center">
                                <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
      ) : effectivePlanRecordMode === 'plan' ? (
        /* 予定のみ表示 */
        <div className="flex h-full">
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            className="z-10"
            planRecordMode={effectivePlanRecordMode}
          />
          <div className="flex-1 flex overflow-y-auto relative calendar-scroll" style={{ minHeight: `${24 * HOUR_HEIGHT}px` }}>
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
            planRecordMode={effectivePlanRecordMode}
          />
          <div className="flex-1 flex overflow-y-auto relative calendar-scroll" style={{ minHeight: `${24 * HOUR_HEIGHT}px` }}>
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