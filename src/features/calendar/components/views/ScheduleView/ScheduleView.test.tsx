'use client'

import React from 'react'
import { ScheduleView } from './ScheduleView'
import type { ScheduleEvent } from './ScheduleView.types'

// テスト用のサンプルイベント
const sampleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'テストイベント1',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000), // 1時間後
    isAllDay: false,
    attendees: []
  },
  {
    id: '2', 
    title: '終日イベント',
    startDate: new Date(),
    endDate: new Date(),
    isAllDay: true,
    attendees: []
  }
]

// テスト用のスタンドアロンScheduleView
export function ScheduleViewTest() {
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    console.log('Navigate:', direction)
  }

  const handleEventClick = (event: ScheduleEvent) => {
    console.log('Event clicked:', event)
  }

  return (
    <div className="h-screen">
      <ScheduleView
        events={sampleEvents}
        onNavigate={handleNavigate}
        onEventClick={handleEventClick}
        currentDate={new Date()}
        displayDays={14}
        showWeekends={true}
      />
    </div>
  )
}