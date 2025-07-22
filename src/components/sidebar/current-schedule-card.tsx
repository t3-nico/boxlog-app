'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { 
  CHRONOTYPE_PRESETS, 
  getProductivityZoneForHour, 
  PRODUCTIVITY_COLORS,
  type ProductivityZone 
} from '@/types/chronotype'

interface ScheduleEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  description?: string
}

interface Event {
  id: number
  name: string
  date: string
  time: string
  location: string
  status: string
}

interface CurrentScheduleCardProps {
  collapsed?: boolean
  events?: Event[]
}

export function CurrentScheduleCard({ collapsed = false, events = [] }: CurrentScheduleCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentEvent, setCurrentEvent] = useState<ScheduleEvent | null>(null)
  
  // クロノタイプ設定を取得
  const { chronotype } = useCalendarSettingsStore()

  // リアルタイム時間更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // クロノタイプ設定に完全対応した色変更
  const getChronotypeColor = () => {
    if (!chronotype || !chronotype.enabled) {
      return '#3b82f6' // デフォルト青
    }

    if (chronotype.type === 'custom') {
      return '#3b82f6' // カスタムの場合はデフォルト
    }

    try {
      const profile = CHRONOTYPE_PRESETS[chronotype.type]
      const currentHour = currentTime.getHours()
      const zone = getProductivityZoneForHour(profile, currentHour)
      
      if (!zone || !PRODUCTIVITY_COLORS[zone.color]) {
        return '#3b82f6' // フォールバック
      }

      const colors = PRODUCTIVITY_COLORS[zone.color]
      return colors.border
    } catch (error) {
      console.error('Chronotype color calculation error:', error)
      return '#3b82f6' // エラー時のフォールバック
    }
  }

  // 現在の予定を取得（実際のイベントデータから）
  useEffect(() => {
    if (!events || events.length === 0) {
      setCurrentEvent(null)
      return
    }

    const now = new Date()
    const today = now.toDateString()

    // 今日のイベントを探す
    const todayEvents = events.filter(event => {
      try {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === today && event.status === 'On Sale'
      } catch {
        return false
      }
    })

    if (todayEvents.length > 0) {
      const event = todayEvents[0]
      // イベント時間をパース（例：「10 PM」→ 22:00）
      const timeMatch = event.time.match(/(\d+)\s*(AM|PM)/i)
      if (timeMatch) {
        const hour = parseInt(timeMatch[1])
        const ampm = timeMatch[2].toUpperCase()
        let eventHour = hour
        if (ampm === 'PM' && hour !== 12) eventHour += 12
        if (ampm === 'AM' && hour === 12) eventHour = 0

        const eventStart = new Date(now)
        eventStart.setHours(eventHour, 0, 0, 0)
        
        const eventEnd = new Date(eventStart)
        eventEnd.setHours(eventHour + 2) // 2時間のイベントと仮定

        const scheduleEvent: ScheduleEvent = {
          id: event.id.toString(),
          title: event.name,
          startTime: eventStart,
          endTime: eventEnd,
          description: event.location
        }

        setCurrentEvent(scheduleEvent)
      }
    } else {
      setCurrentEvent(null)
    }
  }, [events, currentTime])

  // 残り時間を計算
  const getRemainingTime = (endTime: Date): string => {
    const now = new Date()
    const remaining = endTime.getTime() - now.getTime()
    
    if (remaining <= 0) return 'Ended'
    
    const minutes = Math.floor(remaining / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`
    }
    return `${minutes}m remaining`
  }

  // 時間をフォーマット
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  if (collapsed) {
    // 閉じている時はアイコンのみ表示
    const borderColor = getChronotypeColor()
    return currentEvent ? (
      <div className="flex justify-center mb-4">
        <div 
          className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"
          style={{
            border: `2px solid ${borderColor}`
          }}
        >
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    ) : null
  }

  if (!currentEvent) {
    return (
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">No current events</span>
        </div>
      </div>
    )
  }

  const borderColor = getChronotypeColor()
  
  return (
    <div 
      className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      style={{
        border: `2px solid ${borderColor}`
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          Live
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
        {currentEvent.title}
      </h3>
      
      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 mb-2">
        <Clock className="w-3 h-3" />
        <span>
          {formatTime(currentEvent.startTime)} - {formatTime(currentEvent.endTime)}
        </span>
      </div>
      
      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
        ⏰ {getRemainingTime(currentEvent.endTime)}
      </div>
    </div>
  )
}