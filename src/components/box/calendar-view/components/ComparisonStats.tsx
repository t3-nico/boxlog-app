'use client'

import { useMemo } from 'react'
import { differenceInMinutes } from 'date-fns'
import type { Task, TaskRecord } from '../types'

interface ComparisonStatsProps {
  tasks: Task[]
  records: TaskRecord[]
}

export function ComparisonStats({ tasks, records }: ComparisonStatsProps) {
  const stats = useMemo(() => {
    const plannedMinutes = tasks.reduce((sum, task) => 
      sum + (task.planned_duration || 60), 0
    )
    
    const actualMinutes = records.reduce((sum, record) => 
      sum + record.actual_duration, 0
    )
    
    const completedTasks = records.filter(r => r.task_id).length
    const completionRate = tasks.length > 0
      ? (completedTasks / tasks.length) * 100
      : 0
    
    const satisfactionRecords = records.filter(r => r.satisfaction)
    const avgSatisfaction = satisfactionRecords.length > 0
      ? satisfactionRecords.reduce((sum, r) => sum + (r.satisfaction || 0), 0) / satisfactionRecords.length
      : 0
    
    const unplannedTasks = records.filter(r => !r.task_id).length
    
    return {
      plannedHours: plannedMinutes / 60,
      actualHours: actualMinutes / 60,
      completionRate,
      avgSatisfaction,
      unplannedTasks
    }
  }, [tasks, records])
  
  return (
    <div className="mt-3 grid grid-cols-5 gap-4 text-sm">
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">予定時間</div>
        <div className="font-semibold text-blue-600 dark:text-blue-400">
          {stats.plannedHours.toFixed(1)}h
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">実績時間</div>
        <div className="font-semibold text-green-600 dark:text-green-400">
          {stats.actualHours.toFixed(1)}h
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">達成率</div>
        <div className={`font-semibold ${
          stats.completionRate >= 80 
            ? 'text-green-600 dark:text-green-400' 
            : stats.completionRate >= 60 
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {stats.completionRate.toFixed(0)}%
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">満足度</div>
        <div className="font-semibold text-purple-600 dark:text-purple-400">
          {stats.avgSatisfaction > 0 ? (
            <span className="flex items-center justify-center gap-1">
              {stats.avgSatisfaction.toFixed(1)}
              <span className="text-yellow-500">★</span>
            </span>
          ) : '-'}
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">予定外</div>
        <div className="font-semibold text-orange-600 dark:text-orange-400">
          {stats.unplannedTasks}件
        </div>
      </div>
    </div>
  )
}