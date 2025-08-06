'use client'

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { format, isToday } from 'date-fns'
import type { CalendarEvent } from '@/types/events'

// 定数定義
const HOUR_HEIGHT = 80 // 1時間の高さ（px）
const TIME_AXIS_WIDTH = 64 // 時間軸の幅（px）

interface PureCalendarLayoutProps {
  dates: Date[]
  events: CalendarEvent[]
  onCreateEvent?: (date: Date, time: string) => void
  onEventClick?: (event: CalendarEvent) => void
}

// 時間ラベルコンポーネント
function TimeAxisLabels() {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
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
            height: `${HOUR_HEIGHT}px`,
            width: '100%'
          }}
        >
          <span className="leading-none">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  )
}

// カレンダーグリッドコンポーネント
function CalendarGrid({ 
  dates, 
  events, 
  onCreateEvent,
  onEventClick 
}: { 
  dates: Date[], 
  events: CalendarEvent[], 
  onCreateEvent?: (date: Date, time: string) => void,
  onEventClick?: (event: CalendarEvent) => void
}) {
  // Phase 1.4: クリックされたスロットのstate
  const [clickedSlot, setClickedSlot] = useState<{
    date: Date
    hour: number
    minute: number
  } | null>(null)

  // Step 3: 新しい予定のstate
  const [newEvent, setNewEvent] = useState<{
    date: Date
    startTime: string
    endTime: string
    top: number
    height: number
  } | null>(null)

  // Step 5: ドラッグ用のstate
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragEnd, setDragEnd] = useState<string | null>(null)
  const [dragDate, setDragDate] = useState<Date | null>(null)

  // Step 6: 保存された予定のstate
  const [savedEvents, setSavedEvents] = useState<Array<{
    id: string
    title: string
    startTime: string
    endTime: string
    date: string
    color: string
  }>>([])

  // Step 7: 選択状態の管理
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Step 8: 予定ドラッグ状態の管理
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{ top: number; startTime: string; endTime: string } | null>(null)
  const [draggedTime, setDraggedTime] = useState<{ start: string; end: string } | null>(null)

  // Step 9: リサイズ状態の管理
  const [resizingEvent, setResizingEvent] = useState<{
    id: string
    initialEndTime: string
    startY: number
  } | null>(null)

  // Step 10: カラーピッカー状態の管理
  const [colorPickerEvent, setColorPickerEvent] = useState<{
    id: string
    x: number
    y: number
  } | null>(null)

  // プリセットカラー
  const presetColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
    '#1f2937', // dark gray
  ]

  // 時刻から位置と高さを計算するヘルパー関数
  const calculatePositionFromTime = useCallback((startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    
    const top = (startHours + startMinutes / 60) * HOUR_HEIGHT
    const duration = (endHours + endMinutes / 60) - (startHours + startMinutes / 60)
    const height = duration * HOUR_HEIGHT
    
    return { top, height }
  }, [])

  // Step 7: キーボードイベント（Delete削除）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // inputフィールドにフォーカスがある場合は無視
      const activeElement = document.activeElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEventId) {
          e.preventDefault()
          console.log('🎯 Step 7: 予定削除:', selectedEventId)
          setSavedEvents(prev => prev.filter(event => event.id !== selectedEventId))
          setSelectedEventId(null)
        }
      } else if (e.key === 'Escape') {
        // Escで選択解除
        setSelectedEventId(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedEventId])

  // Step 8: グローバルなマウス移動・終了処理
  useEffect(() => {
    if (!draggingEventId) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingEventId) return

      // カレンダーコンテナを正確に特定
      const calendarContainer = document.querySelector('[data-calendar-container]') as HTMLElement
      if (!calendarContainer) {
        console.log('🎯 Step 8: カレンダーコンテナが見つからない')
        return
      }

      const containerRect = calendarContainer.getBoundingClientRect()
      const scrollContainer = calendarContainer.closest('.overflow-y-auto') as HTMLElement
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0

      // マウス位置から相対座標を計算
      const relativeY = Math.max(0, e.clientY - containerRect.top + scrollTop)
      
      // 15分単位でスナップ
      const totalMinutes = Math.round((relativeY / HOUR_HEIGHT) * 60 / 15) * 15
      const newHour = Math.floor(totalMinutes / 60)
      const newMinute = totalMinutes % 60

      console.log('🎯 Step 8 正確な座標:', {
        mouseY: e.clientY,
        containerTop: containerRect.top,
        scrollTop,
        relativeY,
        totalMinutes,
        newTime: `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
      })

      if (newHour >= 0 && newHour < 24) {
        const draggingEvent = savedEvents.find(e => e.id === draggingEventId)
        if (draggingEvent) {
          // 元の予定の長さを維持
          const [originalStartHours, originalStartMinutes] = draggingEvent.startTime.split(':').map(Number)
          const [originalEndHours, originalEndMinutes] = draggingEvent.endTime.split(':').map(Number)
          const originalDurationMinutes = (originalEndHours * 60 + originalEndMinutes) - (originalStartHours * 60 + originalStartMinutes)
          
          const newEndTotalMinutes = totalMinutes + originalDurationMinutes
          let newEndHour = Math.floor(newEndTotalMinutes / 60)
          let newEndMinute = newEndTotalMinutes % 60

          // 24時を超える場合の制限
          if (newEndHour >= 24) {
            newEndHour = 23
            newEndMinute = 59
          }

          const newStartTime = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
          const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`
          
          setDragPreviewPosition({
            top: (newHour + newMinute / 60) * HOUR_HEIGHT,
            startTime: newStartTime,
            endTime: newEndTime
          })
          
          setDraggedTime({
            start: newStartTime,
            end: newEndTime
          })
          
          console.log('🎯 Step 8: 予定更新:', {
            originalTime: `${draggingEvent.startTime} - ${draggingEvent.endTime}`,
            newTime: `${newStartTime} - ${newEndTime}`
          })
        }
      }
    }

    const handleMouseUp = () => {
      console.log('🎯 Step 8: マウスアップ検出!', { draggingEventId, draggedTime })
      
      // 🔧 修正: draggedTimeを使って実際に予定を更新
      if (draggingEventId && draggedTime) {
        console.log('🎯 Step 8: 予定移動完了:', { 
          eventId: draggingEventId, 
          newTime: `${draggedTime.start} - ${draggedTime.end}` 
        })
        
        // 実際に予定を更新
        setSavedEvents(prev => prev.map(event => 
          event.id === draggingEventId 
            ? { 
                ...event, 
                startTime: draggedTime.start,
                endTime: draggedTime.end
              }
            : event
        ))
      } else {
        console.log('🎯 Step 8: 更新条件が満たされていません', { draggingEventId, draggedTime })
      }
      
      // ドラッグ状態をリセット
      setDraggingEventId(null)
      setDragOffset(0)
      setDragPreviewPosition(null)
      setDraggedTime(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingEventId, dragOffset, savedEvents, draggedTime])

  // Step 9: リサイズ処理
  useEffect(() => {
    if (!resizingEvent) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizingEvent.startY
      const deltaMinutes = Math.round(deltaY / (HOUR_HEIGHT / 4)) * 15 // 15分単位でスナップ

      const resizingEventData = savedEvents.find(evt => evt.id === resizingEvent.id)
      if (!resizingEventData) return

      const [startHours, startMinutes] = resizingEventData.startTime.split(':').map(Number)
      const [initialEndHours, initialEndMinutes] = resizingEvent.initialEndTime.split(':').map(Number)
      
      // 新しい終了時間を計算
      const initialEndTotalMinutes = initialEndHours * 60 + initialEndMinutes
      const newEndTotalMinutes = Math.max(
        (startHours * 60 + startMinutes) + 15, // 最小15分
        Math.min(
          initialEndTotalMinutes + deltaMinutes,
          23 * 60 + 45 // 23:45まで（日またぎ防止）
        )
      )

      const newEndHours = Math.floor(newEndTotalMinutes / 60)
      const newEndMinutes = newEndTotalMinutes % 60
      const newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`

      // 予定を更新
      setSavedEvents(prev => prev.map(evt => 
        evt.id === resizingEvent.id 
          ? { ...evt, endTime: newEndTime }
          : evt
      ))

      console.log('🎯 Step 9: リサイズ中:', {
        deltaY,
        deltaMinutes,
        originalEndTime: resizingEvent.initialEndTime,
        newEndTime
      })
    }

    const handleMouseUp = () => {
      console.log('🎯 Step 9: リサイズ完了')
      setResizingEvent(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingEvent, savedEvents])

  // Step 10: カラーピッカーの外側クリックで閉じる
  useEffect(() => {
    if (!colorPickerEvent) return

    const handleClickOutside = (e: MouseEvent) => {
      // カラーピッカー自体のクリックは無視
      const target = e.target as HTMLElement
      if (target.closest('[data-color-picker]')) {
        return
      }
      setColorPickerEvent(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [colorPickerEvent])

  // クリックスロットを自動でクリアするタイマー
  useEffect(() => {
    if (clickedSlot) {
      const timer = setTimeout(() => {
        setClickedSlot(null)
      }, 500) // 500ms後にクリア
      return () => clearTimeout(timer)
    }
  }, [clickedSlot])

  // Step 5: ドラッグハンドラー
  const handleMouseDown = useCallback((time: string, date: Date) => {
    console.log('🎯 Step 5: Drag started at:', time)
    setIsDragging(true)
    setDragStart(time)
    setDragEnd(time)
    setDragDate(date)
  }, [])

  const handleMouseEnter = useCallback((time: string, date: Date) => {
    if (isDragging && dragDate?.toDateString() === date.toDateString()) {
      setDragEnd(time)
    }
  }, [isDragging, dragDate])

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd && dragDate) {
      console.log('🎯 Step 5: Drag ended:', { dragStart, dragEnd })
      
      // 開始時刻と終了時刻を正しく設定
      const [startHours, startMinutes] = dragStart.split(':').map(Number)
      const [endHours, endMinutes] = dragEnd.split(':').map(Number)
      
      const startTotalMinutes = startHours * 60 + startMinutes
      const endTotalMinutes = endHours * 60 + endMinutes
      
      let finalStartTime = dragStart
      let finalEndTime = dragEnd
      
      // ドラッグ方向に関係なく正しい開始・終了時刻を設定
      if (startTotalMinutes > endTotalMinutes) {
        finalStartTime = dragEnd
        finalEndTime = dragStart
      }
      
      // Y位置とボックス高さ計算
      const [fStartHours, fStartMinutes] = finalStartTime.split(':').map(Number)
      const [fEndHours, fEndMinutes] = finalEndTime.split(':').map(Number)
      
      const top = (fStartHours + fStartMinutes / 60) * HOUR_HEIGHT
      const duration = ((fEndHours + fEndMinutes / 60) - (fStartHours + fStartMinutes / 60))
      const height = Math.max(duration * HOUR_HEIGHT, HOUR_HEIGHT / 4) // 最小15分
      
      setNewEvent({
        date: dragDate,
        startTime: finalStartTime,
        endTime: finalEndTime,
        top,
        height
      })
      
      // ドラッグ状態をリセット
      setIsDragging(false)
      setDragStart(null)
      setDragEnd(null)
      setDragDate(null)
      
      // onCreateEvent?.(dragDate, finalStartTime) // ポップアップを削除
    }
  }, [isDragging, dragStart, dragEnd, dragDate, onCreateEvent])

  // Step 3: スロットクリックハンドラー（ドラッグではない場合）
  const handleSlotClick = useCallback((time: string, date: Date) => {
    const [hours, minutes] = time.split(':').map(Number)
    
    // 30分後の終了時間計算
    let endHours = hours
    let endMinutes = minutes + 30
    if (endMinutes >= 60) {
      endHours += 1
      endMinutes = 0
    }
    
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
    
    // Y位置とボックス高さ計算
    const top = (hours + minutes / 60) * HOUR_HEIGHT
    const height = (30 / 60) * HOUR_HEIGHT // 30分 = 0.5時間
    
    console.log('🎯 Step 3: Creating event box at:', { time, endTime, top, height })
    
    setNewEvent({
      date,
      startTime: time,
      endTime,
      top,
      height
    })
    
    // クリックしたスロットも設定
    setClickedSlot({ date, hour: hours, minute: minutes })
    
    // onCreateEvent?.(date, time) // ポップアップを削除
  }, [onCreateEvent])

  // 空き時間クリックハンドラー（既存のコードは残す）
  const handleEmptySlotClick = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    date: Date
  ) => {
    // イベントブロック上のクリックは無視
    if ((e.target as HTMLElement).closest('[data-event-block]')) {
      console.log('❌ イベントブロック上のクリックなので無視')
      return
    }
    
    // Step 7: 背景クリックで選択解除
    setSelectedEventId(null)
    
    // data-time属性から時刻を取得
    const target = e.target as HTMLElement
    const timeString = target.getAttribute('data-time')
    
    if (timeString) {
      handleSlotClick(timeString, date)
    }
  }, [handleSlotClick])

  // 各日付のイベントをフィルタリング
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    
    dates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayEvents = events.filter(event => {
        if (!event.startDate) return false
        const eventDateKey = format(event.startDate, 'yyyy-MM-dd')
        return eventDateKey === dateKey
      }).sort((a, b) => {
        const aTime = a.startDate?.getTime() || 0
        const bTime = b.startDate?.getTime() || 0
        return aTime - bTime
      })
      
      map.set(dateKey, dayEvents)
    })
    
    return map
  }, [dates, events])

  // イベント位置計算
  const calculateEventPosition = (event: CalendarEvent) => {
    if (!event.startDate) {
      return { top: 0, height: HOUR_HEIGHT }
    }

    const hours = event.startDate.getHours()
    const minutes = event.startDate.getMinutes()
    const top = (hours + minutes / 60) * HOUR_HEIGHT

    // 終了時刻がある場合は実際の長さ、ない場合は1時間
    let height = HOUR_HEIGHT
    if (event.endDate) {
      const endHours = event.endDate.getHours()
      const endMinutes = event.endDate.getMinutes()
      const duration = (endHours + endMinutes / 60) - (hours + minutes / 60)
      height = Math.max(duration * HOUR_HEIGHT, 30) // 最小30px
    }

    return { top, height }
  }

  return (
    <div className="flex-1 flex relative bg-background" style={{ height: `${24 * HOUR_HEIGHT}px` }} data-calendar-grid>
      {dates.map((date, index) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const dayEvents = eventsByDate.get(dateKey) || []

        return (
          <div
            key={dateKey}
            className="flex-1 border-r border-border last:border-r-0 relative"
            data-calendar-container
          >
            {/* ドラッグ範囲の表示 */}
            {isDragging && dragStart && dragEnd && dragDate?.toDateString() === date.toDateString() && (() => {
              const [startHours, startMinutes] = dragStart.split(':').map(Number)
              const [endHours, endMinutes] = dragEnd.split(':').map(Number)
              
              const startTotalMinutes = startHours * 60 + startMinutes
              const endTotalMinutes = endHours * 60 + endMinutes
              
              const earlierTime = startTotalMinutes <= endTotalMinutes ? startTotalMinutes : endTotalMinutes
              const laterTime = startTotalMinutes <= endTotalMinutes ? endTotalMinutes : startTotalMinutes
              
              const top = (earlierTime / 60) * HOUR_HEIGHT
              const height = ((laterTime - earlierTime) / 60) * HOUR_HEIGHT
              
              return (
                <div 
                  className="absolute left-0 right-0 bg-blue-200 dark:bg-blue-600 opacity-50 pointer-events-none z-15"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`
                  }}
                />
              )
            })()}

            {/* 15分単位のスロット */}
            <div className="absolute inset-0 cursor-crosshair z-10">
              {Array.from({ length: 96 }, (_, slotIndex) => {
                // 96個のスロット（24時間 × 4）
                const hour = Math.floor(slotIndex / 4)
                const minute = (slotIndex % 4) * 15
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                
                // このスロットがクリックされたかチェック
                const isClicked = clickedSlot && 
                  clickedSlot.date.toDateString() === date.toDateString() && 
                  clickedSlot.hour === hour &&
                  clickedSlot.minute === minute
                
                return (
                  <div
                    key={slotIndex}
                    data-time={timeString}
                    className={`
                      hover:bg-blue-50 dark:hover:bg-blue-900/20
                      transition-colors duration-200
                      ${(slotIndex + 1) % 4 === 0 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                      ${isClicked ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                    `}
                    style={{ height: `${HOUR_HEIGHT / 4}px` }}
                    title={`${timeString} - Click to create event or drag to select range`}
                    onMouseDown={() => handleMouseDown(timeString, date)}
                    onMouseEnter={() => handleMouseEnter(timeString, date)}
                    onMouseUp={handleMouseUp}
                    onClick={(e) => {
                      // ドラッグ中でない場合のみクリック処理
                      if (!isDragging) {
                        handleEmptySlotClick(e, date)
                      }
                    }}
                  />
                )
              })}
            </div>

            {/* 新しい予定ボックス */}
            {newEvent && newEvent.date.toDateString() === date.toDateString() && (
              <div 
                className="absolute left-1 right-1 bg-blue-500 text-white p-1 rounded shadow-md z-30"
                style={{
                  top: `${newEvent.top}px`,
                  height: `${newEvent.height}px`
                }}
              >
                <input
                  type="text"
                  className="w-full bg-transparent text-white placeholder-blue-100 outline-none text-xs font-medium"
                  placeholder="予定を追加"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Step 6: 保存処理
                      const title = e.currentTarget.value.trim()
                      if (title && newEvent) {
                        const newEventData = {
                          id: Date.now().toString(),
                          title,
                          startTime: newEvent.startTime,
                          endTime: newEvent.endTime,
                          date: newEvent.date.toDateString(),
                          color: '#3b82f6'
                        }
                        setSavedEvents(prev => [...prev, newEventData])
                        console.log('🎯 Step 6: 予定を保存:', newEventData)
                      }
                      setNewEvent(null)
                    } else if (e.key === 'Escape') {
                      // キャンセル
                      console.log('🎯 Step 6: キャンセル')
                      setNewEvent(null)
                    }
                  }}
                />
                <div className="text-xs opacity-90 mt-1">
                  {newEvent.startTime} - {newEvent.endTime}
                </div>
              </div>
            )}

            {/* Step 6: 保存された予定の表示 */}
            {savedEvents
              .filter(event => event.date === date.toDateString())
              .map((event, index) => {
                const { top, height } = calculatePositionFromTime(event.startTime, event.endTime)
                
                // 同じ時間帯の他の予定をチェック（重複対応）
                const overlappingEvents = savedEvents.filter(otherEvent => 
                  otherEvent.date === event.date && 
                  otherEvent.id !== event.id &&
                  otherEvent.startTime < event.endTime && 
                  otherEvent.endTime > event.startTime
                )
                
                const overlapCount = overlappingEvents.length + 1
                const eventIndex = overlappingEvents.findIndex(e => e.id < event.id)
                const leftOffset = eventIndex >= 0 ? (eventIndex + 1) * (100 / overlapCount) : 0
                const width = 100 / overlapCount
                
                return (
                  <div
                    key={event.id}
                    className={`absolute px-1 text-white text-xs rounded cursor-move hover:opacity-90 transition-all duration-200 z-25 ${selectedEventId === event.id ? 'ring-2 ring-white shadow-lg' : ''} ${draggingEventId === event.id ? 'opacity-50' : ''}`}
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, 20)}px`, // 最小20px
                      left: `${leftOffset}%`,
                      width: `${width}%`,
                      backgroundColor: event.color
                    }}
                    title={`${event.title} (${event.startTime} - ${event.endTime})`}
                    onMouseDown={(e) => {
                      // Step 8: ドラッグ開始
                      if (e.button === 0) { // 左クリックのみ
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('🎯 Step 8: ドラッグ開始:', event)
                        setDraggingEventId(event.id)
                        
                        // カレンダー全体の位置を取得
                        const calendarGrid = document.querySelector('[data-calendar-grid]') as HTMLElement
                        if (calendarGrid) {
                          const gridRect = calendarGrid.getBoundingClientRect()
                          // マウスのY座標からカレンダーグリッド上端までの距離
                          setDragOffset(e.clientY - gridRect.top)
                          console.log('🎯 Step 8: ドラッグオフセット設定:', e.clientY - gridRect.top)
                        }
                        
                        // 選択状態も設定
                        setSelectedEventId(event.id)
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // ドラッグ中でない場合のみ選択処理
                      if (!draggingEventId) {
                        console.log('🎯 Step 7: 予定選択:', event)
                        setSelectedEventId(selectedEventId === event.id ? null : event.id)
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('🎯 Step 10: カラーピッカー表示:', event)
                      setColorPickerEvent({
                        id: event.id,
                        x: e.clientX,
                        y: e.clientY
                      })
                    }}
                  >
                    <div className="font-medium truncate">
                      {event.title}
                    </div>
                    {height > 30 && (
                      <div className="text-xs opacity-80 truncate">
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
                    
                    {/* Step 9: リサイズハンドル */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors duration-200"
                      title="Drag to resize duration"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        console.log('🎯 Step 9: リサイズ開始:', event)
                        setResizingEvent({
                          id: event.id,
                          initialEndTime: event.endTime,
                          startY: e.clientY
                        })
                      }}
                    />
                  </div>
                )
              })}

            {/* Step 8: ドラッグ中のゴースト表示 */}
            {draggingEventId && dragPreviewPosition && (() => {
              const draggingEvent = savedEvents.find(e => e.id === draggingEventId)
              if (!draggingEvent || draggingEvent.date !== date.toDateString()) return null

              const { height } = calculatePositionFromTime(draggingEvent.startTime, draggingEvent.endTime)
              
              return (
                <div 
                  className="absolute left-0 right-0 px-1 text-white text-xs rounded pointer-events-none z-30 opacity-70 border-2 border-white"
                  style={{
                    top: `${dragPreviewPosition.top}px`,
                    height: `${Math.max(height, 20)}px`,
                    backgroundColor: draggingEvent.color
                  }}
                >
                  <div className="font-medium truncate">
                    {draggingEvent.title}
                  </div>
                  {height > 30 && (
                    <div className="text-xs opacity-80 truncate">
                      {dragPreviewPosition.startTime} - {dragPreviewPosition.endTime}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* イベント表示 */}
            {dayEvents.map((event) => {
              if (!event.startDate) return null

              const { top, height } = calculateEventPosition(event)
              const eventColor = event.color || '#3b82f6'

              return (
                <div
                  key={event.id}
                  data-event-block
                  className="absolute rounded-md cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 z-20"
                  style={{
                    left: '4px',
                    right: '4px',
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: eventColor
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick?.(event)
                  }}
                >
                  <div className="p-2 h-full overflow-hidden text-white">
                    <div className="flex flex-col h-full">
                      <div className="flex-1 min-h-0">
                        {/* タイトル */}
                        <div className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                          {event.title}
                        </div>
                        
                        {/* 時間（高さが十分な場合のみ） */}
                        {height > 40 && (
                          <div className="text-xs opacity-90 leading-tight">
                            {format(event.startDate, 'HH:mm')}
                            {event.endDate && ` - ${format(event.endDate, 'HH:mm')}`}
                          </div>
                        )}
                      </div>
                      
                      {/* 場所（高さが十分な場合のみ） */}
                      {event.location && height > 70 && (
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
      
      {/* Step 10: カラーピッカー */}
      {colorPickerEvent && (
        <div
          data-color-picker
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50"
          style={{
            left: Math.min(colorPickerEvent.x, window.innerWidth - 200), // 画面端を超えないように調整
            top: Math.min(colorPickerEvent.y, window.innerHeight - 120)
          }}
        >
          <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            予定の色を選択
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map(color => {
              const currentEvent = savedEvents.find(e => e.id === colorPickerEvent.id)
              const isSelected = currentEvent?.color === color
              
              return (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-md hover:scale-110 transition-transform duration-200 ${
                    isSelected ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                  onClick={() => {
                    console.log('🎯 Step 10: 色変更:', { eventId: colorPickerEvent.id, newColor: color })
                    setSavedEvents(prev => prev.map(evt =>
                      evt.id === colorPickerEvent.id
                        ? { ...evt, color }
                        : evt
                    ))
                    setColorPickerEvent(null)
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// メインコンポーネント
export function PureCalendarLayout({ dates, events, onCreateEvent, onEventClick }: PureCalendarLayoutProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-full overflow-y-auto">
        {/* 時間軸ラベル */}
        <TimeAxisLabels />
        
        {/* カレンダーグリッド */}
        <CalendarGrid 
          dates={dates} 
          events={events}
          onCreateEvent={onCreateEvent}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  )
}