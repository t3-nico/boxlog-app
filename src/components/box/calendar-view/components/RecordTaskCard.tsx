'use client'

import { differenceInMinutes } from 'date-fns'
import { Star, Eye, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskRecord, Task } from '../types'

interface RecordTaskCardProps {
  record: TaskRecord
  originalTask?: Task
  onClick?: () => void
  className?: string
}

export function RecordTaskCard({ 
  record, 
  originalTask, 
  onClick,
  className 
}: RecordTaskCardProps) {
  const timeDiff = originalTask ? 
    differenceInMinutes(
      new Date(record.actual_start), 
      new Date(originalTask.planned_start!)
    ) : null
  
  const durationDiff = originalTask ?
    record.actual_duration - (originalTask.planned_duration || 60) : null
  
  const isUnplanned = !originalTask
  const isDelayed = timeDiff !== null && timeDiff > 0
  const isEarly = timeDiff !== null && timeDiff < 0
  const isOvertime = durationDiff !== null && durationDiff > 0
  const isUndertime = durationDiff !== null && durationDiff < 0
  
  return (
    <div 
      className={cn(
        "relative rounded-md border-l-4 overflow-hidden cursor-pointer transition-all hover:shadow-md",
        "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
        isUnplanned && "border-orange-500 bg-orange-50 dark:bg-orange-900/20",
        !isUnplanned && "border-green-500 bg-green-50 dark:bg-green-900/20",
        className
      )}
      onClick={onClick}
    >
      <div className="px-3 py-2">
        {/* タイトルと時間差異 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
            {record.title}
          </span>
          
          {/* 時間差異バッジ */}
          <div className="flex flex-col gap-1">
            {timeDiff !== null && timeDiff !== 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                isDelayed 
                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" 
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
              )}>
                {timeDiff > 0 ? '+' : ''}{timeDiff}分
              </span>
            )}
            
            {durationDiff !== null && durationDiff !== 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                isOvertime 
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" 
                  : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
              )}>
                {durationDiff > 0 ? '+' : ''}{durationDiff}分
              </span>
            )}
          </div>
        </div>
        
        {/* 記録の詳細情報 */}
        <div className="flex items-center justify-between">
          {/* 評価指標 */}
          <div className="flex items-center gap-3">
            {/* 満足度 */}
            {record.satisfaction && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < record.satisfaction!
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* 集中度 */}
            {record.focus_level && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  {record.focus_level}
                </span>
              </div>
            )}
            
            {/* エネルギーレベル */}
            {record.energy_level && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {record.energy_level}
                </span>
              </div>
            )}
          </div>
          
          {/* 中断回数 */}
          {record.interruptions !== undefined && record.interruptions > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded font-medium">
              中断{record.interruptions}回
            </span>
          )}
        </div>
        
        {/* 予定外タスクの表示 */}
        {isUnplanned && (
          <div className="mt-1">
            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded font-medium">
              予定外
            </span>
          </div>
        )}
        
        {/* 実行時間 */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {record.actual_duration}分
          {originalTask && (
            <span className="ml-2">
              (予定: {originalTask.planned_duration || 60}分)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}