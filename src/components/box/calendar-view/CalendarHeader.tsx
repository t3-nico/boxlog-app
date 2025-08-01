'use client'

import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Columns3,
  ClipboardList,
  CheckCircle
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
  // すべてのビューで統一した「July 2025 week30」形式
  const weekNumber = getWeek(date, { weekStartsOn: 1 })
  return `${format(date, 'MMMM yyyy')}|week${weekNumber}`
}

export function CalendarHeader({
  viewType,
  currentDate,
  onNavigate,
  onViewChange
}: CalendarHeaderProps) {
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false)
  const isToday = new Date().toDateString() === currentDate.toDateString()
  
  const { planRecordMode, updateSettings } = useCalendarSettingsStore()
  const currentViewOption = viewOptions.find(option => option.value === viewType)

  return (
    <header className="relative h-16 bg-background px-4">
      <div className="h-full flex items-center justify-between">
        {/* 左側: ナビゲーションコントロールと日付 */}
        <div className="flex items-center gap-4">
          {/* 今日ボタン */}
          <button
            onClick={() => onNavigate('today')}
            className="px-4 py-2 text-sm font-medium border rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Today
          </button>
          
          {/* 前後ナビゲーション */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-1 hover:bg-accent/50 rounded-full transition-colors"
              title="Previous period"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-1 hover:bg-accent/50 rounded-full transition-colors"
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
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-secondary text-secondary-foreground bg-transparent">
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
        
        {/* 右側: 表示モードとビュー切り替えドロップダウン */}
        <div className="flex items-center gap-3">
          {/* 表示モード切り替え（両方/予定/記録） - セグメントコントロール */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => updateSettings({ planRecordMode: 'both' })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                planRecordMode === 'both'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50'
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
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50'
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
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50'
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-accent border border-border rounded-lg hover:bg-accent/80 transition-colors shadow-sm"
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
                <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {viewOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onViewChange(option.value)
                          setIsViewDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-accent/50 transition-colors",
                          viewType === option.value 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground'
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