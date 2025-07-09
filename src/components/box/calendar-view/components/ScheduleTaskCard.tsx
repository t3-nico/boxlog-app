'use client'

import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { ClockIcon, CheckCircleIcon, PlayCircleIcon, PauseCircleIcon } from '@heroicons/react/24/outline'
import { CalendarTask } from '../utils/time-grid-helpers'
import { cn, getTaskColorClass, getPriorityColorClass } from '../utils/view-helpers'

interface ScheduleTaskCardProps {
  task: CalendarTask
  isAllDay?: boolean
  onClick?: (task: CalendarTask) => void
}

export function ScheduleTaskCard({
  task,
  isAllDay = false,
  onClick
}: ScheduleTaskCardProps) {
  // 時間情報の計算
  const timeInfo = useMemo(() => {
    if (isAllDay) return null
    
    const startTime = format(task.startTime, 'HH:mm')
    const endTime = format(task.endTime, 'HH:mm')
    const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60) // 分
    const durationText = duration >= 60 
      ? `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ''}`
      : `${duration}m`
    
    return {
      startTime,
      endTime,
      duration,
      durationText,
      timeRange: `${startTime} - ${endTime}`
    }
  }, [task.startTime, task.endTime, isAllDay])

  // ステータスアイコンの取得
  const StatusIcon = useMemo(() => {
    switch (task.status) {
      case 'completed':
        return CheckCircleIcon
      case 'in_progress':
        return PlayCircleIcon
      case 'pending':
        return PauseCircleIcon
      default:
        return ClockIcon
    }
  }, [task.status])

  // 色テーマの計算
  const colorClasses = useMemo(() => {
    const statusColors = getTaskColorClass(task.status || 'scheduled')
    const priorityColors = getPriorityColorClass(task.priority || 'medium')
    
    return {
      status: statusColors,
      priority: priorityColors,
      // カスタムカラーがある場合は使用
      custom: task.color ? {
        borderColor: task.color,
        backgroundColor: `${task.color}10` // 透明度10%
      } : null
    }
  }, [task.status, task.priority, task.color])

  const handleClick = () => {
    onClick?.(task)
  }

  return (
    <div
      className={cn(
        "group relative flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:scale-[1.02]",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "hover:bg-gray-50 dark:hover:bg-gray-750",
        // ステータス別の装飾
        task.status === 'completed' && "opacity-75 hover:opacity-90",
        task.status === 'in_progress' && "ring-1 ring-blue-200 dark:ring-blue-700",
        // 優先度別の左ボーダー
        task.priority === 'high' && "border-l-4 border-l-red-500",
        task.priority === 'medium' && "border-l-4 border-l-yellow-500",
        task.priority === 'low' && "border-l-4 border-l-green-500"
      )}
      style={colorClasses.custom || undefined}
      onClick={handleClick}
    >
      {/* 時間表示 */}
      {!isAllDay && timeInfo && (
        <div className="flex-shrink-0 w-20 mr-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {timeInfo.startTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {timeInfo.durationText}
          </div>
        </div>
      )}

      {/* 全日表示のマーカー */}
      {isAllDay && (
        <div className="flex-shrink-0 mr-3">
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
            終日
          </div>
        </div>
      )}

      {/* ステータスアイコン */}
      <div className="flex-shrink-0 mr-3">
        <StatusIcon className={cn(
          "w-5 h-5",
          task.status === 'completed' && "text-green-500 dark:text-green-400",
          task.status === 'in_progress' && "text-blue-500 dark:text-blue-400",
          task.status === 'pending' && "text-gray-400 dark:text-gray-500",
          task.status === 'scheduled' && "text-purple-500 dark:text-purple-400"
        )} />
      </div>

      {/* タスク情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* タイトル */}
            <h4 className={cn(
              "text-sm font-medium truncate",
              task.status === 'completed' 
                ? "text-gray-600 dark:text-gray-400 line-through" 
                : "text-gray-900 dark:text-white"
            )}>
              {task.title}
            </h4>
            
            {/* 説明 */}
            {task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* 右側の情報 */}
          <div className="flex-shrink-0 ml-3 text-right">
            {!isAllDay && timeInfo && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {timeInfo.endTime}
              </div>
            )}
            
            {/* 優先度インジケーター */}
            {task.priority !== 'medium' && (
              <div className={cn(
                "inline-block w-2 h-2 rounded-full mt-1",
                task.priority === 'high' && "bg-red-500",
                task.priority === 'low' && "bg-green-500"
              )} />
            )}
          </div>
        </div>

        {/* プログレスバー（進行中タスク用） */}
        {task.status === 'in_progress' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-500 dark:bg-blue-400 h-1 rounded-full transition-all duration-300"
                style={{ width: '45%' }} // 仮の進捗率
              />
            </div>
          </div>
        )}
      </div>

      {/* ホバー時のアクション */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
        <div className="flex items-center space-x-1">
          {/* 編集ボタン */}
          <button 
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // 編集アクション
            }}
          >
            <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {/* ステータス変更ボタン */}
          {task.status !== 'completed' && (
            <button 
              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // 完了マーク
              }}
            >
              <CheckCircleIcon className="w-3 h-3 text-green-500 dark:text-green-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// コンパクト版（より密な表示用）
interface CompactScheduleTaskCardProps extends ScheduleTaskCardProps {
  showTime?: boolean
}

export function CompactScheduleTaskCard({
  task,
  isAllDay = false,
  showTime = true,
  onClick
}: CompactScheduleTaskCardProps) {
  const timeInfo = useMemo(() => {
    if (isAllDay) return null
    return format(task.startTime, 'HH:mm')
  }, [task.startTime, isAllDay])

  const StatusIcon = useMemo(() => {
    switch (task.status) {
      case 'completed':
        return CheckCircleIcon
      case 'in_progress':
        return PlayCircleIcon
      default:
        return null
    }
  }, [task.status])

  const handleClick = () => {
    onClick?.(task)
  }

  return (
    <div
      className={cn(
        "flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors",
        task.status === 'completed' && "opacity-60"
      )}
      onClick={handleClick}
    >
      {/* 時間 */}
      {!isAllDay && showTime && timeInfo && (
        <div className="w-12 text-xs text-gray-500 dark:text-gray-400 font-mono">
          {timeInfo}
        </div>
      )}

      {/* ステータスアイコン */}
      {StatusIcon && (
        <StatusIcon className={cn(
          "w-3 h-3 mr-2",
          task.status === 'completed' && "text-green-500 dark:text-green-400",
          task.status === 'in_progress' && "text-blue-500 dark:text-blue-400"
        )} />
      )}

      {/* タイトル */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "text-sm truncate",
          task.status === 'completed' 
            ? "text-gray-500 dark:text-gray-400 line-through" 
            : "text-gray-900 dark:text-white"
        )}>
          {task.title}
        </div>
      </div>

      {/* 優先度インジケーター */}
      {task.priority !== 'medium' && (
        <div className={cn(
          "w-1.5 h-1.5 rounded-full ml-2",
          task.priority === 'high' && "bg-red-500",
          task.priority === 'low' && "bg-green-500"
        )} />
      )}
    </div>
  )
}

// タスクグループ用のセパレーター
interface TaskTimeSeparatorProps {
  time: string
  label?: string
}

export function TaskTimeSeparator({ time, label }: TaskTimeSeparatorProps) {
  return (
    <div className="flex items-center my-3">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 font-mono">
        {time}
      </div>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-3" />
      {label && (
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {label}
        </div>
      )}
    </div>
  )
}