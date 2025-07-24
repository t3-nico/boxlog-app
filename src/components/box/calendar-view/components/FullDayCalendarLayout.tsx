'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { isToday, isSameDay } from 'date-fns'
import { TimeAxisLabels } from './TimeAxisLabels'
import { HOUR_HEIGHT } from '../constants/grid-constants'
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
}

export function FullDayCalendarLayout({
  dates,
  tasks,
  events = [],
  dateRange,
  onEventClick,
  onCreateEvent
}: FullDayCalendarLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 初期スクロール位置を現在時刻に設定
  useEffect(() => {
    const scrollToCurrentTime = () => {
      const now = new Date()
      const currentHour = now.getHours()
      
      // 現在時刻の2時間前にスクロール（見やすくするため）
      const scrollHour = Math.max(0, currentHour - 2)
      const scrollPosition = scrollHour * HOUR_HEIGHT
      
      if (containerRef.current) {
        const scrollContainer = containerRef.current.querySelector('.full-day-scroll')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollPosition
        }
      }
    }
    
    // レンダリング完了後にスクロール
    const timer = setTimeout(scrollToCurrentTime, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <div className="flex h-full overflow-y-auto full-day-scroll">
        <div 
          className="flex-shrink-0 sticky left-0 bg-white dark:bg-gray-900 z-10"
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          <TimeAxisLabels 
            startHour={0} 
            endHour={24} 
            interval={60}
          />
        </div>
        <div 
          className="flex-1 relative" 
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          {dates.map((day, dayIndex) => {
            // その日のイベント
            const dayEvents = events.filter(event => 
              isSameDay(event.startDate, day)
            ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
            
            
            return (
              <div key={day.toISOString()} className="flex-1 relative border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                {/* 時間グリッド背景 */}
                <div className="absolute inset-0">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      className="border-b border-gray-100 dark:border-gray-800"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}
                </div>
                
                {/* 今日のみに現在時刻線を表示 */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 flex items-center"
                    style={{
                      top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 flex-shrink-0"></div>
                    <div className="flex-1 h-0.5 bg-red-500"></div>
                  </div>
                )}
                
                {/* イベント表示 */}
                {dayEvents.map(event => {
                  const startTime = `${String(event.startDate.getHours()).padStart(2, '0')}:${String(event.startDate.getMinutes()).padStart(2, '0')}`
                  const endTime = event.endDate ? `${String(event.endDate.getHours()).padStart(2, '0')}:${String(event.endDate.getMinutes()).padStart(2, '0')}` : null
                  const eventColor = event.color || '#1a73e8'
                  
                  // 開始位置と高さを計算
                  const startHour = event.startDate.getHours()
                  const startMinute = event.startDate.getMinutes()
                  const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                  
                  // 終了時刻がある場合は実際の長さ、ない場合は1時間
                  let height = HOUR_HEIGHT // デフォルト1時間
                  if (event.endDate) {
                    const endHour = event.endDate.getHours()
                    const endMinute = event.endDate.getMinutes()
                    const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
                    height = Math.max(duration * HOUR_HEIGHT, 24) // 最小24px
                  }
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute left-1 right-1 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 z-20"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: `${eventColor}15`,
                        borderLeft: `4px solid ${eventColor}`
                      }}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="p-2 h-full overflow-hidden">
                        {/* 時間バッジ */}
                        <div 
                          className="inline-block text-xs font-medium px-2 py-1 rounded text-white mb-1"
                          style={{ backgroundColor: eventColor }}
                        >
                          {startTime}{endTime && ` - ${endTime}`}
                        </div>
                        
                        {/* タイトル */}
                        <div 
                          className="text-sm font-medium leading-tight mb-1"
                          style={{ color: eventColor }}
                        >
                          {event.title}
                        </div>
                        
                        {/* 説明（高さがある場合のみ） */}
                        {event.description && height > 60 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                            {event.description}
                          </div>
                        )}
                        
                        {/* 場所（高さがある場合のみ） */}
                        {event.location && height > 80 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mt-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
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