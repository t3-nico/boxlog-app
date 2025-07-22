'use client'

import React, { useMemo } from 'react'
import { 
  Star,
  Eye,
  Zap,
  Clock,
  AlertTriangle
} from 'lucide-react'
import type { Task, TaskRecord } from '../types'

interface DayStatsAnalysisProps {
  tasks: Task[]
  records: TaskRecord[]
}

export function DayStatsAnalysis({ tasks, records }: DayStatsAnalysisProps) {
  // タスク統計の計算
  const taskStats = useMemo(() => {
    const totalPlanned = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
    const pendingTasks = tasks.filter(task => task.status === 'pending').length
    
    const totalPlannedTime = tasks.reduce((sum, task) => sum + (task.planned_duration || 0), 0)
    const completionRate = totalPlanned > 0 ? Math.round((completedTasks / totalPlanned) * 100) : 0
    
    return {
      totalPlanned,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalPlannedTime,
      completionRate
    }
  }, [tasks])

  // 記録統計の計算
  const recordStats = useMemo(() => {
    const totalRecords = records.length
    const totalActualTime = records.reduce((sum, record) => sum + (record.actual_duration || 0), 0)
    
    const avgSatisfaction = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.satisfaction || 0), 0) / records.length 
      : 0
    
    const avgFocus = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.focus_level || 0), 0) / records.length 
      : 0
    
    const avgEnergy = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.energy_level || 0), 0) / records.length 
      : 0
    
    const totalInterruptions = records.reduce((sum, r) => sum + (r.interruptions || 0), 0)
    
    return {
      totalRecords,
      totalActualTime,
      avgSatisfaction,
      avgFocus,
      avgEnergy,
      totalInterruptions
    }
  }, [records])

  // 時間を "Xh Ym" 形式でフォーマット
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0分'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分`
    if (mins === 0) return `${hours}時間`
    return `${hours}時間${mins}分`
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 左側：予定統計 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">予定統計</h3>
        </div>
        
        <div className="space-y-3">
          {/* タスク状況 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">完了済み</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {taskStats.completedTasks} / {taskStats.totalPlanned}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">進行中</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {taskStats.inProgressTasks}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">未着手</span>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              {taskStats.pendingTasks}
            </span>
          </div>
          
          {/* 予定時間 */}
          <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" data-slot="icon" />
                <span className="text-sm text-gray-600 dark:text-gray-400">予定時間</span>
              </div>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatDuration(taskStats.totalPlannedTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右側：実績統計 */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-green-900 dark:text-green-100">実績統計</h3>
        </div>
        
        <div className="space-y-3">
          {/* 実績時間 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" data-slot="icon" />
              <span className="text-sm text-gray-600 dark:text-gray-400">実績時間</span>
            </div>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatDuration(recordStats.totalActualTime)}
            </span>
          </div>
          
          {/* 評価指標 */}
          {recordStats.totalRecords > 0 && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" data-slot="icon" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">満足度</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {recordStats.avgSatisfaction.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= recordStats.avgSatisfaction 
                            ? 'text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        data-slot="icon"
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-blue-500" data-slot="icon" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">集中度</span>
                </div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {recordStats.avgFocus.toFixed(1)} / 5
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-500" data-slot="icon" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">エネルギー</span>
                </div>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {recordStats.avgEnergy.toFixed(1)} / 5
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" data-slot="icon" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">中断回数</span>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {recordStats.totalInterruptions} 回
                </span>
              </div>
            </>
          )}
          
          {recordStats.totalRecords === 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
              記録がありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}