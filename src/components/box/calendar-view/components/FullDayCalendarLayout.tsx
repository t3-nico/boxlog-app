'use client'

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { isToday, isSameDay, format } from 'date-fns'
import { TimeAxisLabels } from './TimeAxisLabels'
import { DnDProvider } from './dnd/DnDProvider'
import { DraggableEvent } from './dnd/DraggableEvent'
import { CalendarDropZone } from './dnd/CalendarDropZone'
import { DragPreview } from './dnd/DragPreview'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
import { CalendarTask } from '../utils/time-grid-helpers'
import { getTimeFromY, dateToLocalStrings } from '@/utils/dateHelpers'
import { getCurrentTimeInUserTimezone, utcToUserTimezone } from '@/utils/timezone'
import type { ViewDateRange, Task, TaskRecord } from '../types'
import type { CalendarEvent } from '@/types/events'

interface FullDayCalendarLayoutProps {
  /** 表示する日付配列 */
  dates: Date[]
  /** タスクデータ */
  tasks: Task[]
  /** イベントデータ */
  events?: CalendarEvent[]
  /** 日付範囲 */
  dateRange: ViewDateRange
  /** イベントクリック時のハンドラ */
  onEventClick?: (event: CalendarEvent) => void
  /** イベント作成時のハンドラ */
  onCreateEvent?: (date: Date, time?: string) => void
  /** イベント更新時のハンドラ */
  onUpdateEvent?: (event: CalendarEvent) => void
}

interface DragState {
  isDragging: boolean
  startDate: Date | null
  startY: number
  currentY: number
  dayIndex: number
}

// 現在時刻線コンポーネント（SSR対応）
function CurrentTimeLine({ day }: { day: Date }) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  
  useEffect(() => {
    // クライアントサイドでのみ現在時刻を設定
    if (isToday(day)) {
      setCurrentTime(getCurrentTimeInUserTimezone())
      
      // 1分ごとに更新
      const interval = setInterval(() => {
        setCurrentTime(getCurrentTimeInUserTimezone())
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [day])
  
  if (!currentTime || !isToday(day)) {
    return null
  }
  
  const currentHours = currentTime.getHours() + currentTime.getMinutes() / 60
  
  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 flex items-center"
      style={{
        top: `${currentHours * HOUR_HEIGHT}px`
      }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 flex-shrink-0"></div>
      <div className="flex-1 h-0.5 bg-red-500"></div>
    </div>
  )
}

export function FullDayCalendarLayout({
  dates,
  tasks,
  events = [],
  dateRange,
  onEventClick,
  onCreateEvent,
  onUpdateEvent
}: FullDayCalendarLayoutProps) {
  console.log('🎯 FullDayCalendarLayout rendered with dates.length:', dates.length, 'events.length:', events.length)
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  
  // ドラッグ状態管理
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDate: null,
    startY: 0,
    currentY: 0,
    dayIndex: -1
  })

  // Recordsの取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(dateRange)
    }
  }, [planRecordMode, dateRange, fetchRecords])

  // Task[]をCalendarTask[]に変換（実績用）
  const recordTasks: CalendarTask[] = useMemo(() => {
    if (planRecordMode === 'plan') return []
    
    return records.map(record => ({
      id: record.id,
      title: record.title,
      startTime: new Date(record.actual_start),
      endTime: new Date(record.actual_end),
      color: '#10b981',
      description: record.memo || '',
      status: 'completed' as const,
      priority: 'medium' as const,
      isRecord: true,
      satisfaction: record.satisfaction,
      focusLevel: record.focus_level,
      energyLevel: record.energy_level
    }))
  }, [records, planRecordMode])

  // 初期スクロール位置を現在時刻に設定
  useEffect(() => {
    const scrollToCurrentTime = () => {
      const now = new Date()
      const currentHour = now.getHours()
      
      // 現在時刻の2時間前にスクロール（見やすくするため）
      const scrollHour = Math.max(0, currentHour - 2)
      const scrollPosition = scrollHour * HOUR_HEIGHT
      
      // 親のScrollAreaを探す
      const scrollContainer = document.querySelector('[data-slot="scroll-area-viewport"]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollPosition
        console.log('📍 初期スクロール設定:', { currentHour, scrollHour, scrollPosition, scrollTop: scrollContainer.scrollTop })
      } else {
        console.log('❌ ScrollArea のビューポートが見つかりません')
      }
    }
    
    // レンダリング完了後にスクロール
    const timer = setTimeout(scrollToCurrentTime, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0">
      <DragPreview />
      {/* カレンダーコンテンツ */}
      <div className="flex pr-3" style={{ height: `${24 * HOUR_HEIGHT}px`, minHeight: `${24 * HOUR_HEIGHT}px` }}>
          {/* 時間軸ラベル - スクロールと一緒に動く */}
          <div className="flex-shrink-0 bg-background border-r border-border z-20">
            <TimeAxisLabels 
              startHour={0} 
              endHour={24} 
              interval={60}
              planRecordMode={planRecordMode}
            />
          </div>
          
          {/* カレンダーグリッド部分 */}
          <div className="flex flex-1 relative bg-background">
            {dates.map((day, dayIndex) => {
              // 日付のみで確実に比較（時刻を無視）
              const dayEvents = events.filter(event => {
                if (!event.startDate) return false
                
                // 時刻を無視して年月日のみで比較
                const eventYear = event.startDate.getFullYear()
                const eventMonth = event.startDate.getMonth()
                const eventDate = event.startDate.getDate()
                
                const dayYear = day.getFullYear()
                const dayMonth = day.getMonth()
                const dayDate = day.getDate()
                
                return eventYear === dayYear && eventMonth === dayMonth && eventDate === dayDate
              }).sort((a, b) => {
                const aTime = a.startDate ? a.startDate.getTime() : 0
                const bTime = b.startDate ? b.startDate.getTime() : 0
                return aTime - bTime
              })
              
              // その日の記録（Log）
              const dayRecords = recordTasks.filter(record => 
                isSameDay(record.startTime, day)
              ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              
              return (
                <CalendarDropZone
                  key={day.toISOString()}
                  date={day}
                  dayIndex={dayIndex}
                  onEventUpdate={onUpdateEvent}
                  className="flex-1 border-r border-border last:border-r-0"
                >
                  <div className="absolute inset-0">
                    {/* 時間グリッド背景 */}
                    <div className="absolute inset-0">
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        />
                      ))}
                    </div>
                    
                    {/* Plan/Record分割線（両方表示モードの時のみ） */}
                    {planRecordMode === 'both' && (
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200 dark:bg-gray-700 z-10" />
                    )}
                    
                    {/* 今日のみに現在時刻線を表示 */}
                    <CurrentTimeLine day={day} />
                    
                    {/* イベント表示 */}
                    {(planRecordMode === 'plan' || planRecordMode === 'both') && dayEvents.map(event => {
                      if (!event.startDate) return null
                      
                      const userStartDate = event.startDate
                      const userEndDate = event.endDate
                      
                      const startTime = `${String(userStartDate.getHours()).padStart(2, '0')}:${String(userStartDate.getMinutes()).padStart(2, '0')}`
                      const endTime = userEndDate ? `${String(userEndDate.getHours()).padStart(2, '0')}:${String(userEndDate.getMinutes()).padStart(2, '0')}` : null
                      const eventColor = event.color || '#1a73e8'
                      
                      // 開始位置と高さを計算
                      const startHour = userStartDate.getHours()
                      const startMinute = userStartDate.getMinutes()
                      const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                      
                      // 終了時刻がある場合は実際の長さ、ない場合は1時間
                      let height = HOUR_HEIGHT // デフォルト1時間
                      if (userEndDate) {
                        const endHour = userEndDate.getHours()
                        const endMinute = userEndDate.getMinutes()
                        const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
                        height = Math.max(duration * HOUR_HEIGHT, 12) // 最小12px（15分相当）
                      }
                      
                      // bothモードの場合は左側のみ、planモードの場合は全幅
                      const leftPosition = planRecordMode === 'both' ? '2px' : '4px'
                      const rightPosition = planRecordMode === 'both' ? '50%' : '4px'
                      
                      return (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          dayIndex={dayIndex}
                          topPosition={topPosition}
                          onEventClick={onEventClick}
                          style={{
                            left: leftPosition,
                            right: rightPosition,
                            top: `${topPosition}px`,
                            height: `${height}px`,
                            backgroundColor: eventColor
                          }}
                        >
                          <div className="p-1.5 h-full overflow-hidden text-white">
                            <div className="flex flex-col h-full">
                              <div className="flex-1 min-h-0">
                                <div className="text-xs font-medium leading-tight line-clamp-2 mb-0.5">
                                  {event.title}
                                </div>
                                <div className="text-xs opacity-90 leading-tight">
                                  {startTime}{endTime && ` - ${endTime}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </DraggableEvent>
                      )
                    })}
                  </div>
                </CalendarDropZone>
              )
            })}
          </div>
        </div>
    </div>
  )
}