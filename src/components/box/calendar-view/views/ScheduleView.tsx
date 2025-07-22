'use client'

import React, { useMemo, useEffect } from 'react'
import { format, isToday, isSameDay, addDays, startOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { CalendarTask } from '../utils/time-grid-helpers'
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

  // 1週間分の日付を生成
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const dates = []
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i))
    }
    return dates
  }, [currentDate])

  // 日付ごとにタスクをグループ化
  const dailyTasks = useMemo(() => {
    return weekDates.map(date => {
      const dayPlanTasks = planTasks
        .filter(task => isSameDay(task.startTime, date))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

      const dayRecordTasks = recordTasks
        .filter(task => isSameDay(task.startTime, date))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

      return {
        date,
        planTasks: dayPlanTasks,
        recordTasks: dayRecordTasks
      }
    })
  }, [weekDates, planTasks, recordTasks])

  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">

      {planRecordMode === 'both' ? (
        /* 分割表示モード：予定と記録を左右に分割 */
        <div className="flex-1 flex overflow-hidden">
          {/* 左側：予定 */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                予定 (Plan)
              </h3>
            </div>
            <div className="overflow-y-auto h-full">
              {dailyTasks.map(({ date, planTasks }) => (
                <div key={date.toISOString()} className="border-b border-gray-100 dark:border-gray-800">
                  {/* 日付ヘッダー */}
                  <div className={`p-4 ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-medium ${
                        isToday(date) 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {format(date, 'M月d日(E)', { locale: ja })}
                      </div>
                      {isToday(date) && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                          今日
                        </span>
                      )}
                    </div>
                  </div>

                  {/* タスクリスト */}
                  <div className="pb-4">
                    {planTasks.length > 0 ? (
                      <div className="space-y-2 px-4">
                        {planTasks.map(task => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-mono min-w-0 flex-shrink-0 mt-1">
                              {task.startTime.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          予定がありません
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側：記録 */}
          <div className="w-1/2">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
                記録 (Record)
              </h3>
            </div>
            <div className="overflow-y-auto h-full">
              {dailyTasks.map(({ date, recordTasks }) => (
                <div key={date.toISOString()} className="border-b border-gray-100 dark:border-gray-800">
                  {/* 日付ヘッダー */}
                  <div className={`p-4 ${isToday(date) ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-medium ${
                        isToday(date) 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {format(date, 'M月d日(E)', { locale: ja })}
                      </div>
                      {isToday(date) && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">
                          今日
                        </span>
                      )}
                    </div>
                  </div>

                  {/* タスクリスト */}
                  <div className="pb-4">
                    {recordTasks.length > 0 ? (
                      <div className="space-y-2 px-4">
                        {recordTasks.map(task => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors"
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="text-xs text-green-600 dark:text-green-400 font-mono min-w-0 flex-shrink-0 mt-1">
                              {task.startTime.toLocaleTimeString('ja-JP', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {task.title}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {task.endTime.toLocaleTimeString('ja-JP', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })} まで
                              </div>
                              {task.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          記録がありません
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 統一表示モード */
        <div className="flex-1 overflow-y-auto">
          {dailyTasks.map(({ date, planTasks, recordTasks }) => {
            const allTasks = [...planTasks, ...recordTasks].sort((a, b) => 
              a.startTime.getTime() - b.startTime.getTime()
            )

            return (
              <div key={date.toISOString()} className="border-b border-gray-100 dark:border-gray-800">
                {/* 日付ヘッダー */}
                <div className={`p-4 ${isToday(date) ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`text-sm font-medium ${
                      isToday(date) 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {format(date, 'M月d日(E)', { locale: ja })}
                    </div>
                    {isToday(date) && (
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        今日
                      </span>
                    )}
                  </div>
                </div>

                {/* タスクリスト */}
                <div className="pb-4">
                  {allTasks.length > 0 ? (
                    <div className="space-y-2 px-4">
                      {allTasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            task.isPlan 
                              ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                              : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className={`text-xs font-mono min-w-0 flex-shrink-0 mt-1 ${
                            task.isPlan 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {task.startTime.toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {task.title}
                              {task.isPlan && (
                                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(予定)</span>
                              )}
                              {task.isRecord && (
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">(記録)</span>
                              )}
                            </div>
                            {task.isRecord && (
                              <div className={`text-xs mt-1 ${
                                task.isPlan 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {task.endTime.toLocaleTimeString('ja-JP', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })} まで
                              </div>
                            )}
                            {task.description && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        予定・記録がありません
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}