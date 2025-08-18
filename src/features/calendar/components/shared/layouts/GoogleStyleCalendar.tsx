'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { format, addDays } from 'date-fns'
import { CalendarEvent } from '@/features/events'
import { OptimizedEventRenderer } from '../OptimizedEventRenderer'
import { EventInteractionProvider, useEventInteraction, DragSelectionOverlay } from '../../interactions/EventInteractionManager'
import { AnimatedEventItem, CreatingEventPreview } from '../../interactions/animations/EventAnimations'
import { ContextMenu, useContextMenu, RightClickWrapper } from '../../interactions/ContextMenu'
import { UndoToastManager, useUndoToast, createUndoActions } from '../../interactions/UndoToast'
import { cn } from '@/lib/utils'

// 定数
const HOUR_HEIGHT = 72
const TIME_AXIS_WIDTH = 64

// プロパティ定義
interface GoogleStyleCalendarProps {
  dates: Date[]
  events: CalendarEvent[]
  onCreateEvent?: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateEvent?: (eventId: string, updates: Partial<CalendarEvent>) => void
  onDeleteEvent?: (eventId: string) => void
  onEventClick?: (event: CalendarEvent) => void
  className?: string
}

// 時間軸コンポーネント
function TimeAxis() {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  
  return (
    <div 
      className="flex-shrink-0 relative bg-background border-r border-border"
      style={{ width: `${TIME_AXIS_WIDTH}px`, height: `${24 * HOUR_HEIGHT}px` }}
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute flex items-center justify-end pr-3 text-xs text-muted-foreground"
          style={{
            top: `${hour * HOUR_HEIGHT}px`,
            height: '1px',
            width: '100%',
            transform: 'translateY(-50%)'
          }}
        >
          {hour > 0 && hour < 24 && (
            <span className="leading-none">
              {hour.toString().padStart(2, '0')}:00
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// 日付ヘッダー
function DateHeader({ date }: { date: Date }) {
  const isToday = useMemo(() => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }, [date])

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-2 border-b border-border bg-background',
      isToday && 'bg-primary/5'
    )}>
      <div className="text-xs text-muted-foreground font-medium">
        {format(date, 'E')}
      </div>
      <div className={cn(
        'text-lg font-semibold mt-1',
        isToday ? 'text-primary' : 'text-foreground'
      )}>
        {format(date, 'd')}
      </div>
      {isToday && (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  )
}

// メインカレンダーグリッド
function CalendarGrid({
  dates,
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onEventClick
}: GoogleStyleCalendarProps) {
  const { state, actions } = useEventInteraction()
  const { isOpen, position, context, openMenu, closeMenu } = useContextMenu()
  const { addAction } = useUndoToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const lastClickTime = useRef(0)

  // 時間スロットクリック処理
  const handleTimeSlotClick = useCallback((date: Date, hour: number, minute: number = 0) => {
    const now = Date.now()
    const timeDiff = now - lastClickTime.current
    
    // ダブルクリック検出
    if (timeDiff < 300) {
      if (clickTimeout) {
        clearTimeout(clickTimeout)
        setClickTimeout(null)
      }
      
      // ダブルクリック - 詳細モーダル表示
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      console.log('ダブルクリック - 詳細作成:', { date, time: timeString })
      return
    }

    lastClickTime.current = now

    // シングルクリック - 30分イベント作成（遅延実行）
    const timeout = setTimeout(() => {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const endTime = addMinutesToTime(startTime, 30)
      
      actions.startCreating(date, startTime, endTime)
      setClickTimeout(null)
    }, 300)
    
    setClickTimeout(timeout)
  }, [actions, clickTimeout])

  // ドラッグ開始処理
  const handleMouseDown = useCallback((date: Date, hour: number, minute: number = 0) => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    actions.startDrag(date, timeString)
  }, [actions])

  // ドラッグ中の処理
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const totalMinutes = Math.max(0, (relativeY / HOUR_HEIGHT) * 60)
    const snappedMinutes = Math.round(totalMinutes / 15) * 15 // 15分刻み
    
    const hour = Math.floor(snappedMinutes / 60)
    const minute = snappedMinutes % 60
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    if (state.dragDate) {
      actions.updateDrag(state.dragDate, timeString)
    }
  }, [state.isDragging, state.dragDate, actions])

  // ドラッグ終了処理
  const handleMouseUp = useCallback(() => {
    if (state.isDragging) {
      actions.endDrag()
    }
  }, [state.isDragging, actions])

  // イベント作成確定
  const handleCreateEvent = useCallback((title: string) => {
    if (!state.creatingEvent || !onCreateEvent) return

    const { date, startTime, endTime } = state.creatingEvent
    const startDate = new Date(date)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    startDate.setHours(startHour, startMinute, 0, 0)

    const endDate = new Date(date)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    endDate.setHours(endHour, endMinute, 0, 0)

    const newEvent: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      startDate,
      endDate,
      displayStartDate: startDate,
      displayEndDate: endDate,
      status: 'planned',
      priority: 'necessary',
      color: '#3B82F6',
      duration: (endDate.getTime() - startDate.getTime()) / (1000 * 60),
      isMultiDay: false,
      isRecurring: false
    }

    onCreateEvent(newEvent)
    actions.finishCreating()

    // Undoアクション追加
    addAction(createUndoActions.eventCreated(newEvent as CalendarEvent))
  }, [state.creatingEvent, onCreateEvent, actions, addAction])

  // イベント削除
  const handleDeleteEvent = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event || !onDeleteEvent) return

    onDeleteEvent(eventId)
    
    // Undoアクション追加
    addAction(createUndoActions.eventDeleted(event))
  }, [events, onDeleteEvent, addAction])

  // コンテキストメニュー処理
  const handleContextMenu = useCallback((e: React.MouseEvent, contextData: any) => {
    openMenu(e, contextData)
  }, [openMenu])

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.isDragging) {
          actions.cancelDrag()
        } else if (state.isCreating) {
          actions.cancelCreating()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, actions])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 時間軸 */}
      <TimeAxis />
      
      {/* メインエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 日付ヘッダー */}
        <div className="flex border-b border-border">
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              className="flex-1 min-w-0"
              style={{ minWidth: `${100 / dates.length}%` }}
            >
              <DateHeader date={date} />
            </div>
          ))}
        </div>

        {/* スクロール可能なグリッド */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 背景グリッド */}
          <div className="absolute inset-0 flex">
            {dates.map((date, dateIndex) => (
              <RightClickWrapper
                key={date.toISOString()}
                className="flex-1 relative border-r border-border last:border-r-0"
                onContextMenu={(e) => handleContextMenu(e, { timeSlot: { date, time: '09:00' } })}
                style={{ 
                  minWidth: `${100 / dates.length}%`,
                  height: `${24 * HOUR_HEIGHT}px`
                }}
              >
                {/* 時間スロット */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors group"
                    style={{
                      top: `${hour * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT}px`
                    }}
                    onClick={() => handleTimeSlotClick(date, hour)}
                    onMouseDown={() => handleMouseDown(date, hour)}
                    onContextMenu={(e) => handleContextMenu(e, { timeSlot: { date, time: `${hour.toString().padStart(2, '0')}:00` } })}
                  >
                    {/* 30分線 */}
                    <div
                      className="absolute w-full border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer"
                      style={{
                        top: `${HOUR_HEIGHT / 2}px`,
                        height: `${HOUR_HEIGHT / 2}px`
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTimeSlotClick(date, hour, 30)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleMouseDown(date, hour, 30)
                      }}
                    />
                    
                    {/* ホバー時のクイック作成ヒント */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        クリック: 30分 | ドラッグ: 範囲選択
                      </span>
                    </div>
                  </div>
                ))}

                {/* ドラッグ選択オーバーレイ */}
                {state.isDragging && state.dragDate?.toDateString() === date.toDateString() && (
                  <DragSelectionOverlay />
                )}

                {/* 作成中のイベントプレビュー */}
                {state.creatingEvent && state.creatingEvent.date.toDateString() === date.toDateString() && (
                  <CreatingEventPreview
                    date={state.creatingEvent.date}
                    startTime={state.creatingEvent.startTime}
                    endTime={state.creatingEvent.endTime}
                    onConfirm={handleCreateEvent}
                    onCancel={actions.cancelCreating}
                    dayWidth={100 / dates.length}
                  />
                )}
              </RightClickWrapper>
            ))}
          </div>

          {/* イベントレンダリング */}
          <OptimizedEventRenderer
            events={events}
            dates={dates}
            onEventClick={onEventClick}
            onDeleteEvent={handleDeleteEvent}
            containerRef={containerRef}
          />
        </div>
      </div>

      {/* コンテキストメニュー */}
      <ContextMenu
        isOpen={isOpen}
        position={position}
        onClose={closeMenu}
        event={context.event}
        timeSlot={context.timeSlot}
        onCreateEvent={(date, time) => {
          const endTime = addMinutesToTime(time, 30)
          actions.startCreating(date, time, endTime)
        }}
        onEditEvent={onEventClick}
        onDeleteEvent={handleDeleteEvent}
        onDuplicateEvent={(event) => {
          // 複製処理
          const duplicated = { ...event, id: undefined, title: `${event.title} (コピー)` }
          onCreateEvent?.(duplicated as any)
        }}
      />
    </div>
  )
}

// メインコンポーネント
export function GoogleStyleCalendar(props: GoogleStyleCalendarProps) {
  return (
    <UndoToastManager>
      <EventInteractionProvider>
        <div className={cn('h-full flex flex-col bg-background', props.className)}>
          <CalendarGrid {...props} />
        </div>
      </EventInteractionProvider>
    </UndoToastManager>
  )
}

// ユーティリティ関数
function addMinutesToTime(timeString: string, minutesToAdd: number): string {
  const [hours, minutes] = timeString.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
}

// デモ用のラッパー
export function GoogleStyleCalendarDemo() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  
  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => addDays(today, i))
  }, [])

  const handleCreateEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setEvents(prev => [...prev, newEvent])
  }, [])

  const handleUpdateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...updates, updatedAt: new Date() }
        : event
    ))
  }, [])

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('イベントクリック:', event.title)
  }, [])

  return (
    <GoogleStyleCalendar
      dates={dates}
      events={events}
      onCreateEvent={handleCreateEvent}
      onUpdateEvent={handleUpdateEvent}
      onDeleteEvent={handleDeleteEvent}
      onEventClick={handleEventClick}
    />
  )
}