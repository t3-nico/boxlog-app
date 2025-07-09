'use client'

import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarTask } from '../utils/time-grid-helpers'
import { cn } from '@/lib/utils'

interface TaskDragLayerProps {
  activeId: string | null
  dragOffset: { x: number; y: number }
  tasks: CalendarTask[]
}

export function TaskDragLayer({ activeId, dragOffset, tasks }: TaskDragLayerProps) {
  const activeTask = tasks.find(task => task.id === activeId)
  
  if (!activeId || !activeTask) return null
  
  return (
    <DragOverlay>
      <div
        className={cn(
          "p-3 rounded-lg shadow-lg opacity-90 cursor-grabbing",
          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
          "transform-gpu transition-transform duration-150"
        )}
        style={{
          width: '200px',
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          zIndex: 1000
        }}
      >
        <div className="space-y-2">
          {/* タスクタイトル */}
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activeTask.title}
          </div>
          
          {/* 時間情報 */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                {format(activeTask.startTime, 'HH:mm', { locale: ja })}
              </span>
            </div>
            <span>-</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>
                {format(activeTask.endTime, 'HH:mm', { locale: ja })}
              </span>
            </div>
          </div>
          
          {/* 期間 */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round((activeTask.endTime.getTime() - activeTask.startTime.getTime()) / 60000)}分
          </div>
          
          {/* 説明（短縮） */}
          {activeTask.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {activeTask.description}
            </div>
          )}
          
          {/* ドラッグ中のインジケーター */}
          <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              <span className="ml-1">移動中...</span>
            </div>
          </div>
        </div>
      </div>
    </DragOverlay>
  )
}

// 個別のタスクプレビューコンポーネント
interface TaskPreviewProps {
  task: CalendarTask
  isDragging?: boolean
}

export function TaskPreview({ task, isDragging = false }: TaskPreviewProps) {
  return (
    <div
      className={cn(
        "p-2 rounded-md shadow-sm border transition-all duration-150",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        isDragging && "opacity-50 transform scale-95",
        "hover:shadow-md hover:scale-105"
      )}
    >
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {task.title}
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {format(task.startTime, 'HH:mm', { locale: ja })} - {format(task.endTime, 'HH:mm', { locale: ja })}
        </div>
        
        {task.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {task.description}
          </div>
        )}
      </div>
    </div>
  )
}

// ドラッグ可能なタスクアイテムのヘルパー
interface DraggableTaskPreviewProps {
  task: CalendarTask
  isActive: boolean
  isDragging: boolean
  listeners: any
  attributes: any
}

export function DraggableTaskPreview({
  task,
  isActive,
  isDragging,
  listeners,
  attributes
}: DraggableTaskPreviewProps) {
  return (
    <div
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isActive && "z-10"
      )}
      {...attributes}
      {...listeners}
    >
      <TaskPreview task={task} isDragging={isDragging} />
    </div>
  )
}