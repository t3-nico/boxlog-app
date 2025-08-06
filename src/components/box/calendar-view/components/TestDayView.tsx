'use client'

import React, { useMemo, useCallback, useState } from 'react'
import { PureCalendarLayout } from './PureCalendarLayout'
import { SimpleTestPopup } from './SimpleTestPopup'
import type { CalendarEvent } from '@/types/events'

interface TestDayViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function TestDayView({ currentDate, events }: TestDayViewProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  
  // 正規化された日付を作成（時分秒をリセット）
  const normalizedCurrentDate = useMemo(() => {
    const normalized = new Date(currentDate)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }, [currentDate])

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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <h2 className="text-lg font-semibold">
          Pure Calendar Test - {normalizedCurrentDate.toDateString()}
        </h2>
        <p className="text-sm text-muted-foreground">
          {allEvents.length} events loaded ({testEvents.length} test events)
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          💡 Click any empty time slot to create an event (15-min snap)
        </p>
      </div>
      
      {/* カレンダー本体 */}
      <div className="flex-1 min-h-0">
        <PureCalendarLayout
          dates={[normalizedCurrentDate]}
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