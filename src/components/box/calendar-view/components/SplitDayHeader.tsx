'use client'

import React, { useMemo } from 'react'
import { format, isToday, isYesterday, isTomorrow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import type { Task, TaskRecord } from '../types'

interface SplitDayHeaderProps {
  date: Date
  tasks: Task[]
  records: TaskRecord[]
}

export function SplitDayHeader({ date, tasks, records }: SplitDayHeaderProps) {
  // 日付情報の計算
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
    } else {
      displayName = format(date, 'M月d日(E)', { locale: ja })
      dateText = format(date, 'yyyy年', { locale: ja })
    }
    
    return {
      displayName,
      dateText,
      isToday: today,
      isYesterday: yesterday,
      isTomorrow: tomorrow
    }
  }, [date])

  // 基本的な統計のみ
  const basicStats = useMemo(() => {
    const totalTasks = tasks.length
    const totalRecords = records.length
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      totalTasks,
      totalRecords,
      completionRate
    }
  }, [tasks, records])

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
      {/* シンプルなヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className={`w-6 h-6 ${
            dateInfo.isToday ? 'text-neutral-600 dark:text-neutral-400' : 'text-gray-500 dark:text-gray-400'
          }`} />
          <div>
            <h1 className={`text-2xl font-bold ${
              dateInfo.isToday ? 'text-neutral-700 dark:text-neutral-300' : 'text-gray-900 dark:text-white'
            }`}>
              {dateInfo.displayName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dateInfo.dateText}
            </p>
          </div>
        </div>
        
        {/* 基本統計のみ */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {basicStats.totalTasks}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">予定</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {basicStats.totalRecords}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">記録</div>
          </div>
          {basicStats.totalTasks > 0 && (
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {basicStats.completionRate}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">達成率</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}