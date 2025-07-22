'use client'

import { useMemo } from 'react'
import { addMinutes, differenceInMinutes } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task, TaskRecord } from '../types'

interface DifferenceIndicatorProps {
  tasks: Task[]
  records: TaskRecord[]
  className?: string
}

const MINUTE_HEIGHT = 1.5 // 1分あたりのピクセル高さ

export function DifferenceIndicator({ tasks, records, className }: DifferenceIndicatorProps) {
  const differences = useMemo(() => {
    return tasks.map(task => {
      const record = records.find(r => r.task_id === task.id)
      if (!record) return null
      
      const plannedStart = new Date(task.planned_start!)
      const actualStart = new Date(record.actual_start)
      const plannedEnd = addMinutes(plannedStart, task.planned_duration || 60)
      const actualEnd = new Date(record.actual_end)
      
      const startDiff = differenceInMinutes(actualStart, plannedStart)
      const durationDiff = record.actual_duration - (task.planned_duration || 60)
      
      // 位置計算（時間を分に変換してピクセル位置に）
      const plannedStartMinutes = plannedStart.getHours() * 60 + plannedStart.getMinutes()
      const actualStartMinutes = actualStart.getHours() * 60 + actualStart.getMinutes()
      
      return {
        taskId: task.id,
        startDiff,
        durationDiff,
        position: {
          plannedTop: plannedStartMinutes * MINUTE_HEIGHT,
          actualTop: actualStartMinutes * MINUTE_HEIGHT,
          height: Math.abs(startDiff) * MINUTE_HEIGHT
        },
        severity: Math.abs(startDiff) > 30 ? 'high' : Math.abs(startDiff) > 15 ? 'medium' : 'low'
      }
    }).filter(Boolean)
  }, [tasks, records])
  
  return (
    <div className={cn("w-16 relative bg-gray-50 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700", className)}>
      {/* 背景グリッド */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 24 }, (_, hour) => (
          <div
            key={hour}
            className="border-t border-gray-300 dark:border-gray-600"
            style={{ top: hour * 60 * MINUTE_HEIGHT }}
          />
        ))}
      </div>
      
      {/* 差異表示 */}
      {differences.map(diff => {
        if (!diff || diff.startDiff === 0) return null
        
        const isDelayed = diff.startDiff > 0
        const connectionHeight = Math.abs(diff.position.actualTop - diff.position.plannedTop)
        
        return (
          <div
            key={diff.taskId}
            className="absolute"
            style={{ 
              top: Math.min(diff.position.plannedTop, diff.position.actualTop),
              left: 0,
              right: 0,
              height: Math.max(connectionHeight, 20)
            }}
          >
            {/* 接続線 */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 64 ${Math.max(connectionHeight, 20)}`}
              preserveAspectRatio="none"
            >
              <path
                d={`
                  M 8 ${diff.position.plannedTop === Math.min(diff.position.plannedTop, diff.position.actualTop) ? 0 : connectionHeight}
                  Q 32 ${connectionHeight / 2} 
                    56 ${diff.position.actualTop === Math.min(diff.position.plannedTop, diff.position.actualTop) ? 0 : connectionHeight}
                `}
                stroke={
                  diff.severity === 'high' 
                    ? (isDelayed ? '#dc2626' : '#2563eb')
                    : diff.severity === 'medium'
                    ? (isDelayed ? '#ea580c' : '#0284c7') 
                    : (isDelayed ? '#eab308' : '#0891b2')
                }
                strokeWidth={diff.severity === 'high' ? '3' : '2'}
                fill="none"
                strokeDasharray={diff.durationDiff !== 0 ? "4,4" : ""}
                opacity={0.8}
              />
            </svg>
            
            {/* 差異情報 */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                top: connectionHeight / 2,
              }}
            >
              <div className={cn(
                "text-xs font-bold px-1 py-1 rounded shadow-sm text-center min-w-[32px]",
                diff.severity === 'high' 
                  ? (isDelayed 
                    ? "bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200" 
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200")
                  : diff.severity === 'medium'
                  ? (isDelayed 
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/80 dark:text-orange-200" 
                    : "bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200")
                  : (isDelayed 
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200" 
                    : "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/80 dark:text-cyan-200")
              )}>
                {diff.startDiff > 0 ? '+' : ''}{diff.startDiff}m
              </div>
              
              {/* 時間の長さ差異 */}
              {diff.durationDiff !== 0 && (
                <div className={cn(
                  "text-xs font-medium px-1 mt-1 rounded",
                  diff.durationDiff > 0 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-200"
                    : "bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-200"
                )}>
                  {diff.durationDiff > 0 ? '+' : ''}{diff.durationDiff}m
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {/* 予定外の記録表示 */}
      {records
        .filter(record => !record.task_id)
        .map(record => {
          const startMinutes = new Date(record.actual_start).getHours() * 60 + 
                              new Date(record.actual_start).getMinutes()
          
          return (
            <div
              key={record.id}
              className="absolute left-2 right-2"
              style={{ 
                top: startMinutes * MINUTE_HEIGHT,
                height: record.actual_duration * MINUTE_HEIGHT
              }}
            >
              <div className="h-full bg-orange-400 dark:bg-orange-500 rounded opacity-60 flex items-center justify-center">
                <span className="text-xs font-bold text-white">+</span>
              </div>
            </div>
          )
        })}
      
      {/* 凡例（下部） */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">差異</div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-red-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">遅延</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-blue-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">早期</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-orange-400"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">予定外</span>
          </div>
        </div>
      </div>
    </div>
  )
}