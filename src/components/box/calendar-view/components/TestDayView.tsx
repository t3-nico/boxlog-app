'use client'

import React, { useMemo, useCallback, useState } from 'react'
import { PureCalendarLayout } from './PureCalendarLayout'
import { SimpleTestPopup } from './SimpleTestPopup'
import type { CalendarEvent } from '@/types/events'

interface TestDayViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

// 週の開始日（月曜日）を取得
const getWeekStart = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export function TestDayView({ currentDate: initialCurrentDate, events }: TestDayViewProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  
  // Step 11: 週表示用のstate
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')
  const [currentDate, setCurrentDate] = useState(initialCurrentDate)
  
  // Step 11: 表示する日付の配列を生成
  const displayDates = useMemo(() => {
    if (viewMode === 'day') {
      const normalized = new Date(currentDate)
      normalized.setHours(0, 0, 0, 0)
      return [normalized]
    } else {
      // 週表示: 月曜日から日曜日までの7日間
      const weekStart = getWeekStart(currentDate)
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        date.setHours(0, 0, 0, 0)
        return date
      })
    }
  }, [currentDate, viewMode])

  // 正規化された日付を作成（後方互換性のため）
  const normalizedCurrentDate = displayDates[0]

  // 空き時間クリックハンドラー
  const handleCreateEvent = useCallback((date: Date, time: string) => {
    console.log('🎯 Creating event at:', { date: date.toDateString(), time })
    
    setSelectedDate(date)
    setSelectedTime(time)
    setIsPopupOpen(true)
  }, [])

  // イベントクリックハンドラー
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('🖱️ Event clicked:', event.title)
    alert(`Event clicked: ${event.title} at ${event.startDate?.toLocaleTimeString()}`)
  }, [])

  // テスト用の静的イベントデータ
  const testEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return [
      {
        id: 'test-1',
        title: 'Morning Meeting',
        startDate: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00
        endDate: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00
        color: '#3b82f6',
        location: 'Conference Room A',
        description: 'Team standup meeting'
      },
      {
        id: 'test-2', 
        title: 'Lunch Break',
        startDate: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12:00
        endDate: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 13:00
        color: '#10b981',
        location: 'Cafeteria'
      },
      {
        id: 'test-3',
        title: 'Project Review',
        startDate: new Date(today.getTime() + 14 * 60 * 60 * 1000 + 30 * 60 * 1000), // 14:30
        endDate: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 16:00
        color: '#f59e0b',
        description: 'Quarterly project review session'
      },
      {
        id: 'test-4',
        title: 'Short Task',
        startDate: new Date(today.getTime() + 16 * 60 * 60 * 1000 + 15 * 60 * 1000), // 16:15
        endDate: new Date(today.getTime() + 16 * 60 * 60 * 1000 + 30 * 60 * 1000), // 16:30
        color: '#ef4444'
      }
    ] as CalendarEvent[]
  }, [])

  // 実際のイベントとテストイベントをマージ
  const allEvents = useMemo(() => {
    return [...events, ...testEvents]
  }, [events, testEvents])

  // Step 11: ナビゲーション関数
  const navigatePrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - (viewMode === 'week' ? 7 : 1))
      return newDate
    })
  }, [viewMode])

  const navigateNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + (viewMode === 'week' ? 7 : 1))
      return newDate
    })
  }, [viewMode])

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Step 11: ヘッダー */}
      <div className="flex-shrink-0 bg-background border-b border-border">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ＜ {viewMode === 'week' ? '前週' : '前日'}
            </button>
            
            <button
              onClick={navigateToday}
              className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              今日
            </button>
            
            <button
              onClick={navigateNext}
              className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {viewMode === 'week' ? '次週' : '次日'} ＞
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              日表示
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              週表示
            </button>
          </div>
        </div>

        {/* Step 11: 週表示の場合、曜日ヘッダーを表示 */}
        {viewMode === 'week' && (
          <div className="flex border-t border-border">
            <div className="w-16 border-r border-border flex-shrink-0" /> {/* 時間列のスペース */}
            {displayDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString()
              const weekdays = ['月', '火', '水', '木', '金', '土', '日']
              
              return (
                <div 
                  key={date.toISOString()} 
                  className="flex-1 border-r border-border last:border-r-0 p-3 text-center bg-gray-50 dark:bg-gray-800"
                >
                  <div className={`text-sm ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {weekdays[index]}
                  </div>
                  <div className={`text-lg font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
      
      {/* カレンダー本体 */}
      <div className="flex-1 min-h-0">
        <PureCalendarLayout
          dates={displayDates}
          events={allEvents}
          onCreateEvent={handleCreateEvent}
          onEventClick={handleEventClick}
        />
      </div>
      
      {/* シンプルテストポップアップ */}
      <SimpleTestPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        date={selectedDate}
        time={selectedTime}
      />
    </div>
  )
}