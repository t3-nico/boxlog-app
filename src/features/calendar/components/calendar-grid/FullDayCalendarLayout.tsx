'use client'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { TimeAxisLabels } from '../time-slots'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { useAddPopup } from '@/hooks/useAddPopup'
import { HOUR_HEIGHT } from '../../constants/calendar-constants'
import type { ViewDateRange, Task, TaskRecord } from '../../types/calendar.types'
import type { CalendarEvent } from '@/types/events'

interface FullDayCalendarLayoutProps {
  dates: Date[]
  tasks: Task[]
  events: CalendarEvent[]
  dateRange: ViewDateRange
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
}

// 現在時刻線コンポーネント（シンプル版）
function CurrentTimeLine({ day }: { day: Date }) {
  if (!isToday(day)) return null
  
  const now = new Date()
  const currentHours = now.getHours() + now.getMinutes() / 60
  
  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
      style={{
        top: `${currentHours * HOUR_HEIGHT}px`
      }}
    >
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
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
  const { openEventPopup } = useAddPopup()
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // ドラッグ機能は一時的に無効化
  const enableDragToCreate = false
  
  // Records取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(dateRange)
    }
  }, [planRecordMode, dateRange, fetchRecords])
  
  // 空き時間クリックハンドラー
  const handleEmptySlotClick = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    date: Date
  ) => {
    // イベントブロック上のクリックは無視
    if ((e.target as HTMLElement).closest('[data-event-block]')) {
      return
    }
    
    // クリック位置から時刻を計算
    const rect = e.currentTarget.getBoundingClientRect()
    const parentScrollTop = e.currentTarget.parentElement?.scrollTop || 0
    const clickY = e.clientY - rect.top + parentScrollTop
    
    // 15分単位でスナップ
    const totalMinutes = Math.max(0, Math.floor((clickY / HOUR_HEIGHT) * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    
    // 時刻文字列
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    // AddPopupを開く
    openEventPopup({
      dueDate: date,
      status: 'Todo'
    })
    
    // デフォルト値を設定（AddPopupが使用）
    if (onCreateEvent) {
      onCreateEvent(date, timeString)
    }
  }, [openEventPopup, onCreateEvent])
  
  // イベントの位置計算
  const calculateEventPosition = useCallback((event: CalendarEvent) => {
    if (!event.startDate) {
      return { top: 0, height: HOUR_HEIGHT }
    }
    
    const hours = event.startDate.getHours()
    const minutes = event.startDate.getMinutes()
    const top = (hours + minutes / 60) * HOUR_HEIGHT
    
    const endHours = event.endDate ? event.endDate.getHours() : hours + 1
    const endMinutes = event.endDate ? event.endDate.getMinutes() : 0
    const height = Math.max(
      20, // 最小高さ
      ((endHours + endMinutes / 60) - (hours + minutes / 60)) * HOUR_HEIGHT
    )
    
    return { top, height }
  }, [])

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <div className="flex h-full overflow-y-auto full-day-scroll pb-4">
        {/* 時間軸ラベル */}
        <div 
          className="flex-shrink-0 sticky left-0 z-10 bg-background shadow-sm"
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
            planRecordMode={planRecordMode}
            className="w-16"
          />
        </div>
        
        {/* カレンダーグリッド */}
        <div 
          className="flex-1 flex relative bg-background" 
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          {dates.map((day, dayIndex) => {
            // その日のイベントをフィルタリング
            const dayEvents = events.filter(event => {
              if (!event.startDate) return false
              return isSameDay(event.startDate, day)
            }).sort((a, b) => {
              const aTime = a.startDate ? a.startDate.getTime() : 0
              const bTime = b.startDate ? b.startDate.getTime() : 0
              return aTime - bTime
            })
            
            return (
              <div
                key={day.toISOString()}
                className="flex-1 border-r border-border last:border-r-0 relative"
              >
                {/* クリック可能な背景エリア */}
                <div
                  onClick={(e) => handleEmptySlotClick(e, day)}
                  className="absolute inset-0 z-10 cursor-cell"
                >
                  {/* 分割線（bothモード時のみ） */}
                  {planRecordMode === 'both' && (
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-0.5 z-20"></div>
                  )}
                  
                  {/* 時間グリッド背景 */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        title={`${hour}:00 - ${hour + 1}:00`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* 現在時刻線 */}
                <CurrentTimeLine day={day} />
                
                {/* イベント表示 */}
                {(planRecordMode === 'plan' || planRecordMode === 'both') && dayEvents.map((event) => {
                  if (!event.startDate) return null
                  
                  const { top, height } = calculateEventPosition(event)
                  const eventColor = event.color || '#3b82f6'
                  
                  // bothモードでは左半分、planモードでは全幅
                  const leftPosition = planRecordMode === 'both' ? '2px' : '4px'
                  const widthValue = planRecordMode === 'both' 
                    ? 'calc(50% - 4px)'
                    : 'calc(100% - 8px)'
                  
                  return (
                    <div
                      key={event.id}
                      data-event-block
                      className="absolute rounded-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 z-20 border border-white/20"
                      style={{
                        left: leftPosition,
                        width: widthValue,
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: eventColor
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                    >
                      <div className="p-1 sm:p-1.5 h-full overflow-hidden text-white">
                        <div className="flex flex-col h-full">
                          <div className="flex-1 min-h-0">
                            <div className="text-xs font-medium leading-tight line-clamp-2 mb-0.5">
                              {event.title}
                            </div>
                            {height > 30 && (
                              <div className="text-xs opacity-90 leading-tight">
                                {format(event.startDate, 'HH:mm')}
                                {event.endDate && ` - ${format(event.endDate, 'HH:mm')}`}
                              </div>
                            )}
                          </div>
                          {event.location && height > 60 && (
                            <div className="text-xs opacity-80 leading-tight mt-1 line-clamp-1">
                              📍 {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}