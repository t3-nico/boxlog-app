'use client'

import React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarTask as CalendarTaskType } from '../utils/time-grid-helpers'

interface CalendarTaskProps {
  task: CalendarTaskType
  view?: 'day' | 'week' | 'month'
  style?: React.CSSProperties
  isDragging?: boolean
  isResizing?: boolean
  isHovered?: boolean
  conflicts?: number
  totalConflicts?: number
  onClick?: (task: CalendarTaskType) => void
  onDoubleClick?: (task: CalendarTaskType) => void
}

export function CalendarTask({ 
  task, 
  view = 'week',
  style,
  isDragging = false,
  isResizing = false,
  isHovered = false,
  conflicts = 0,
  totalConflicts = 1,
  onClick,
  onDoubleClick
}: CalendarTaskProps) {
  // タスクの長さ計算（分単位）
  const duration = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60)
  const isShort = duration < 30
  const isVeryShort = duration < 15
  
  // 重複時の幅とオフセット計算
  const widthPercentage = 100 / totalConflicts
  const leftOffset = conflicts * widthPercentage
  
  // Google Calendar風のスタイル（計画/実績を考慮）
  const taskStyle = getTaskStyle(task.status || 'scheduled', task.priority || 'medium', task.isPlan, task.isRecord)
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(task)
  }
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(task)
  }
  
  return (
    <div
      className={cn(
        // 基本スタイル
        "absolute rounded-md border-l-4 overflow-hidden cursor-pointer select-none",
        "transition-all duration-150",
        
        // Google Calendar風の影
        "shadow-sm hover:shadow-md",
        
        // ステータスに応じた色
        taskStyle.base,
        
        // ホバー効果
        !isDragging && !isResizing && taskStyle.hover,
        
        // ドラッグ中のスタイル
        isDragging && "opacity-50 scale-95 z-50",
        isResizing && "cursor-ns-resize",
        
        // ホバー時の強調
        isHovered && "ring-2 ring-blue-400 ring-opacity-50",
        
        // 短いタスクの調整
        isVeryShort && "text-xs min-h-[20px]",
        isShort && "py-1"
      )}
      style={{
        ...style,
        // 重複時の配置調整
        left: totalConflicts > 1 ? `${leftOffset}%` : undefined,
        width: totalConflicts > 1 ? `${widthPercentage - 1}%` : undefined, // 1%のマージン
        // 最小高さの確保
        minHeight: '20px'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={task.description || task.title}
    >
      <div className={cn(
        "h-full px-2 py-1 flex overflow-hidden",
        isShort ? "flex-row items-center gap-1" : "flex-col"
      )}>
        {/* タイトルと時刻 */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium truncate",
            isVeryShort ? "text-xs" : "text-sm"
          )}>
            {view === 'day' || !isVeryShort ? (
              <>
                <span className="text-xs opacity-90 mr-1">
                  {format(task.startTime, 'HH:mm')}
                </span>
                {/* 計画/実績の表示アイコン */}
                {(task.isPlan || task.isRecord) && (
                  <span className="text-xs mr-1 font-semibold">
                    {task.isPlan && '📅'}
                    {task.isRecord && '✅'}
                  </span>
                )}
                {task.title}
              </>
            ) : (
              <>
                {(task.isPlan || task.isRecord) && (
                  <span className="text-xs mr-1">
                    {task.isPlan && '📅'}
                    {task.isRecord && '✅'}
                  </span>
                )}
                {task.title}
              </>
            )}
          </div>
          
          {/* 詳細情報（十分なスペースがある場合のみ） */}
          {!isShort && view !== 'month' && (
            <>
              {/* 時間範囲 */}
              <div className="text-xs opacity-90 mt-1">
                {format(task.startTime, 'HH:mm')} - {format(task.endTime, 'HH:mm')}
              </div>
              
              {/* 説明（長いタスクのみ） */}
              {duration >= 60 && task.description && (
                <div className="text-xs opacity-80 mt-1 line-clamp-2">
                  {task.description}
                </div>
              )}
              
              {/* 実績の満足度表示 */}
              {task.isRecord && task.satisfaction && (
                <div className="text-xs opacity-80 mt-1 flex items-center gap-1">
                  <span>満足度:</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < task.satisfaction! ? 'text-yellow-400' : 'text-gray-400'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* ステータスインジケーター（短いタスクの場合） */}
        {isShort && (
          <div className="flex-shrink-0">
            <StatusIndicator status={task.status || 'scheduled'} size="sm" />
          </div>
        )}
      </div>
      
      {/* リサイズハンドル（デスクトップのみ） */}
      {view === 'day' && !isVeryShort && (
        <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors" />
      )}
    </div>
  )
}

// Google Calendar風の色定義（計画/実績対応）
function getTaskStyle(status: string, priority: string, isPlan?: boolean, isRecord?: boolean) {
  const baseClasses = "border-opacity-80"
  
  // 計画と実績で異なるスタイル
  if (isPlan) {
    // 計画タスクは青系、実線ボーダー
    const planStyles = {
      scheduled: {
        base: "bg-blue-500 text-white border-blue-600",
        hover: "hover:bg-blue-600"
      },
      in_progress: {
        base: "bg-blue-600 text-white border-blue-700",
        hover: "hover:bg-blue-700"
      },
      pending: {
        base: "bg-blue-400 text-white border-blue-500",
        hover: "hover:bg-blue-500"
      }
    }
    
    const statusStyle = planStyles[status as keyof typeof planStyles] || planStyles.scheduled
    const priorityClass = getPriorityModifier(priority, 'solid')
    
    return {
      base: `${statusStyle.base} ${baseClasses} ${priorityClass}`,
      hover: statusStyle.hover
    }
  }
  
  if (isRecord) {
    // 実績タスクは緑系、点線ボーダー
    const recordStyles = {
      completed: {
        base: "bg-green-500 text-white border-green-600 border-dashed",
        hover: "hover:bg-green-600"
      },
      in_progress: {
        base: "bg-green-600 text-white border-green-700 border-dashed", 
        hover: "hover:bg-green-700"
      },
      scheduled: {
        base: "bg-green-400 text-white border-green-500 border-dashed",
        hover: "hover:bg-green-500"
      }
    }
    
    const statusStyle = recordStyles[status as keyof typeof recordStyles] || recordStyles.completed
    const priorityClass = getPriorityModifier(priority, 'dashed')
    
    return {
      base: `${statusStyle.base} ${baseClasses} ${priorityClass}`,
      hover: statusStyle.hover
    }
  }
  
  // 従来のステータスベースの色（計画でも実績でもない場合）
  const statusStyles = {
    scheduled: {
      base: "bg-gray-500 text-white border-gray-600",
      hover: "hover:bg-gray-600"
    },
    completed: {
      base: "bg-green-500 text-white border-green-600", 
      hover: "hover:bg-green-600"
    },
    in_progress: {
      base: "bg-orange-500 text-white border-orange-600",
      hover: "hover:bg-orange-600"
    },
    rescheduled: {
      base: "bg-yellow-500 text-yellow-900 border-yellow-600",
      hover: "hover:bg-yellow-600 hover:text-yellow-900"
    },
    stopped: {
      base: "bg-gray-400 text-white border-gray-500",
      hover: "hover:bg-gray-500"
    },
    pending: {
      base: "bg-purple-500 text-white border-purple-600",
      hover: "hover:bg-purple-600"
    }
  }
  
  const statusStyle = statusStyles[status as keyof typeof statusStyles] || statusStyles.scheduled
  const priorityClass = getPriorityModifier(priority, 'solid')
  
  return {
    base: `${statusStyle.base} ${baseClasses} ${priorityClass}`,
    hover: statusStyle.hover
  }
}

// 優先度による微調整（ボーダースタイル対応）
function getPriorityModifier(priority: string, borderStyle: 'solid' | 'dashed') {
  const baseModifiers = {
    high: "border-l-8 font-semibold",
    medium: "border-l-4",
    low: "border-l-2 opacity-90"
  }
  
  const modifier = baseModifiers[priority as keyof typeof baseModifiers] || baseModifiers.medium
  
  // 点線ボーダーの場合は追加のクラスを適用
  if (borderStyle === 'dashed') {
    return `${modifier} border-dashed`
  }
  
  return modifier
}

// ステータスインジケーター
interface StatusIndicatorProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-4 h-4", 
    lg: "w-4 h-4"
  }
  
  const statusColors = {
    scheduled: "bg-blue-400",
    completed: "bg-green-400",
    in_progress: "bg-orange-400",
    rescheduled: "bg-yellow-400",
    stopped: "bg-gray-400",
    pending: "bg-purple-400"
  }
  
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.scheduled
  
  return (
    <div className={cn(
      "rounded-full",
      sizeClasses[size],
      colorClass
    )} />
  )
}

// 月表示用のコンパクトタスク
interface CompactTaskProps {
  task: CalendarTaskType
  onClick?: (task: CalendarTaskType) => void
}

export function CompactTask({ task, onClick }: CompactTaskProps) {
  const taskStyle = getTaskStyle(task.status || 'scheduled', task.priority || 'medium', task.isPlan, task.isRecord)
  
  return (
    <div
      className={cn(
        "text-xs px-2 py-1 rounded border cursor-pointer",
        "transition-all duration-150 hover:scale-105",
        "truncate max-w-full",
        taskStyle.base.replace('border-l-4', 'border-l-2'),
        taskStyle.hover
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(task)
      }}
      title={`${task.title} (${format(task.startTime, 'HH:mm')} - ${format(task.endTime, 'HH:mm')})`}
    >
      <span className="text-xs opacity-75 mr-1">
        {format(task.startTime, 'HH:mm')}
      </span>
      {/* 計画/実績アイコン */}
      {(task.isPlan || task.isRecord) && (
        <span className="text-xs mr-1">
          {task.isPlan && '📅'}
          {task.isRecord && '✅'}
        </span>
      )}
      {task.title}
    </div>
  )
}

// ドラッグプレビュー用
interface TaskPreviewProps {
  task: CalendarTaskType
  view?: 'day' | 'week' | 'month'
}

export function TaskPreview({ task, view = 'week' }: TaskPreviewProps) {
  return (
    <CalendarTask
      task={task}
      view={view}
      style={{
        position: 'relative',
        opacity: 0.9,
        transform: 'rotate(3deg)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }}
    />
  )
}

// 複数タスクのオーバーレイ表示
interface TaskOverlayProps {
  tasks: CalendarTaskType[]
  maxVisible?: number
  onViewAll?: () => void
}

export function TaskOverlay({ tasks, maxVisible = 3, onViewAll }: TaskOverlayProps) {
  const visibleTasks = tasks.slice(0, maxVisible)
  const hiddenCount = Math.max(0, tasks.length - maxVisible)
  
  return (
    <div className="space-y-1">
      {visibleTasks.map((task, index) => (
        <CompactTask key={task.id} task={task} />
      ))}
      
      {hiddenCount > 0 && (
        <button
          onClick={onViewAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer w-full text-left"
        >
          +{hiddenCount}件を表示
        </button>
      )}
    </div>
  )
}