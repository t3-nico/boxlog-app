'use client'

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { PureCalendarLayout } from '../../calendar-grid/PureCalendarLayout'
import { SimpleTestPopup } from '../../SimpleTestPopup'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { TimeAxisHeader } from '../../TimeAxisHeader'
import type { CalendarEvent } from '@/features/events'

interface TestDayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDeleteEvent?: (eventId: string) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventClick?: (event: CalendarEvent) => void
}

// Get week start (Monday)
const getWeekStart = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export function TestDayView({ 
  currentDate: initialCurrentDate, 
  events, 
  onDeleteEvent, 
  onCreateEvent, 
  onEmptyClick, 
  onEventClick 
}: TestDayViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  
  // Calendar settings for timezone display
  const { timezone, showUTCOffset } = useCalendarSettingsStore()
  
  // Step 18: Keyboard shortcut state
  const [showShortcuts, setShowShortcuts] = useState(false)
  
  // Step 11 & 17: View mode state
  const [viewMode, setViewMode] = useState<'day' | '3day' | 'week' | '2week'>('day')
  
  // View selector dropdown state
  const [showViewDropdown, setShowViewDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [currentDate, setCurrentDate] = useState(initialCurrentDate)
  
  // Update currentDate when props change
  useEffect(() => {
    setCurrentDate(initialCurrentDate)
  }, [initialCurrentDate])
  
  // Helper function to convert date to URL format
  const formatDateForUrl = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])
  
  // Function to update URL and navigate
  const updateUrlWithDate = useCallback((date: Date) => {
    const dateParam = formatDateForUrl(date)
    const currentView = pathname.split('/calendar/')[1]?.split('?')[0] || 'day'
    const newUrl = `/calendar/${currentView}?date=${dateParam}`
    router.push(newUrl)
  }, [router, pathname, formatDateForUrl])
  
  // Function to calculate week number
  const getWeekNumber = useCallback((date: Date) => {
    const yearStart = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - yearStart.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + yearStart.getDay() + 1) / 7)
  }, [])
  
  // Step 11 & 17: 表示する日付の配列を生成
  const displayDates = useMemo(() => {
    const normalized = new Date(currentDate)
    normalized.setHours(0, 0, 0, 0)

    switch (viewMode) {
      case 'day':
        return [normalized]
      
      case '3day': {
        // 今日を中心に3日（昨日、今日、明日）
        const dates = []
        for (let i = -1; i <= 1; i++) {
          const date = new Date(normalized)
          date.setDate(normalized.getDate() + i)
          dates.push(date)
        }
        return dates
      }
      
      case 'week': {
        // 週表示: 月曜日から日曜日までの7日間
        const weekStart = getWeekStart(normalized)
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart)
          date.setDate(weekStart.getDate() + i)
          date.setHours(0, 0, 0, 0)
          return date
        })
      }
      
      case '2week': {
        // 2週間表示: 月曜日から14日間
        const weekStart = getWeekStart(normalized)
        return Array.from({ length: 14 }, (_, i) => {
          const date = new Date(weekStart)
          date.setDate(weekStart.getDate() + i)
          date.setHours(0, 0, 0, 0)
          return date
        })
      }
      
      default:
        return [normalized]
    }
  }, [currentDate, viewMode])
  
  // 現在の月年と週番号を分けて生成（表示している期間に基づく）
  const getCurrentPeriodData = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    // 表示している日付の最初の日を基準にする
    const representativeDate = displayDates[0] || currentDate
    const month = monthNames[representativeDate.getMonth()]
    const year = representativeDate.getFullYear()
    const weekNumber = getWeekNumber(representativeDate)
    
    return {
      monthYear: `${month} ${year}`,
      week: `week${weekNumber}`
    }
  }, [displayDates, currentDate, getWeekNumber])

  // 正規化された日付を作成（後方互換性のため）
  const normalizedCurrentDate = displayDates[0]

  // 空き時間クリックハンドラー
  const handleCreateEvent = useCallback((date: Date, time: string) => {
    console.log('🎯 Creating event at:', { date: date.toDateString(), time })
    
    // 親コンポーネントのハンドラーがあれば呼び出す
    if (onEmptyClick) {
      onEmptyClick(date, time)
    } else if (onCreateEvent) {
      onCreateEvent(date, time)
    } else {
      // フォールバック: 古いSimpleTestPopupを使用
      setSelectedDate(date)
      setSelectedTime(time)
      setIsPopupOpen(true)
    }
  }, [onEmptyClick, onCreateEvent])

  // イベントクリックハンドラー
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('🖱️ Event clicked:', event.title)
    
    // 親コンポーネントのハンドラーがあれば呼び出す
    if (onEventClick) {
      onEventClick(event)
    } else {
      // フォールバック: 古いアラートを表示
      alert(`Event clicked: ${event.title} at ${event.startDate?.toLocaleTimeString()}`)
    }
  }, [onEventClick])

  // モックデータを削除してクリーンな状態に
  const testEvents = useMemo(() => {
    return [] as CalendarEvent[]
  }, [])

  // 実際のイベントとテストイベントをマージ
  const allEvents = useMemo(() => {
    return [...events, ...testEvents]
  }, [events, testEvents])

  // Step 11 & 17: ナビゲーション関数
  const getDaysToMove = useCallback(() => {
    switch (viewMode) {
      case 'day': return 1
      case '3day': return 3
      case 'week': return 7
      case '2week': return 14
      default: return 1
    }
  }, [viewMode])

  const navigatePrevious = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - getDaysToMove())
    updateUrlWithDate(newDate)
  }, [currentDate, getDaysToMove, updateUrlWithDate])

  const navigateNext = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + getDaysToMove())
    updateUrlWithDate(newDate)
  }, [currentDate, getDaysToMove, updateUrlWithDate])

  const navigateToday = useCallback(() => {
    const today = new Date()
    updateUrlWithDate(today)
  }, [updateUrlWithDate])

  // Get display name for view mode
  const getViewDisplayName = (mode: 'day' | '3day' | 'week' | '2week') => {
    switch (mode) {
      case 'day': return 'Day'
      case '3day': return '3 Days'
      case 'week': return 'Week'
      case '2week': return '2 Weeks'
      default: return 'Day'
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowViewDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Step 18: グローバルキーボードイベント
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ショートカット一覧表示
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
        return
      }
      
      // 入力中は無効
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // ESC: モーダルを閉じる
      if (e.key === 'Escape') {
        setShowShortcuts(false)
        return
      }
      
      // ビュー切り替え（修飾キーなし）
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            setViewMode('3day')
            break
          case 'w':
            e.preventDefault()
            setViewMode('week')
            break
          case '2':
            e.preventDefault()
            setViewMode('2week')
            break
          case '1':
            e.preventDefault()
            setViewMode('day')
            break
          case 't':
            e.preventDefault()
            navigateToday()
            break
        }
      }
      
      // ナビゲーション（矢印キー）
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            navigatePrevious()
            break
          case 'ArrowRight':
            e.preventDefault()
            navigateNext()
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigatePrevious, navigateNext, navigateToday])

  return (
    <div className="h-full w-full max-w-screen-xl mx-auto overflow-hidden flex flex-col bg-background">
      {/* 第1層: ナビゲーション - 高さ固定 */}
      <div className="flex-shrink-0 bg-background">
        {/* Navigation */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <button
              onClick={navigateToday}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={navigateNext}
              className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Current month and week number display */}
            <div className="ml-4 flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-300 font-bold" style={{ fontSize: '20px' }}>
                {getCurrentPeriodData.monthYear}
              </span>
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                {getCurrentPeriodData.week}
              </span>
            </div>
          </div>

          {/* Step 17: View selector dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-sm font-medium"
              >
                {getViewDisplayName(viewMode)}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showViewDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg py-1 z-50 min-w-[120px]">
                  <button
                    onClick={() => {
                      setViewMode('day')
                      setShowViewDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Day
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('3day')
                      setShowViewDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    3 Days
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('week')
                      setShowViewDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Week
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('2week')
                      setShowViewDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    2 Weeks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 第2層: 日付ヘッダー - 高さ固定 */}
        <div className="flex-shrink-0 overflow-y-scroll">
          <div className="flex">
            <div className="w-16 flex-shrink-0 flex items-end justify-center pb-1">
              {/* UTC display in date header area */}
              {showUTCOffset && (
                <TimeAxisHeader timezone={timezone} />
              )}
            </div>
            <div className="flex flex-1">
                {displayDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  const dayOfWeek = date.getDay()
                  const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Make Monday 0
                  
                  return (
                    <div 
                      key={date.toISOString()} 
                      className="flex-1 text-center py-2"
                    >
                      <div className={`text-xs ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {viewMode === '2week' ? weekdays[adjustedIndex].charAt(0) : weekdays[adjustedIndex]}
                      </div>
                      <div className={`text-sm font-semibold ${isToday ? 'text-white bg-blue-500 dark:bg-blue-600 rounded-full' : ''} flex items-center justify-center mx-auto mt-1`}
                      style={{
                        width: isToday ? '28px' : '20px',
                        height: isToday ? '28px' : '20px'
                      }}>
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
      </div>
      
      {/* 第3層: グリッドエリア - 残り高さ全部、スクロール制御 */}
      <div className="flex-1 overflow-hidden">
        <PureCalendarLayout
          dates={displayDates}
          events={allEvents}
          onCreateEvent={handleCreateEvent}
          onEventClick={handleEventClick}
          onDeleteEvent={onDeleteEvent}
        />
      </div>
      
      {/* シンプルテストポップアップ */}
      <SimpleTestPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        date={selectedDate}
        time={selectedTime}
      />

      {/* Step 18: キーボードショートカット一覧モーダル */}
      {showShortcuts && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowShortcuts(false)}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-6 max-w-2xl w-full mx-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ビュー切り替え */}
              <div className="text-sm">
                <div className="font-medium mb-3 text-gray-900 dark:text-white">View Switching</div>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Day view</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">1</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3-day view</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">D</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Week view</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">W</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2-week view</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">2</kbd>
                  </div>
                </div>
              </div>
              
              {/* ナビゲーション */}
              <div className="text-sm">
                <div className="font-medium mb-3 text-gray-900 dark:text-white">Navigation</div>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Previous</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">←</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">→</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Go to today</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">T</kbd>
                  </div>
                </div>
              </div>

              {/* 予定の操作 */}
              <div className="text-sm">
                <div className="font-medium mb-3 text-gray-900 dark:text-white">Event Operations</div>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Delete selected event</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Delete</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Copy selected event</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+C</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Paste copied event</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+V</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Double-click event to edit</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Mouse</span>
                  </div>
                </div>
              </div>
              
              {/* その他 */}
              <div className="text-sm">
                <div className="font-medium mb-3 text-gray-900 dark:text-white">Other</div>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Show this help</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">?</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Close/Cancel</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ESC</kbd>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                💡 Keyboard shortcuts are disabled while editing in input fields
              </p>
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}