'use client'

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { isToday, isSameDay, format } from 'date-fns'
import { TimeAxisLabels } from './TimeAxisLabels'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
import { CalendarTask } from '../utils/time-grid-helpers'
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

interface DragState {
  isDragging: boolean
  startDate: Date | null
  startY: number
  currentY: number
  dayIndex: number
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

  // Y座標から時間を計算する関数（Googleカレンダー準拠）
  const getTimeFromY = useCallback((y: number, dayIndex: number): Date => {
    // Y座標を時間に変換（48px = 1時間）
    const totalHours = y / HOUR_HEIGHT
    
    // 15分単位にスナップ（00, 15, 30, 45分刻み）
    const totalMinutes = Math.round(totalHours * 60)
    const snappedMinutes = Math.round(totalMinutes / 15) * 15 // 15分単位でスナップ
    
    const hours = Math.floor(snappedMinutes / 60)
    const minutes = snappedMinutes % 60
    
    // 基準日付を安全に複製（タイムゾーンの問題を避けるため）
    const baseDate = dates[dayIndex]
    const resultDate = new Date(baseDate)
    resultDate.setHours(hours, minutes, 0, 0)
    
    
    return resultDate
  }, [dates])

  // マウスダウンハンドラー
  const handleMouseDown = useCallback((e: React.MouseEvent, dayIndex: number) => {
    // イベント要素上でのクリックは無視
    if ((e.target as HTMLElement).closest('[data-event]')) {
      return
    }

    // 日付コンテナ（グリッド部分）の境界を取得
    const dayContainer = e.currentTarget
    const rect = dayContainer.getBoundingClientRect()
    const scrollTop = containerRef.current?.querySelector('.full-day-scroll')?.scrollTop || 0
    
    // Y座標をグリッド開始位置（0時）からの相対位置として計算
    const y = e.clientY - rect.top + scrollTop
    
    const startDate = getTimeFromY(y, dayIndex)
    
    setDragState({
      isDragging: true,
      startDate,
      startY: y,
      currentY: y,
      dayIndex
    })
  }, [getTimeFromY])

  // マウス移動ハンドラー
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const scrollTop = containerRef.current?.querySelector('.full-day-scroll')?.scrollTop || 0
    const y = e.clientY - rect.top + scrollTop
    
    setDragState(prev => ({
      ...prev,
      currentY: y
    }))
  }, [dragState.isDragging])

  // マウスアップハンドラー
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.startDate) return
    
    const endDate = getTimeFromY(dragState.currentY, dragState.dayIndex)
    
    // 開始時刻と終了時刻を正しい順序に（上から下へのドラッグを基準）
    const [start, end] = dragState.startY <= dragState.currentY 
      ? [dragState.startDate, endDate]
      : [endDate, dragState.startDate]
    
    // 最小15分の長さを確保（より安全な日付操作）
    const minDuration = 15 * 60 * 1000 // 15分
    let finalEnd = new Date(end)
    if (end.getTime() - start.getTime() < minDuration) {
      finalEnd = new Date(start.getTime() + minDuration)
    }
    
    
    // イベント作成（日付が確実に正しく設定されるように改善）
    if (onCreateEvent) {
      const startTime = format(start, 'HH:mm')
      const endTime = format(finalEnd, 'HH:mm')
      
      // 日付部分を確実に保持するため、基準日付を使用
      const eventDate = new Date(dates[dragState.dayIndex])
      
      onCreateEvent(eventDate, `${startTime}-${endTime}`)
    }
    
    // ドラッグ状態をリセット
    setDragState({
      isDragging: false,
      startDate: null,
      startY: 0,
      currentY: 0,
      dayIndex: -1
    })
  }, [dragState, getTimeFromY, onCreateEvent])

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <div className="flex h-full overflow-y-auto full-day-scroll pb-4">
        <div 
          className="flex-shrink-0 sticky left-0 z-10"
          style={{ height: `${25 * HOUR_HEIGHT}px` }}
        >
          <TimeAxisLabels 
            startHour={0} 
            endHour={25} 
            interval={60}
            planRecordMode={planRecordMode}
          />
        </div>
        <div 
          className="flex-1 flex relative" 
          style={{ height: `${25 * HOUR_HEIGHT}px` }}
        >
          
          {dates.map((day, dayIndex) => {
            // その日のイベント
            const dayEvents = events.filter(event => {
              if (!event.startDate) return false
              return isSameDay(event.startDate, day)
            }).sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0))
            
            
            // その日の記録（Log）
            const dayRecords = recordTasks.filter(record => 
              isSameDay(record.startTime, day)
            ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
            
            return (
              <div 
                key={day.toISOString()} 
                className="flex-1 relative border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                onMouseDown={(e) => handleMouseDown(e, dayIndex)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: dragState.isDragging ? 'grabbing' : 'pointer' }}
              >
                {/* bothモードの場合は各日付の中央に分割線を表示 */}
                {planRecordMode === 'both' && (
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 -translate-x-0.5 z-20"></div>
                )}
                
                {/* 時間グリッド背景 */}
                <div className="absolute inset-0">
                  {Array.from({ length: 25 }, (_, hour) => (
                    <div
                      key={hour}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}
                </div>
                
                {/* ドラッグ中の選択範囲表示 */}
                {dragState.isDragging && dragState.dayIndex === dayIndex && dragState.startDate && (
                  <div
                    className="absolute bg-blue-200 dark:bg-blue-800 opacity-30 z-10 pointer-events-none"
                    style={{
                      left: planRecordMode === 'both' ? '2px' : '4px',
                      right: planRecordMode === 'both' ? '50%' : '4px',
                      top: `${Math.min(dragState.startY, dragState.currentY)}px`,
                      height: `${Math.abs(dragState.currentY - dragState.startY)}px`,
                      minHeight: '12px'
                    }}
                  />
                )}
                
                
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
                {(planRecordMode === 'plan' || planRecordMode === 'both') && dayEvents.map(event => {
                  if (!event.startDate) return null
                  
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
                    height = Math.max(duration * HOUR_HEIGHT, 12) // 最小12px（15分相当）
                  }
                  
                  // bothモードの場合は左側のみ、planモードの場合は全幅
                  const leftPosition = planRecordMode === 'both' ? '2px' : '4px'
                  const rightPosition = planRecordMode === 'both' ? '50%' : '4px'
                  
                  return (
                    <div
                      key={event.id}
                      data-event="true"
                      className="absolute rounded-md cursor-pointer hover:shadow-lg transition-all duration-200 z-20 border border-white/20"
                      style={{
                        left: leftPosition,
                        right: rightPosition,
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: eventColor
                      }}
                      onClick={(e) => {
                        try {
                          console.log('🖱️ Event card clicked:', event)
                          console.log('🖱️ onEventClick function:', onEventClick)
                          e.stopPropagation()
                          if (onEventClick) {
                            console.log('🖱️ Calling onEventClick...')
                            onEventClick(event)
                          } else {
                            console.error('❌ onEventClick is undefined!')
                          }
                        } catch (error) {
                          console.error('❌ Error in onClick handler:', error)
                        }
                      }}
                    >
                      <div className="p-1.5 h-full overflow-hidden text-white">
                        {/* メインコンテンツ */}
                        <div className="flex flex-col h-full">
                          {/* タイトルと時間 */}
                          <div className="flex-1 min-h-0">
                            {/* タイトル */}
                            <div className="text-xs font-medium leading-tight line-clamp-2 mb-0.5">
                              {event.title}
                            </div>
                            
                            {/* 時間 */}
                            <div className="text-xs opacity-90 leading-tight">
                              {startTime}{endTime && ` - ${endTime}`}
                            </div>
                          </div>
                          
                          {/* 場所（高さがある場合のみ） */}
                          {event.location && height > 60 && (
                            <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* 記録（Log）表示 */}
                {(planRecordMode === 'record' || planRecordMode === 'both') && dayRecords.map(record => {
                  const startTime = `${String(record.startTime.getHours()).padStart(2, '0')}:${String(record.startTime.getMinutes()).padStart(2, '0')}`
                  const endTime = `${String(record.endTime.getHours()).padStart(2, '0')}:${String(record.endTime.getMinutes()).padStart(2, '0')}`
                  const recordColor = record.color || '#10b981'
                  
                  // 開始位置と高さを計算
                  const startHour = record.startTime.getHours()
                  const startMinute = record.startTime.getMinutes()
                  const endHour = record.endTime.getHours()
                  const endMinute = record.endTime.getMinutes()
                  const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                  const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
                  const height = Math.max(duration * HOUR_HEIGHT, 12) // 最小12px（15分相当）
                  
                  // bothモードの場合は右側のみ、recordモードの場合は全幅
                  const leftPosition = planRecordMode === 'both' ? '50%' : '4px'
                  const rightPosition = '4px'
                  
                  return (
                    <div
                      key={record.id}
                      data-event="true"
                      className="absolute rounded-md cursor-pointer hover:shadow-lg transition-all duration-200 z-20 border border-white/20"
                      style={{
                        left: leftPosition,
                        right: rightPosition,
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        backgroundColor: recordColor
                      }}
                    >
                      <div className="p-1.5 h-full overflow-hidden text-white">
                        {/* メインコンテンツ */}
                        <div className="flex flex-col h-full">
                          {/* タイトルと時間 */}
                          <div className="flex-1 min-h-0">
                            {/* タイトル */}
                            <div className="text-xs font-medium leading-tight line-clamp-2 mb-0.5">
                              {record.title}
                            </div>
                            
                            {/* 時間 */}
                            <div className="text-xs opacity-90 leading-tight">
                              {startTime} - {endTime}
                            </div>
                          </div>
                          
                          {/* 説明（高さがある場合のみ） */}
                          {record.description && height > 60 && (
                            <div className="text-xs opacity-80 leading-tight mt-1 line-clamp-2">
                              {record.description}
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