'use client'

import { useState } from 'react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameMonth, isSameYear } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CalendarViewType } from './types'

interface CalendarHeaderProps {
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
}

const viewOptions = [
  { value: 'day' as CalendarViewType, label: '日' },
  { value: '3day' as CalendarViewType, label: '3日' },
  { value: 'week-no-weekend' as CalendarViewType, label: '平日' },
  { value: 'week' as CalendarViewType, label: '週' },
  { value: '2week' as CalendarViewType, label: '2週' },
  { value: 'schedule' as CalendarViewType, label: 'スケジュール' },
]

function formatHeaderDate(viewType: CalendarViewType, date: Date): string {
  switch (viewType) {
    case 'day':
      return format(date, 'yyyy年M月d日 (E)', { locale: ja })
    case '3day':
      const start3 = subDays(date, 1)
      const end3 = addDays(date, 1)
      return `${format(start3, 'M月d日')} – ${format(end3, 'd日')}`
    case 'week':
    case 'week-no-weekend':
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = viewType === 'week-no-weekend' 
        ? addDays(weekStart, 4)
        : endOfWeek(date, { weekStartsOn: 1 })
      
      if (isSameMonth(weekStart, weekEnd)) {
        return `${format(weekStart, 'yyyy年M月d日')} – ${format(weekEnd, 'd日')}`
      } else if (isSameYear(weekStart, weekEnd)) {
        return `${format(weekStart, 'M月d日')} – ${format(weekEnd, 'M月d日')}`
      } else {
        return `${format(weekStart, 'yyyy年M月d日')} – ${format(weekEnd, 'yyyy年M月d日')}`
      }
    case '2week':
      const twoWeekStart = startOfWeek(date, { weekStartsOn: 1 })
      const twoWeekEnd = addDays(twoWeekStart, 13)
      return `${format(twoWeekStart, 'M月d日')} – ${format(twoWeekEnd, 'M月d日')}`
    case 'schedule':
      return format(date, 'yyyy年M月', { locale: ja })
    default:
      return format(date, 'yyyy年M月')
  }
}

export function CalendarHeader({
  viewType,
  currentDate,
  onNavigate,
  onViewChange
}: CalendarHeaderProps) {
  const isToday = new Date().toDateString() === currentDate.toDateString()

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
      <div className="h-full flex items-center justify-between">
        {/* 左側: 空のスペース */}
        <div className="flex items-center">
          {/* 必要に応じて他の要素を追加 */}
        </div>
        
        {/* 中央: ナビゲーションと日付 */}
        <div className="flex items-center gap-4">
          {/* 今日ボタン */}
          <button
            onClick={() => onNavigate('today')}
            disabled={isToday}
            className={cn(
              "px-4 py-1.5 text-sm font-medium border rounded-md transition-colors",
              isToday
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600 border-gray-200 dark:border-gray-600"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            今日
          </button>
          
          {/* 前後ナビゲーション */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="前の期間"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="次の期間"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* 現在の日付（大きく表示） */}
          <h1 className="text-xl font-normal text-gray-900 dark:text-white">
            {formatHeaderDate(viewType, currentDate)}
          </h1>
        </div>
        
        {/* 右側: ビュー切り替え */}
        <div className="flex items-center">
          {/* ビュー切り替え（セグメント化されたボタン） */}
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
            {viewOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onViewChange(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewType === option.value
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}