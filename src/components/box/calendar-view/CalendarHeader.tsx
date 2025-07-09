'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { formatDateRange } from './utils/calendar-helpers'
import { ViewSelector } from './ViewSelector'
import type { CalendarHeaderProps } from './types'

export function CalendarHeader({
  viewType,
  currentDate,
  onNavigate,
  onViewChange
}: CalendarHeaderProps) {
  const dateRangeText = formatDateRange(viewType, currentDate)
  const isToday = new Date().toDateString() === currentDate.toDateString()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="前の期間"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={() => onNavigate('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="次の期間"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={() => onNavigate('today')}
          disabled={isToday}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isToday
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
          }`}
        >
          今日
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-4">
          {dateRangeText}
        </h2>
      </div>

      {/* Right: View Selector */}
      <ViewSelector value={viewType} onChange={onViewChange} />
    </div>
  )
}