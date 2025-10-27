// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ArrowRight, Calendar } from 'lucide-react'

// import type { Event } from '@/features/calendar/types/calendar.types'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { CHRONOTYPE_PRESETS, getProductivityZoneForHour, PRODUCTIVITY_COLORS } from '@/types/chronotype'

interface CurrentScheduleCardProps {
  collapsed?: boolean
}

export const CurrentScheduleCard = ({ collapsed = false }: CurrentScheduleCardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const router = useRouter()

  // ストアから実際のイベントデータを取得
  const { chronotype } = useCalendarSettingsStore()

  // jsx-no-bind optimization: No event click handler
  const handleNoEventClick = useCallback(() => {
    const today = new Date()
    const dateParam = today.toISOString().split('T')[0]
    router.push(`/calendar/day?date=${dateParam}`)
  }, [router])

  // jsx-no-bind optimization: No event keyboard handler
  const handleNoEventKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleNoEventClick()
      }
    },
    [handleNoEventClick]
  )

  // jsx-no-bind optimization: Calendar navigation click handler
  const handleClick = useCallback(() => {
    const today = new Date()
    const dateParam = today.toISOString().split('T')[0] // YYYY-MM-DD形式
    router.push(`/calendar/day?date=${dateParam}`)
  }, [router])

  // jsx-no-bind optimization: Calendar navigation keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  // 今日のイベントを独立してフェッチ
  const [todayEvents, _setTodayEvents] = useState<Event[]>([])

  useEffect(() => {
    console.log('🔍 [DISABLED] Would fetch today events - disabled for debugging')

    // const fetchTodayEvents = async () => {
    //   try {
    //     const today = new Date()
    //     const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    //     const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    //     console.log('🔍 Fetching today events:', {
    //       todayStart: todayStart.toISOString(),
    //       todayEnd: todayEnd.toISOString()
    //     })

    //     const params = new URLSearchParams()
    //     params.append('start_date', todayStart.toISOString().split('T')[0])
    //     params.append('end_date', todayEnd.toISOString().split('T')[0])

    //     const apiUrl = `/api/events?${params}`
    //     console.log('🌐 Calling API:', apiUrl)

    //     const response = await fetch(apiUrl)
    //     console.log('🌐 API response status:', response.status)

    //     if (response.ok) {
    //       const data = await response.json()
    //       console.log('📦 Raw API response:', data)

    //       const events = data.data?.events || data.events || data.data || data || []
    //       console.log('📥 Extracted events:', events.length, events)

    //       // EventEntity を Event に変換
    //       const convertedEvents = events.map((entity: EventEntity) => {
    //         return {
    //           id: entity.id,
    //           title: entity.title,
    //           description: entity.description,
    //           startDate: entity.planned_start ? new Date(entity.planned_start) : undefined,
    //           endDate: entity.planned_end ? new Date(entity.planned_end) : undefined,
    //           status: entity.status,
    //           priority: entity.priority,
    //           color: entity.color,
    //           location: entity.location,
    //           url: entity.url,
    //           tags: entity.event_tags?.map((et: EventTagEntity) => et.tags).filter(Boolean) || []
    //         }
    //       }).filter((event: Event) => event.startDate) // startDateがあるもののみ

    //       setTodayEvents(convertedEvents)
    //     } else {
    //       console.error('❌ API request failed:', response.status, response.statusText)
    //       const errorText = await response.text()
    //       console.error('❌ Error response:', errorText)
    //     }
    //   } catch (error) {
    //     console.error('❌ Failed to fetch today events:', error)
    //   }
    // }

    // fetchTodayEvents()
  }, [])

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
      return 'rgb(59 130 246)' // デフォルト青 (blue-500)
    }

    if (chronotype.type === 'custom') {
      return 'rgb(59 130 246)' // カスタムの場合はデフォルト
    }

    try {
      const profile = CHRONOTYPE_PRESETS[chronotype.type]
      const currentHour = currentTime.getHours()
      const zone = getProductivityZoneForHour(profile, currentHour)

      if (!zone || !PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]) {
        return 'rgb(59 130 246)' // フォールバック
      }

      const colors = PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]
      return colors.border
    } catch (error) {
      console.error('Chronotype color calculation error:', error)
      return 'rgb(59 130 246)' // エラー時のフォールバック
    }
  }

  // 現在進行中のイベントを取得
  useEffect(() => {
    const now = new Date()

    console.log('🔍 CurrentScheduleCard debug:', {
      todayEventsCount: todayEvents.length,
      currentTime: now.toISOString(),
    })

    if (todayEvents.length === 0) {
      setCurrentEvent(null)
      return
    }

    // 現在時刻にアクティブなイベントを検索
    const activeEvent = todayEvents.find((event) => {
      if (!event.startDate || !event.endDate) return false

      const startTime = new Date(event.startDate)
      const endTime = new Date(event.endDate)

      const isActive = now >= startTime && now <= endTime

      console.log('🕐 Checking event:', {
        title: event.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        currentTime: now.toISOString(),
        isActive,
      })

      return isActive
    })

    console.log('🎯 Final active event:', activeEvent?.title || 'None')
    setCurrentEvent(activeEvent || null)
  }, [currentTime, todayEvents])

  // 時間をフォーマット
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  if (collapsed) {
    // 閉じている時はアイコンのみ表示
    const borderColor = getChronotypeColor()
    return currentEvent ? (
      <div className="mb-4 flex justify-center">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900"
          style={{
            border: `2px solid ${borderColor}`,
          }}
        >
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    ) : null
  }

  if (!currentEvent) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Navigate to calendar view"
        className="bg-secondary border-secondary hover:bg-secondary/80 cursor-pointer rounded-lg border p-4 transition-colors"
        onClick={handleNoEventClick}
        onKeyDown={handleNoEventKeyDown}
      >
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">No current events</span>
        </div>
      </div>
    )
  }

  const borderColor = getChronotypeColor()

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Current event: ${currentEvent.title}`}
      className="bg-secondary hover:bg-secondary/80 flex cursor-pointer flex-col rounded-lg p-4 transition-colors"
      style={{
        border: `2px solid ${borderColor}`,
        gap: '8px',
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center" style={{ gap: '4px' }}>
        <div className="rounded border border-gray-300 px-2 py-1 text-xs font-medium tracking-wide text-gray-600 uppercase dark:border-gray-600 dark:text-gray-400">
          Live
        </div>
        <div className="flex items-center text-sm font-semibold text-gray-600 tabular-nums dark:text-gray-400">
          <span>{currentEvent.startDate ? formatTime(new Date(currentEvent.startDate)) : null}</span>
          <ArrowRight className="mx-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span>{currentEvent.endDate ? formatTime(new Date(currentEvent.endDate)) : null}</span>
        </div>
      </div>

      <h3 className="text-sm leading-tight font-semibold text-gray-900 dark:text-white">{currentEvent.title}</h3>
    </div>
  )
}
