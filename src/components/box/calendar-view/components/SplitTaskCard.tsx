'use client'

import React from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarTask as CalendarTaskType } from '../utils/time-grid-helpers'

interface SplitTaskCardProps {
  planTask?: CalendarTaskType
  recordTask?: CalendarTaskType
  view?: 'day' | 'week' | 'month'
  style?: React.CSSProperties
  isDragging?: boolean
  isResizing?: boolean
  isHovered?: boolean
  onClick?: (task: CalendarTaskType, type: 'plan' | 'record') => void
  onDoubleClick?: (task: CalendarTaskType, type: 'plan' | 'record') => void
}

export function SplitTaskCard({ 
  planTask, 
  recordTask,
  view = 'week',
  style,
  isDragging = false,
  isResizing = false,
  isHovered = false,
  onClick,
  onDoubleClick
}: SplitTaskCardProps) {
  // どちらか一方のタスクの時間情報を使用（通常は計画の時間）
  const referenceTask = planTask || recordTask
  if (!referenceTask) return null

  const duration = (referenceTask.endTime.getTime() - referenceTask.startTime.getTime()) / (1000 * 60)
  const isShort = duration < 30
  const isVeryShort = duration < 15

  const handleClick = (task: CalendarTaskType, type: 'plan' | 'record') => (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(task, type)
  }

  const handleDoubleClick = (task: CalendarTaskType, type: 'plan' | 'record') => (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(task, type)
  }

  return (
    <div
      className={cn(
        "absolute rounded-md border overflow-hidden select-none",
        "transition-all duration-150",
        "shadow-sm hover:shadow-md",
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
        minHeight: '20px',
        backgroundColor: 'transparent'
      }}
    >
      <div className="h-full flex">
        {/* 左側: 計画タスク */}
        <div 
          className={cn(
            "flex-1 relative cursor-pointer",
            planTask ? "bg-blue-500 text-white border-l-4 border-blue-600" : "bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600"
          )}
          onClick={planTask ? handleClick(planTask, 'plan') : undefined}
          onDoubleClick={planTask ? handleDoubleClick(planTask, 'plan') : undefined}
          title={planTask ? `計画: ${planTask.title}` : '計画なし'}
        >
          {planTask && (
            <div className={cn(
              "h-full px-2 py-1 flex overflow-hidden",
              isShort ? "flex-row items-center gap-1" : "flex-col"
            )}>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium truncate",
                  isVeryShort ? "text-xs" : "text-sm"
                )}>
                  {view === 'day' || !isVeryShort ? (
                    <>
                      <span className="text-xs opacity-90 mr-1">
                        {format(planTask.startTime, 'HH:mm')}
                      </span>
                      <span className="text-xs mr-1">📅</span>
                      {planTask.title}
                    </>
                  ) : (
                    <>
                      <span className="text-xs mr-1">📅</span>
                      {planTask.title}
                    </>
                  )}
                </div>
                
                {/* 時間範囲（十分なスペースがある場合のみ） */}
                {!isShort && view !== 'month' && (
                  <div className="text-xs opacity-90 mt-1">
                    {format(planTask.startTime, 'HH:mm')} - {format(planTask.endTime, 'HH:mm')}
                  </div>
                )}
              </div>
            </div>
          )}
          {!planTask && (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <span className="text-xs">計画なし</span>
            </div>
          )}
        </div>

        {/* 中央の分割線 */}
        <div className="w-2 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>

        {/* 右側: 実績タスク */}
        <div 
          className={cn(
            "flex-1 relative cursor-pointer",
            recordTask ? "bg-green-500 text-white border-r-4 border-green-600" : "bg-gray-100 dark:bg-gray-800 border-r-4 border-gray-300 dark:border-gray-600"
          )}
          onClick={recordTask ? handleClick(recordTask, 'record') : undefined}
          onDoubleClick={recordTask ? handleDoubleClick(recordTask, 'record') : undefined}
          title={recordTask ? `実績: ${recordTask.title}` : '実績なし'}
        >
          {recordTask && (
            <div className={cn(
              "h-full px-2 py-1 flex overflow-hidden",
              isShort ? "flex-row items-center gap-1" : "flex-col"
            )}>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium truncate",
                  isVeryShort ? "text-xs" : "text-sm"
                )}>
                  {view === 'day' || !isVeryShort ? (
                    <>
                      <span className="text-xs opacity-90 mr-1">
                        {format(recordTask.startTime, 'HH:mm')}
                      </span>
                      <span className="text-xs mr-1">✅</span>
                      {recordTask.title}
                    </>
                  ) : (
                    <>
                      <span className="text-xs mr-1">✅</span>
                      {recordTask.title}
                    </>
                  )}
                </div>
                
                {/* 時間範囲（十分なスペースがある場合のみ） */}
                {!isShort && view !== 'month' && (
                  <div className="text-xs opacity-90 mt-1">
                    {format(recordTask.startTime, 'HH:mm')} - {format(recordTask.endTime, 'HH:mm')}
                  </div>
                )}

                {/* 満足度表示 */}
                {!isShort && recordTask.satisfaction && (
                  <div className="text-xs opacity-80 mt-1 flex items-center gap-1">
                    <div className="flex">
                      {Array.from({ length: Math.min(recordTask.satisfaction, 3) }, (_, i) => (
                        <span key={i} className="text-yellow-300">⭐</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!recordTask && (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <span className="text-xs">実績なし</span>
            </div>
          )}
        </div>
      </div>

      {/* リサイズハンドル（デスクトップのみ） */}
      {view === 'day' && !isVeryShort && (
        <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors" />
      )}
    </div>
  )
}

// コンパクト版（月表示など用）
interface CompactSplitTaskProps {
  planTask?: CalendarTaskType
  recordTask?: CalendarTaskType
  onClick?: (task: CalendarTaskType, type: 'plan' | 'record') => void
}

export function CompactSplitTask({ planTask, recordTask, onClick }: CompactSplitTaskProps) {
  const referenceTask = planTask || recordTask
  if (!referenceTask) return null

  return (
    <div className="text-xs border rounded flex overflow-hidden max-w-full">
      {/* 左側: 計画 */}
      <div 
        className={cn(
          "flex-1 px-2 py-1 cursor-pointer truncate",
          planTask ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        )}
        onClick={planTask ? (e) => {
          e.stopPropagation()
          onClick?.(planTask, 'plan')
        } : undefined}
        title={planTask ? `計画: ${planTask.title} (${format(planTask.startTime, 'HH:mm')})` : '計画なし'}
      >
        {planTask ? (
          <>
            <span className="text-xs opacity-75 mr-1">
              {format(planTask.startTime, 'HH:mm')}
            </span>
            <span className="mr-1">📅</span>
            {planTask.title}
          </>
        ) : (
          <span>計画なし</span>
        )}
      </div>

      {/* 分割線 */}
      <div className="w-2 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>

      {/* 右側: 実績 */}
      <div 
        className={cn(
          "flex-1 px-2 py-1 cursor-pointer truncate",
          recordTask ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        )}
        onClick={recordTask ? (e) => {
          e.stopPropagation()
          onClick?.(recordTask, 'record')
        } : undefined}
        title={recordTask ? `実績: ${recordTask.title} (${format(recordTask.startTime, 'HH:mm')})` : '実績なし'}
      >
        {recordTask ? (
          <>
            <span className="text-xs opacity-75 mr-1">
              {format(recordTask.startTime, 'HH:mm')}
            </span>
            <span className="mr-1">✅</span>
            {recordTask.title}
          </>
        ) : (
          <span>実績なし</span>
        )}
      </div>
    </div>
  )
}