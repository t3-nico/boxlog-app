'use client'

import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Columns3,
  ClipboardList,
  CheckCircle,
  Plus
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameMonth, isSameYear, getWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import type { CalendarViewType } from './types'

interface CalendarHeaderProps {
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
  onCreateEvent?: () => void
}

const viewOptions = [
  { value: 'day' as CalendarViewType, label: 'Day' },
  { value: '3day' as CalendarViewType, label: '3 Days' },
  { value: 'week-no-weekend' as CalendarViewType, label: 'Weekdays' },
  { value: 'week' as CalendarViewType, label: 'Week' },
  { value: '2week' as CalendarViewType, label: '2 Weeks' },
  { value: 'schedule' as CalendarViewType, label: 'Event' },
]

const displayModeOptions = [
  { value: 'both', label: 'Both', icon: Columns3 },
  { value: 'plan', label: 'Event', icon: ClipboardList },
  { value: 'record', label: 'Record', icon: CheckCircle },
] as const

function formatHeaderDate(viewType: CalendarViewType, date: Date): string {
  switch (viewType) {
    case 'day':
      const weekNumber = getWeek(date, { weekStartsOn: 1 })
      return `${format(date, 'MMMM yyyy')}|week${weekNumber}`
    case '3day':
      const start3 = subDays(date, 1)
      const end3 = addDays(date, 1)
      return `${format(start3, 'MMM d')} – ${format(end3, 'MMM d, yyyy')}`
    case 'week':
    case 'week-no-weekend':
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = viewType === 'week-no-weekend' 
        ? addDays(weekStart, 4)
        : endOfWeek(date, { weekStartsOn: 1 })
      
      if (isSameMonth(weekStart, weekEnd)) {
        return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'd, yyyy')}`
      } else if (isSameYear(weekStart, weekEnd)) {
        return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
      } else {
        return `${format(weekStart, 'MMM d, yyyy')} – ${format(weekEnd, 'MMM d, yyyy')}`
      }
    case '2week':
      const twoWeekStart = startOfWeek(date, { weekStartsOn: 1 })
      const twoWeekEnd = addDays(twoWeekStart, 13)
      return `${format(twoWeekStart, 'MMM d')} – ${format(twoWeekEnd, 'MMM d, yyyy')}`
    case 'schedule':
      const scheduleWeekStart = startOfWeek(date, { weekStartsOn: 1 })
      const scheduleWeekEnd = endOfWeek(date, { weekStartsOn: 1 })
      
      if (isSameMonth(scheduleWeekStart, scheduleWeekEnd)) {
        return `${format(scheduleWeekStart, 'MMM d')} – ${format(scheduleWeekEnd, 'd, yyyy')}`
      } else if (isSameYear(scheduleWeekStart, scheduleWeekEnd)) {
        return `${format(scheduleWeekStart, 'MMM d')} – ${format(scheduleWeekEnd, 'MMM d, yyyy')}`
      } else {
        return `${format(scheduleWeekStart, 'MMM d, yyyy')} – ${format(scheduleWeekEnd, 'MMM d, yyyy')}`
      }
    default:
      return format(date, 'MMMM yyyy')
  }
}

export function CalendarHeader({
  viewType,
  currentDate,
  onNavigate,
  onViewChange,
  onCreateEvent
}: CalendarHeaderProps) {
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false)
  const isToday = new Date().toDateString() === currentDate.toDateString()
  
  const { planRecordMode, updateSettings } = useCalendarSettingsStore()
  const currentViewOption = viewOptions.find(option => option.value === viewType)

  return (
    <header className="relative h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
      <div className="h-full flex items-center justify-between">
        {/* 左側: ナビゲーションコントロールと日付 */}
        <div className="flex items-center gap-4">
          {/* 今日ボタン */}
          <button
            onClick={() => onNavigate('today')}
            disabled={isToday}
            className={cn(
              "px-4 py-2 text-sm font-medium border rounded-md transition-colors",
              isToday
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600 border-gray-200 dark:border-gray-600"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            Today
          </button>
          
          {/* 前後ナビゲーション */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Previous period"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Next period"
            >
              <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* 現在の日付（左寄せ） */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {(() => {
                const fullDate = formatHeaderDate(viewType, currentDate)
                if (fullDate.includes('|week')) {
                  const [monthYear, weekPart] = fullDate.split('|')
                  return (
                    <>
                      {monthYear}
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {weekPart}
                      </span>
                    </>
                  )
                }
                return fullDate
              })()}
            </h1>
          </div>
        </div>
        
        {/* 右側: 新規イベント作成、表示モードとビュー切り替えドロップダウン */}
        <div className="flex items-center gap-3">
          {/* 新規イベント作成ボタン */}
          {onCreateEvent && (
            <button
              onClick={onCreateEvent}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>新規イベント</span>
            </button>
          )}
          {/* 表示モード切り替え（両方/予定/記録） - セグメントコントロール */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => updateSettings({ planRecordMode: 'both' })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                planRecordMode === 'both'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              )}
            >
              <Columns3 className="w-4 h-4" />
              <span>Both</span>
            </button>
            <button
              onClick={() => updateSettings({ planRecordMode: 'plan' })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                planRecordMode === 'plan'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              )}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Event</span>
            </button>
            <button
              onClick={() => updateSettings({ planRecordMode: 'record' })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                planRecordMode === 'record'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              )}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record</span>
            </button>
          </div>
          
          {/* ビュー切り替えドロップダウン */}
          <div className="relative">
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors shadow-sm"
            >
              <span>{currentViewOption?.label || 'View'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isViewDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsViewDropdownOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {viewOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onViewChange(option.value)
                          setIsViewDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                          viewType === option.value 
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}