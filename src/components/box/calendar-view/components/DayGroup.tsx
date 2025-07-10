'use client'

import React, { useMemo } from 'react'
import { format, isToday, isYesterday, isTomorrow, isSameWeek, isThisYear } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { CalendarTask } from '../utils/time-grid-helpers'
import { ScheduleTaskCard } from './ScheduleTaskCard'
import { CompactSplitTask } from './SplitTaskCard'
import { EmptyDaySlot } from './EmptyDaySlot'
import { pairPlanAndRecordTasks } from '../utils/task-pairing-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { cn } from '../utils/view-helpers'

interface DayGroupProps {
  date: Date
  tasks: CalendarTask[]
  onTaskClick?: (task: CalendarTask) => void
  onEmptySlotClick?: (date: Date, time: string) => void
  onDateClick?: (date: Date) => void
}

export function DayGroup({
  date,
  tasks,
  onTaskClick,
  onEmptySlotClick,
  onDateClick
}: DayGroupProps) {
  const { planRecordMode } = useCalendarSettingsStore()
  
  // 計画と実績のタスクを分離
  const planTasks = useMemo(() => tasks.filter(task => task.isPlan), [tasks])
  const recordTasks = useMemo(() => tasks.filter(task => task.isRecord), [tasks])
  
  // 分割表示モードの場合はペアリング処理
  const taskPairs = useMemo(() => {
    if (planRecordMode === 'both' && (planTasks.length > 0 || recordTasks.length > 0)) {
      return pairPlanAndRecordTasks(planTasks, recordTasks, date)
    }
    return []
  }, [planTasks, recordTasks, date, planRecordMode])
  
  // 日付のフォーマット
  const dateInfo = useMemo(() => {
    const today = isToday(date)
    const yesterday = isYesterday(date)
    const tomorrow = isTomorrow(date)
    
    let displayName: string
    let dateText: string
    
    if (today) {
      displayName = '今日'
      dateText = format(date, 'M月d日(E)', { locale: ja })
    } else if (yesterday) {
      displayName = '昨日'
      dateText = format(date, 'M月d日(E)', { locale: ja })
    } else if (tomorrow) {
      displayName = '明日'
      dateText = format(date, 'M月d日(E)', { locale: ja })
    } else if (isSameWeek(date, new Date())) {
      displayName = format(date, 'EEEE', { locale: ja })
      dateText = format(date, 'M月d日', { locale: ja })
    } else if (isThisYear(date)) {
      displayName = format(date, 'M月d日', { locale: ja })
      dateText = format(date, 'EEEE', { locale: ja })
    } else {
      displayName = format(date, 'yyyy年M月d日', { locale: ja })
      dateText = format(date, 'EEEE', { locale: ja })
    }
    
    return {
      displayName,
      dateText,
      isToday: today,
      isYesterday: yesterday,
      isTomorrow: tomorrow
    }
  }, [date])

  // タスクを時間でソート
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }, [tasks])

  // 時間帯ごとにタスクをグループ化（朝、午前、午後、夜など）
  const timeGroups = useMemo(() => {
    const groups = {
      allDay: [] as CalendarTask[],
      morning: [] as CalendarTask[], // 6:00-12:00
      afternoon: [] as CalendarTask[], // 12:00-18:00
      evening: [] as CalendarTask[], // 18:00-24:00
      lateNight: [] as CalendarTask[] // 0:00-6:00
    }

    sortedTasks.forEach(task => {
      const hour = task.startTime.getHours()
      const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
      
      // 全日イベント判定
      if (duration >= 24) {
        groups.allDay.push(task)
      } else if (hour >= 6 && hour < 12) {
        groups.morning.push(task)
      } else if (hour >= 12 && hour < 18) {
        groups.afternoon.push(task)
      } else if (hour >= 18 && hour < 24) {
        groups.evening.push(task)
      } else {
        groups.lateNight.push(task)
      }
    })

    return groups
  }, [sortedTasks])

  const handleDateClick = () => {
    onDateClick?.(date)
  }

  const handleEmptySlotClick = () => {
    onEmptySlotClick?.(date, "09:00") // デフォルトで朝9時
  }

  // タスクの有無とカウント（分割表示モードを考慮）
  const totalTasks = planRecordMode === 'both' ? taskPairs.length : tasks.length
  const hasAnyTasks = totalTasks > 0

  return (
    <div 
      className="mb-6 last:mb-0" 
      data-date={format(date, 'yyyy-MM-dd')}
    >
      {/* 日付ヘッダー */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 mb-3 rounded-lg cursor-pointer transition-all duration-200",
          "border border-gray-200 dark:border-gray-700",
          "hover:bg-gray-50 dark:hover:bg-gray-800",
          dateInfo.isToday && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
          dateInfo.isYesterday && "bg-gray-50 dark:bg-gray-800/50",
          dateInfo.isTomorrow && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
        )}
        onClick={handleDateClick}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className={cn(
            "w-5 h-5",
            dateInfo.isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
          )} />
          <div>
            <h3 className={cn(
              "text-lg font-semibold",
              dateInfo.isToday ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"
            )}>
              {dateInfo.displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dateInfo.dateText}
            </p>
          </div>
        </div>
        
        {/* タスク数表示 */}
        <div className="flex items-center space-x-2">
          {hasAnyTasks ? (
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              dateInfo.isToday 
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            )}>
              {totalTasks}件
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              予定なし
            </div>
          )}
        </div>
      </div>

      {/* タスクリスト */}
      <div className="space-y-1">
        {planRecordMode === 'both' && taskPairs.length > 0 ? (
          /* 分割表示モード */
          <>
            {/* 全日ペア */}
            {taskPairs.filter(pair => {
              const referenceTask = pair.planTask || pair.recordTask
              if (!referenceTask) return false
              const duration = (referenceTask.endTime.getTime() - referenceTask.startTime.getTime()) / (1000 * 60 * 60)
              return duration >= 24
            }).map(pair => (
              <div key={pair.id} className="mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 px-3">
                  終日
                </div>
                <CompactSplitTask
                  planTask={pair.planTask}
                  recordTask={pair.recordTask}
                  onClick={(task, type) => onTaskClick?.(task)}
                />
              </div>
            ))}

            {/* 時間指定ペア */}
            {taskPairs.filter(pair => {
              const referenceTask = pair.planTask || pair.recordTask
              if (!referenceTask) return false
              const duration = (referenceTask.endTime.getTime() - referenceTask.startTime.getTime()) / (1000 * 60 * 60)
              return duration < 24
            }).map(pair => (
              <CompactSplitTask
                key={pair.id}
                planTask={pair.planTask}
                recordTask={pair.recordTask}
                onClick={(task, type) => onTaskClick?.(task)}
              />
            ))}
          </>
        ) : hasAnyTasks ? (
          /* 通常表示モード */
          <>
            {/* 全日イベント */}
            {timeGroups.allDay.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">
                  終日
                </div>
                <div className="space-y-1">
                  {timeGroups.allDay.map(task => (
                    <ScheduleTaskCard
                      key={task.id}
                      task={task}
                      isAllDay={true}
                      onClick={onTaskClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 時間指定タスク */}
            {sortedTasks.filter(t => !timeGroups.allDay.includes(t)).map(task => (
              <ScheduleTaskCard
                key={task.id}
                task={task}
                isAllDay={false}
                onClick={onTaskClick}
              />
            ))}
          </>
        ) : (
          /* 空の日スロット */
          <EmptyDaySlot
            date={date}
            onEmptySlotClick={handleEmptySlotClick}
          />
        )}
      </div>

    </div>
  )
}

