'use client'

import { format } from 'date-fns'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { Task } from '../types'

interface PlanTaskCardProps {
  task: Task
  isDragging?: boolean
  hasRecord?: boolean
  onClick?: () => void
  className?: string
}

export function PlanTaskCard({ 
  task, 
  isDragging = false, 
  hasRecord = false,
  onClick,
  className 
}: PlanTaskCardProps) {
  const priorityColors = {
    low: 'border-gray-400 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    medium: 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    high: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
  }
  
  const statusColors = {
    pending: 'border-l-gray-400',
    in_progress: 'border-l-yellow-400',
    completed: 'border-l-green-400'
  }
  
  return (
    <div 
      className={cn(
        "relative rounded-md border-l-4 overflow-hidden cursor-pointer transition-all",
        "hover:shadow-md hover:scale-[1.02]",
        priorityColors[task.priority],
        statusColors[task.status],
        hasRecord && "opacity-60 bg-gray-100 dark:bg-gray-700",
        isDragging && "rotate-2 shadow-lg scale-105 z-50",
        className
      )}
      onClick={onClick}
    >
      <div className="px-3 py-2">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-medium truncate flex-1">
            {task.title}
          </span>
          
          <div className="flex items-center gap-1">
            {/* 完了済みアイコン */}
            {hasRecord && (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            )}
            
            {/* 優先度バッジ */}
            {task.priority === 'high' && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded font-medium">
                高
              </span>
            )}
          </div>
        </div>
        
        {/* 時間情報 */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>
              {task.planned_start ? format(new Date(task.planned_start), 'HH:mm') : '--:--'}
            </span>
          </div>
          
          <div>
            {task.planned_duration ? `${task.planned_duration}分` : '時間未設定'}
          </div>
          
          {task.planned_end && (
            <div>
              〜{format(new Date(task.planned_end), 'HH:mm')}
            </div>
          )}
        </div>
        
        {/* タグ */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* 説明（省略形） */}
        {task.description && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            {task.description}
          </div>
        )}
        
        {/* ドラッグヒント */}
        {!hasRecord && !isDragging && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 transition-colors rounded-md flex items-center justify-center opacity-0 hover:opacity-100">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
              記録へドラッグ
            </span>
          </div>
        )}
        
        {/* 完了済み表示 */}
        {hasRecord && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
}