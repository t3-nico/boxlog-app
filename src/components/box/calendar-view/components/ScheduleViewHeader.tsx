'use client'

import React from 'react'
import { ArrowUp } from 'lucide-react'
import { CalendarTask } from '../utils/time-grid-helpers'

interface ScheduleViewHeaderProps {
  onTodayClick?: () => void
}

export function ScheduleViewHeader({
  onTodayClick
}: ScheduleViewHeaderProps) {
  const handleTodayClick = () => {
    onTodayClick?.()
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          スケジュール
        </h1>
        
        <button
          onClick={handleTodayClick}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowUp className="w-4 h-4" />
          <span>今日</span>
        </button>
      </div>
    </div>
  )
}

