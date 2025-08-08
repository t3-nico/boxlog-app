'use client'

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { format, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/events'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationDisplay } from '@/components/ui/notification-display'

// Step 21: Tag interface
interface Tag {
  id: string
  name: string
  color: string
}

// 定数定義 - 他のコンポーネントと統一
const HOUR_HEIGHT = 48 // 1時間の高さ（px）- FullDayCalendarLayoutと統一
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
  
  // Step 24: スムーズドラッグ用の追加state
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
  
  // Step 24改: Googleカレンダー風ドラッグUX用state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [draggedEventDimensions, setDraggedEventDimensions] = useState({ width: 0, height: 0 })
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [snapTargetTime, setSnapTargetTime] = useState<{ hours: number; minutes: number } | null>(null)
  const draggedEventRef = useRef<HTMLDivElement>(null)

  // Step 12: 繰り返し設定を含む予定の型定義
  interface RecurringEvent {
    id: string
    title: string
    startTime: string
    endTime: string
    date: string
    color: string
    tagIds?: string[] // Step 21: 複数タグのID配列
    memo?: string // Step 16: メモ欄を追加
    reminders?: Array<{id: string, type: 'notification', minutesBefore: number, isTriggered?: boolean}> // Step 23: リマインダー
    recurrence?: {
      type: 'daily' | 'weekly' | 'monthly'
      until: string // 終了日 "YYYY-MM-DD"
    }
  }

  // Step 6: 保存された予定のstate
  const [savedEvents, setSavedEvents] = useState<RecurringEvent[]>([])

  // Step 21: タグ機能のstate
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Important', color: '#ef4444' },
    { id: '2', name: 'Meeting', color: '#3b82f6' },
    { id: '3', name: 'Work', color: '#10b981' },
    { id: '4', name: 'Break', color: '#8b5cf6' },
    { id: '5', name: 'Learning', color: '#f59e0b' },
  ])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR')
  const [newEventTags, setNewEventTags] = useState<string[]>([])
  const [showTagModal, setShowTagModal] = useState(false)

  // Step 7: 選択状態の管理
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Step 8: 予定ドラッグ状態の管理
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{ top: number; startTime: string; endTime: string } | null>(null)
  // Step 24: 日付間ドラッグ用の状態
  const [dragTargetDate, setDragTargetDate] = useState<Date | null>(null)
  const [originalDate, setOriginalDate] = useState<Date | null>(null)
  
  // Step 18: コピー・ペースト用のstate
  const [copiedEvent, setCopiedEvent] = useState<RecurringEvent | null>(null)
  const [draggedTime, setDraggedTime] = useState<{ start: string; end: string } | null>(null)
  
  // Step 20: 複製とリサイズ用のstate
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [adjustingStart, setAdjustingStart] = useState<{
    id: string
    initialStartTime: string
    initialEndTime: string
    startY: number
  } | null>(null)

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


  // Step 15: 現在時刻の管理
  const [currentTime, setCurrentTime] = useState(new Date())

  // Step 16: 編集モーダル用のstate
  const [editingEvent, setEditingEvent] = useState<RecurringEvent | null>(null)

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

  // Step 12: 繰り返し予定の生成関数
  const generateRecurringEvents = useCallback((baseEvent: RecurringEvent): RecurringEvent[] => {
    if (!baseEvent.recurrence) return [baseEvent]
    
    const events: RecurringEvent[] = []
    const startDate = new Date(baseEvent.date)
    const endDate = new Date(baseEvent.recurrence.until)
    
    let currentDate = new Date(startDate)
    let iterationCount = 0
    
    while (currentDate <= endDate && iterationCount < 365) { // 安全制限: 最大365回
      events.push({
        ...baseEvent,
        id: `${baseEvent.id}_${currentDate.toISOString().split('T')[0]}`,
        date: currentDate.toISOString().split('T')[0]
      })
      
      // 次の日付を計算
      switch (baseEvent.recurrence.type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
      }
      
      iterationCount++
    }
    
    return events
  }, [])

  // Step 21: タグフィルタリング機能
  const getFilteredEvents = useCallback((events: RecurringEvent[]) => {
    if (selectedTags.length === 0) return events
    
    return events.filter(event => {
      if (!event.tagIds || event.tagIds.length === 0) {
        return false
      }
      
      if (tagFilterMode === 'AND') {
        // すべてのタグを含む
        return selectedTags.every(tagId => event.tagIds?.includes(tagId))
      } else {
        // いずれかのタグを含む
        return selectedTags.some(tagId => event.tagIds?.includes(tagId))
      }
    })
  }, [selectedTags, tagFilterMode])

  // Step 12: 全ての予定（繰り返し含む）を展開してフィルタリング
  const expandedEvents = useMemo(() => {
    const expanded = savedEvents.flatMap(event => generateRecurringEvents(event))
    const filtered = getFilteredEvents(expanded)
    console.log('🎯 Step 21 Debug: expandedEvents生成とフィルタリング:', {
      savedEventsCount: savedEvents.length,
      expandedEventsCount: expanded.length,
      filteredEventsCount: filtered.length,
      selectedTags,
      tagFilterMode
    })
    return filtered
  }, [savedEvents, generateRecurringEvents, getFilteredEvents])

  // Step 15: 現在時刻の更新（1分ごと）
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 60秒ごと
    
    return () => clearInterval(timer)
  }, [])

  // Step 15: 現在時刻の位置計算
  const getCurrentTimePosition = useCallback(() => {
    const now = currentTime
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    // HOUR_HEIGHT = 80px なので、1分あたり 80/60 = 4/3 px
    return (hours * 60 + minutes) * (HOUR_HEIGHT / 60)
  }, [currentTime])

  // Step 15: 今日かどうかの判定
  const isToday = useCallback((date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }, [])

  // Step 16: 時間変換ヘルパー関数
  const timeStringToMinutes = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }, [])

  const minutesToTimeString = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
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
          // 繰り返し予定の場合、ベースIDで削除
          const baseEventId = selectedEventId.split('_')[0]
          setSavedEvents(prev => prev.filter(event => event.id !== baseEventId))
          setSelectedEventId(null)
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Step 18: コピー (Ctrl+C / Cmd+C)
        if (selectedEventId) {
          e.preventDefault()
          const baseEventId = selectedEventId.split('_')[0]
          const eventToCopy = savedEvents.find(event => event.id === baseEventId)
          if (eventToCopy) {
            setCopiedEvent(eventToCopy)
            console.log('📋 Step 18: 予定をコピー:', eventToCopy.title)
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Step 18: ペースト (Ctrl+V / Cmd+V)
        if (copiedEvent && clickedSlot) {
          e.preventDefault()
          const newId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const selectedDate = clickedSlot.date.toISOString().split('T')[0]
          
          const pastedEvent: RecurringEvent = {
            ...copiedEvent,
            id: newId,
            date: selectedDate
          }
          
          setSavedEvents(prev => [...prev, pastedEvent])
          console.log('📋 Step 18: 予定をペースト:', pastedEvent.title, 'to', selectedDate)
        }
      } else if (e.key === 'Escape') {
        // Escで選択解除
        setSelectedEventId(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedEventId])
  
  // Step 20: 開始時刻変更の処理
  useEffect(() => {
    if (!adjustingStart) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - adjustingStart.startY
      const deltaMinutes = Math.round(deltaY / (HOUR_HEIGHT / 4)) * 15 // 15分単位
      
      const [startHour, startMinute] = adjustingStart.initialStartTime.split(':').map(Number)
      const [endHour, endMinute] = adjustingStart.initialEndTime.split(':').map(Number)
      
      let newStartMinutes = startHour * 60 + startMinute + deltaMinutes
      
      // 0:00～23:45の範囲に制限
      newStartMinutes = Math.max(0, Math.min(newStartMinutes, 23 * 60 + 45))
      
      const newStartHour = Math.floor(newStartMinutes / 60)
      const newStartMin = newStartMinutes % 60
      const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMin).padStart(2, '0')}`
      
      // 終了時刻は固定で、開始時刻が終了時刻を超えないようにする
      const endMinutes = endHour * 60 + endMinute
      if (newStartMinutes >= endMinutes) {
        // 開始時刻が終了時刻を超える場合は、開始時刻を終了時刻の15分前に設定
        const adjustedStartMinutes = Math.max(0, endMinutes - 15)
        const adjustedStartHour = Math.floor(adjustedStartMinutes / 60)
        const adjustedStartMin = adjustedStartMinutes % 60
        const adjustedStartTime = `${String(adjustedStartHour).padStart(2, '0')}:${String(adjustedStartMin).padStart(2, '0')}`
        
        setSavedEvents(prev => prev.map(evt => 
          evt.id === adjustingStart.id 
            ? { ...evt, startTime: adjustedStartTime }
            : evt
        ))
        return
      }
      
      setSavedEvents(prev => prev.map(evt => 
        evt.id === adjustingStart.id 
          ? { ...evt, startTime: newStartTime }
          : evt
      ))
    }
    
    const handleMouseUp = () => {
      setAdjustingStart(null)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [adjustingStart])

  // Step 24改: Googleカレンダー風スナップ関数
  const snapToQuarter = useCallback((minutes: number) => {
    const target = Math.round(minutes / 15) * 15
    const diff = target - minutes
    // 近づいたら磁石のように引き寄せる
    if (Math.abs(diff) < 5) {
      return target
    }
    return minutes
  }, [])

  // Step 24: マウス移動ハンドラーをuseCallbackで定義
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingEventId) return

    // Step 24改: マウス位置の即座更新
    setMousePosition({ x: e.clientX, y: e.clientY })

    // Step 24改: スナップ機能 - 安定化した15分単位のターゲット時刻計算
    try {
      const container = document.querySelector('[data-calendar-grid]') as HTMLElement
      const scrollContainer = container?.closest('.overflow-y-auto') as HTMLElement
      
      if (container && scrollContainer) {
        const containerRect = container.getBoundingClientRect()
        const scrollTop = scrollContainer.scrollTop || 0
        const relativeY = (e.clientY - containerRect.top + scrollTop)
        
        // より安定した計算
        if (relativeY >= 0) {
          const totalMinutes = (relativeY / HOUR_HEIGHT) * 60
          const snappedMinutes = Math.max(0, Math.min(1440, snapToQuarter(totalMinutes))) // 0-1440分の範囲制限
          const hours = Math.floor(snappedMinutes / 60)
          const minutes = Math.floor(snappedMinutes % 60)
          
          if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
            setSnapTargetTime({ hours, minutes })
          } else {
            setSnapTargetTime(null) // 無効な時刻の場合はnullに設定
          }
        }
      }
    } catch (error) {
      console.warn('スナップ計算エラー:', error)
      setSnapTargetTime(null)
    }

    // Step 24: パフォーマンス最適化 - フレーム単位での更新制限
    const now = performance.now()
    if (now - lastUpdateTime < 16) return // 60fps制限
    setLastUpdateTime(now)

    try {
      // カレンダーコンテナを正確に特定
      const calendarContainer = document.querySelector('[data-calendar-container]') as HTMLElement
      if (!calendarContainer) {
        console.log('🎯 Step 8: カレンダーコンテナが見つからない')
        return
      }

      const containerRect = calendarContainer.getBoundingClientRect()
      const scrollContainer = calendarContainer.closest('.overflow-y-auto') as HTMLElement
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0
      
      // Step 24: より精密な横方向（日付）のドラッグ検知
      const relativeX = e.clientX - containerRect.left - TIME_AXIS_WIDTH
      const availableWidth = containerRect.width - TIME_AXIS_WIDTH
      const columnWidth = availableWidth / dates.length
      
      // より滑らかな計算 - 境界での動作を改善
      let targetColumnIndex = Math.floor(relativeX / columnWidth)
      // 範囲制限をより丁寧に
      targetColumnIndex = Math.max(0, Math.min(dates.length - 1, targetColumnIndex))
      
      const targetDate = dates[targetColumnIndex]
      
      // Step 24: スムーズな状態更新
      requestAnimationFrame(() => {
        if (targetDate && (!dragTargetDate || dragTargetDate.toDateString() !== targetDate.toDateString())) {
          setIsTransitioning(true)
          setDragTargetDate(targetDate)
          // 短時間後にトランジション状態をクリア
          setTimeout(() => setIsTransitioning(false), 150)
        }
      })

      // マウス位置から相対座標を計算
      const relativeY = Math.max(0, e.clientY - containerRect.top + scrollTop)
      
      // Step 24改: スマートスナップ機能
      const rawMinutes = (relativeY / HOUR_HEIGHT) * 60
      const snappedMinutes = snapToQuarter(rawMinutes)
      const totalMinutes = Math.max(0, Math.min(24 * 60 - 15, snappedMinutes))
      const newHour = Math.floor(totalMinutes / 60)
      const newMinute = totalMinutes % 60
      
      // スナップターゲット時刻を設定
      setSnapTargetTime({ hours: newHour, minutes: newMinute })
      
      // Step 24改: カーソル変更
      if (targetDate && originalDate) {
        const isDifferentDay = targetDate.toDateString() !== originalDate.toDateString()
        document.body.style.cursor = isDifferentDay ? 'copy' : 'move'
      }

      // Step 24: デバッグログの頻度制限（パフォーマンス向上）
      if (now % 200 < 16) { // 約5分の1の頻度でログ出力
        console.log('🎯 Step 8 正確な座標:', {
          mouseY: e.clientY,
          containerTop: containerRect.top,
          scrollTop,
          relativeY,
          totalMinutes,
          newTime: `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
        })
      }

      if (newHour >= 0 && newHour < 24) {
        const draggingEvent = expandedEvents.find(e => e.id === draggingEventId)
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
    } catch (error) {
      console.warn('🎯 Step 8: マウス移動エラー:', error)
    }
  }, [draggingEventId, dragTargetDate, lastUpdateTime, dates, originalDate, expandedEvents])

  // Step 24: マウスアップハンドラーをuseCallbackで定義
  const handleMouseUp = useCallback(() => {
    console.log('🎯 Step 24: ドラッグ完了検出!', { 
      draggingEventId, 
      draggedTime, 
      originalDate: originalDate?.toLocaleDateString('ja-JP'),
      targetDate: dragTargetDate?.toLocaleDateString('ja-JP'),
      isDateChanged: dragTargetDate && originalDate && dragTargetDate.toDateString() !== originalDate.toDateString()
    })
    
    // 🔧 修正: draggedTimeを使って実際に予定を更新
    if (draggingEventId && draggedTime) {
      console.log('🎯 Step 8: 予定移動完了:', { 
        eventId: draggingEventId, 
        newTime: `${draggedTime.start} - ${draggedTime.end}` 
      })
      
      // Step 24: 日付変更の処理を追加
      const draggingEvent = expandedEvents.find(e => e.id === draggingEventId)
      if (draggingEvent && dragTargetDate && originalDate) {
        const isDifferentDay = dragTargetDate.toDateString() !== originalDate.toDateString()
        
        if (isDifferentDay) {
          console.log('🏷️ Step 24: 日付変更を実行:', {
            eventTitle: draggingEvent.title,
            originalDate: originalDate.toDateString(),
            targetDate: dragTargetDate.toDateString(),
            newTime: `${draggedTime.start} - ${draggedTime.end}`
          })
          
          // 新しい日付をYYYY-MM-DD形式に変換
          const newDateString = `${dragTargetDate.getFullYear()}-${String(dragTargetDate.getMonth() + 1).padStart(2, '0')}-${String(dragTargetDate.getDate()).padStart(2, '0')}`
          
          // 実際に予定を更新（日付と時間の両方）
          const baseEventId = draggingEventId.split('_')[0]
          setSavedEvents(prev => prev.map(event => 
            event.id === baseEventId 
              ? { 
                  ...event, 
                  date: newDateString,  // Step 24: 日付を変更
                  startTime: draggedTime.start,
                  endTime: draggedTime.end
                }
              : event
          ))
        } else {
          // 同じ日内での時間変更のみ
          const baseEventId = draggingEventId.split('_')[0]
          setSavedEvents(prev => prev.map(event => 
            event.id === baseEventId 
              ? { 
                  ...event, 
                  startTime: draggedTime.start,
                  endTime: draggedTime.end
                }
              : event
          ))
        }
      } else {
        // フォールバック: 時間のみ変更
        const baseEventId = draggingEventId.split('_')[0]
        setSavedEvents(prev => prev.map(event => 
          event.id === baseEventId 
            ? { 
                ...event, 
                startTime: draggedTime.start,
                endTime: draggedTime.end
              }
            : event
        ))
      }
    } else {
      console.log('🎯 Step 8: 更新条件が満たされていません', { draggingEventId, draggedTime })
    }
    
    // Step 5: 新しい予定作成の処理（ドラッグ範囲選択時）
    if (isDragging && dragStart && dragEnd && dragDate) {
      console.log('🎯 Step 5: 新しい予定作成:', { dragStart, dragEnd })
      
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
    }
    
    // Step 24: ドラッグ状態をリセット
    setDraggingEventId(null)
    setDragOffset(0)
    setDragPreviewPosition(null)
    setDraggedTime(null)
    setDragTargetDate(null)  // Step 24: 追加
    setOriginalDate(null)    // Step 24: 追加
    
    // Step 24改: Googleカレンダー風UX状態をリセット
    setMousePosition({ x: 0, y: 0 })
    setDraggedEventDimensions({ width: 0, height: 0 })
    setHoveredDate(null)
    setSnapTargetTime(null)
    document.body.style.cursor = 'default'
    
    // Step 20: 複製完了処理
    if (isDuplicating) {
      setTimeout(() => {
        setIsDuplicating(false)
        console.log('🎯 Step 20: 複製完了')
      }, 100)
    }
  }, [draggingEventId, draggedTime, dragTargetDate, originalDate, expandedEvents, isDuplicating, setSavedEvents, isDragging, dragStart, dragEnd, dragDate])

  // Step 8: グローバルなマウス移動・終了処理
  useEffect(() => {
    if (!draggingEventId) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingEventId, handleMouseMove, handleMouseUp])

  // Step 24改: Escキーでドラッグキャンセル
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draggingEventId) {
        console.log('🎯 Step 24改: Escキーでドラッグキャンセル')
        // 状態を完全にリセット
        setDraggingEventId(null)
        setDragOffset(0)
        setDragPreviewPosition(null)
        setDraggedTime(null)
        setDragTargetDate(null)
        setOriginalDate(null)
        setMousePosition({ x: 0, y: 0 })
        setDraggedEventDimensions({ width: 0, height: 0 })
        setHoveredDate(null)
        setSnapTargetTime(null)
        document.body.style.cursor = 'default'
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [draggingEventId])

  // Step 9: リサイズ処理
  useEffect(() => {
    if (!resizingEvent) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizingEvent.startY
      const deltaMinutes = Math.round(deltaY / (HOUR_HEIGHT / 4)) * 15 // 15分単位でスナップ

      const resizingEventData = expandedEvents.find(evt => evt.id === resizingEvent.id)
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

      // 予定を更新（繰り返し予定の場合、ベースイベントを更新）
      const baseEventId = resizingEvent.id.split('_')[0]
      setSavedEvents(prev => prev.map(evt => 
        evt.id === baseEventId 
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

  // Step 5用のマウスアップ処理は、メインの handleMouseUp に統合済み

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
    <div 
      className="flex-1 grid relative bg-background" 
      style={{ 
        height: `${24 * HOUR_HEIGHT}px`,
        gridTemplateColumns: `repeat(${dates.length}, 1fr)`
      }} 
      data-calendar-grid
    >
      {dates.map((date, index) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const dayEvents = eventsByDate.get(dateKey) || []

        return (
          <div
            key={dateKey}
            className={cn(
              "border-r border-border last:border-r-0 relative transition-all ease-out transform-gpu",
              isTransitioning ? 'duration-100' : 'duration-300',
              // Step 24改: Googleカレンダー風ドロップゾーン
              draggingEventId && {
                // ホバー中の日付
                'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-blue-400': 
                  hoveredDate?.toDateString() === date.toDateString(),
                // 移動先ハイライト
                'bg-blue-50 dark:bg-blue-900/40 border-l-2 border-r-2 border-blue-400 dark:border-blue-400 shadow-inner scale-[1.01]': 
                  dragTargetDate?.toDateString() === date.toDateString() && 
                  dragTargetDate.toDateString() !== originalDate?.toDateString(),
                // 同日移動時
                'bg-blue-25 dark:bg-blue-900/15': 
                  dragTargetDate?.toDateString() === date.toDateString() &&
                  dragTargetDate.toDateString() === originalDate?.toDateString(),
                // 移動元を薄く表示
                'bg-gray-100 dark:bg-gray-800/60 opacity-80 scale-[0.99]': 
                  originalDate?.toDateString() === date.toDateString() &&
                  dragTargetDate?.toDateString() !== originalDate.toDateString()
              }
            )}
            data-calendar-container
            onMouseEnter={() => draggingEventId && setHoveredDate(date)}
            onMouseLeave={() => draggingEventId && setHoveredDate(null)}
          >
            {/* Step 24改: ドロップゾーンインジケーター */}
            {draggingEventId && hoveredDate?.toDateString() === date.toDateString() && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse z-40" />
            )}
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
                // 96個のスロット（24時間 × 4）0:00-23:45
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
                  placeholder="Add event"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Step 6: 保存処理
                      const title = e.currentTarget.value.trim()
                      if (title && newEvent) {
                        const newEventData: RecurringEvent = {
                          id: Date.now().toString(),
                          title,
                          startTime: newEvent.startTime,
                          endTime: newEvent.endTime,
                          date: `${newEvent.date.getFullYear()}-${String(newEvent.date.getMonth() + 1).padStart(2, '0')}-${String(newEvent.date.getDate()).padStart(2, '0')}`, // ローカル日付でYYYY-MM-DD形式
                          color: '#3b82f6',
                          tagIds: newEventTags
                        }
                        setSavedEvents(prev => [...prev, newEventData])
                        console.log('🎯 Step 6: 予定を保存:', newEventData)
                      }
                      setNewEvent(null)
                      setNewEventTags([])
                    } else if (e.key === 'Escape') {
                      // キャンセル
                      console.log('🎯 Step 6: Cancel')
                      setNewEvent(null)
                      setNewEventTags([])
                    }
                  }}
                />
                <div className="text-xs opacity-90 mt-1">
                  {newEvent.startTime} - {newEvent.endTime}
                </div>
                
                {/* Step 21: タグ選択UI */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => {
                    const isSelected = newEventTags.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          setNewEventTags(prev =>
                            isSelected
                              ? prev.filter(id => id !== tag.id)
                              : [...prev, tag.id]
                          )
                        }}
                        className={`
                          px-2 py-1 text-[10px] rounded transition-all
                          ${isSelected
                            ? 'text-white'
                            : 'bg-white/20 hover:bg-white/30'
                          }
                        `}
                        style={{
                          backgroundColor: isSelected ? tag.color : undefined
                        }}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 6: 保存された予定の表示（繰り返し含む） */}
            {expandedEvents
              .filter(event => {
                // 日付形式を統一して比較
                const eventDateString = new Date(event.date).toDateString()
                const targetDateString = date.toDateString()
                return eventDateString === targetDateString
              })
              .map((event, index) => {
                const { top, height } = calculatePositionFromTime(event.startTime, event.endTime)
                
                // 同じ時間帯の他の予定をチェック（重複対応）
                const overlappingEvents = expandedEvents.filter(otherEvent => {
                  const otherEventDateString = new Date(otherEvent.date).toDateString()
                  const currentEventDateString = new Date(event.date).toDateString()
                  return otherEventDateString === currentEventDateString && 
                    otherEvent.id !== event.id &&
                    otherEvent.startTime < event.endTime && 
                    otherEvent.endTime > event.startTime
                })
                
                const overlapCount = overlappingEvents.length + 1
                const eventIndex = overlappingEvents.findIndex(e => e.id < event.id)
                const leftOffset = eventIndex >= 0 ? (eventIndex + 1) * (100 / overlapCount) : 0
                const width = 100 / overlapCount
                
                return (
                  <div
                    key={event.id}
                    className={`absolute px-1 text-white text-xs rounded cursor-move hover:opacity-90 transition-all ease-out transform-gpu z-25 ${
                      isTransitioning && draggingEventId === event.id ? 'duration-100' : 'duration-300'
                    } ${
                      selectedEventId === event.id.split('_')[0] ? 'ring-2 ring-white shadow-lg' : ''
                    } ${
                      // Step 24: ドラッグ中の元の予定表示を改善
                      draggingEventId === event.id 
                        ? dragTargetDate && originalDate && dragTargetDate.toDateString() !== originalDate.toDateString()
                          ? 'opacity-15 scale-95 blur-[0.5px]' // 日付移動中は大幅に透明化+軽いブラー
                          : 'opacity-60 scale-98' // 同日内移動時も軽くスケール
                        : ''
                    } ${
                      isDuplicating && draggingEventId === event.id ? 'ring-2 ring-green-400 shadow-lg' : ''
                    }`}
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
                        
                        // Step 24: originalDateを設定
                        setOriginalDate(date)
                        setDragTargetDate(date) // 初期値として現在の日付を設定
                        console.log('🏷️ Step 24: ドラッグ開始時の日付設定:', {
                          eventTitle: event.title,
                          originalDate: date.toDateString()
                        })
                        
                        // Step 24改: Googleカレンダー風UX - マウス位置とイベントサイズを安全に記録
                        try {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMousePosition({ x: e.clientX, y: e.clientY })
                          setDraggedEventDimensions({ 
                            width: Math.max(100, rect.width || 100),  // 最小幅確保
                            height: Math.max(20, rect.height || 20)   // 最小高さ確保
                          })
                          document.body.style.cursor = e.altKey ? 'copy' : 'grabbing'
                        } catch (error) {
                          console.warn('ドラッグ開始時エラー:', error)
                          // フォールバック値を設定
                          setMousePosition({ x: e.clientX, y: e.clientY })
                          setDraggedEventDimensions({ width: 150, height: 25 })
                          document.body.style.cursor = 'grabbing'
                        }
                        
                        // Step 20: Altキーが押されている場合は複製モード
                        if (e.altKey) {
                          console.log('🎯 Step 20: 複製モード開始:', event)
                          const newEventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                          const duplicatedEvent: RecurringEvent = {
                            ...event,
                            id: newEventId,
                            title: event.title + ' (Copy)'
                          }
                          setSavedEvents(prev => [...prev, duplicatedEvent])
                          setDraggingEventId(duplicatedEvent.id)
                          setIsDuplicating(true)
                        } else {
                          console.log('🎯 Step 8: ドラッグ開始:', event)
                          setDraggingEventId(event.id)
                          setIsDuplicating(false)
                        }
                        
                        // カレンダー全体の位置を取得
                        const calendarGrid = document.querySelector('[data-calendar-grid]') as HTMLElement
                        if (calendarGrid) {
                          const gridRect = calendarGrid.getBoundingClientRect()
                          // マウスのY座標からカレンダーグリッド上端までの距離
                          setDragOffset(e.clientY - gridRect.top)
                          console.log('🎯 Step 8: ドラッグオフセット設定:', e.clientY - gridRect.top)
                        }
                        
                        // 選択状態も設定
                        // 繰り返し予定の場合、ベースイベントIDを使用
                        const baseEventId = event.id.split('_')[0]
                        setSelectedEventId(baseEventId)
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // ドラッグ中でない場合のみ選択処理
                      if (!draggingEventId) {
                        const baseEventId = event.id.split('_')[0]
                        console.log('🎯 Step 7: 予定選択:', { 
                          clickedEvent: event, 
                          baseEventId,
                          currentSelected: selectedEventId 
                        })
                        setSelectedEventId(selectedEventId === baseEventId ? null : baseEventId)
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      // ダブルクリックで編集モーダル表示
                      console.log('🎯 Step 16: 編集モーダル表示:', event)
                      const baseEventId = event.id.split('_')[0]
                      const baseEvent = savedEvents.find(e => e.id === baseEventId)
                      if (baseEvent) {
                        setEditingEvent(baseEvent)
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
                      {isDuplicating && draggingEventId === event.id && (
                        <span className="ml-1 text-xs opacity-75">(Duplicating)</span>
                      )}
                    </div>
                    {height > 30 && (
                      <div className="text-xs opacity-80 truncate">
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
                    
                    {/* Step 21: Tag badges */}
                    {event.tagIds && event.tagIds.length > 0 && height > 50 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.tagIds.slice(0, 3).map(tagId => {
                          const tag = tags.find(t => t.id === tagId)
                          if (!tag) return null
                          return (
                            <span
                              key={tagId}
                              className="inline-block px-1 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: tag.color,
                                fontSize: '10px'
                              }}
                            >
                              {tag.name}
                            </span>
                          )
                        })}
                        {event.tagIds.length > 3 && (
                          <span className="inline-block px-1 py-0.5 rounded text-xs font-medium bg-white/90 text-gray-600" style={{ fontSize: '10px' }}>
                            +{event.tagIds.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Step 21: タグ管理ボタン */}
                    {height > 35 && (
                      <div className="absolute top-1 right-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowTagModal(true)
                            setSelectedEventId(event.id.split('_')[0])
                          }}
                          className="opacity-0 hover:opacity-100 bg-white/20 hover:bg-white/30 rounded px-1 py-0.5 text-xs transition-opacity"
                          title="Manage tags"
                        >
                          🏷️
                        </button>
                      </div>
                    )}
                    
                    {/* Step 20: 上端リサイズハンドル（開始時刻変更） */}
                    <div
                      className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/20 transition-colors duration-200"
                      title="Drag to change start time"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        console.log('🎯 Step 20: 開始時刻変更開始:', event)
                        setAdjustingStart({
                          id: event.id,
                          initialStartTime: event.startTime,
                          initialEndTime: event.endTime,
                          startY: e.clientY
                        })
                      }}
                    />
                    
                    {/* Step 9: 下端リサイズハンドル（終了時刻変更） */}
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

            {/* Step 24: 改善されたドラッグ中のプレビュー表示 */}
            {draggingEventId && dragPreviewPosition && (() => {
              const draggingEvent = expandedEvents.find(e => e.id === draggingEventId)
              if (!draggingEvent) return null
              
              // Step 24: dragTargetDateがある場合は、そのtargetDateと比較
              // ない場合は元の日付と比較（後方互換性）
              let shouldShowPreview = false
              if (dragTargetDate) {
                shouldShowPreview = dragTargetDate.toDateString() === date.toDateString()
              } else {
                // 従来のロジック（同じ日付のみ）
                const draggingEventDateString = new Date(draggingEvent.date).toDateString()
                const targetDateString = date.toDateString()
                shouldShowPreview = draggingEventDateString === targetDateString
              }

              if (!shouldShowPreview) return null

              const { height } = calculatePositionFromTime(draggingEvent.startTime, draggingEvent.endTime)
              
              // Step 24: 日付が変わった場合は異なるスタイル
              const isDateChanged = dragTargetDate && originalDate && 
                dragTargetDate.toDateString() !== originalDate.toDateString()
              
              return (
                <div 
                  className={`absolute left-0 right-0 px-1 text-white text-xs rounded pointer-events-none z-30 transition-all ease-out ${
                    isTransitioning ? 'duration-75' : 'duration-200'
                  } ${
                    isDateChanged 
                      ? 'opacity-90 border-2 border-blue-400 shadow-xl scale-105 transform-gpu' 
                      : 'opacity-70 border-2 border-white'
                  }`}
                  style={{
                    top: `${dragPreviewPosition.top}px`,
                    height: `${Math.max(height, 20)}px`,
                    backgroundColor: draggingEvent.color
                  }}
                >
                  <div className="font-medium truncate">
                    {draggingEvent.title}
                    {isDateChanged && (
                      <span className="ml-1 text-xs opacity-75">→ {dragTargetDate?.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
                    )}
                  </div>
                  {height > 30 && (
                    <div className="text-xs opacity-80 truncate">
                      {dragPreviewPosition.startTime} - {dragPreviewPosition.endTime}
                    </div>
                  )}
                  {isDateChanged && height > 45 && (
                    <div className="text-xs opacity-60 truncate">
                      日付移動中...
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

            {/* Step 15: 現在時刻ライン（今日のみ表示） */}
            {isToday(date) && (
              <>
                {/* 現在時刻の赤いライン */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-red-500 pointer-events-none z-30"
                  style={{
                    top: `${getCurrentTimePosition()}px`
                  }}
                >
                  {/* 左端の赤い丸 */}
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                </div>
                
                {/* 現在時刻の表示 */}
                <div
                  className="absolute left-1 pointer-events-none z-30"
                  style={{
                    top: `${getCurrentTimePosition() - 10}px`
                  }}
                >
                  <span className="bg-gray-800 text-white text-xs px-1 py-0.5 rounded shadow-md">
                    {currentTime.toLocaleTimeString('ja-JP', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </>
            )}
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
            Select event color
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map(color => {
              const baseEventId = colorPickerEvent.id.split('_')[0]
              const currentEvent = savedEvents.find(e => e.id === baseEventId)
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
                    // 繰り返し予定の場合、ベースイベントを更新
                    const baseEventId = colorPickerEvent.id.split('_')[0]
                    setSavedEvents(prev => prev.map(evt =>
                      evt.id === baseEventId
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
      
      
      {/* Step 16: 編集モーダル */}
      {editingEvent && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setEditingEvent(null)}
          />
          
          {/* モーダル本体 */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-96 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Event</h2>
            
            {/* タイトル */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  title: e.target.value
                })}
              />
            </div>
            
            {/* 日付 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editingEvent.date}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  date: e.target.value
                })}
              />
            </div>
            
            {/* 開始時刻と終了時刻 */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editingEvent.startTime}
                  onChange={(e) => setEditingEvent({
                    ...editingEvent,
                    startTime: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editingEvent.endTime}
                  onChange={(e) => setEditingEvent({
                    ...editingEvent,
                    endTime: e.target.value
                  })}
                />
              </div>
            </div>
            
            {/* Repeat */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Repeat</label>
              <div className="space-y-3">
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editingEvent.recurrence?.type || ''}
                  onChange={(e) => {
                    const recurrenceType = e.target.value as 'daily' | 'weekly' | 'monthly' | ''
                    if (recurrenceType) {
                      // デフォルトで30日後を終了日に設定
                      const endDate = new Date()
                      endDate.setDate(endDate.getDate() + 30)
                      const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
                      
                      setEditingEvent({
                        ...editingEvent,
                        recurrence: {
                          type: recurrenceType,
                          until: endDateString
                        }
                      })
                    } else {
                      setEditingEvent({
                        ...editingEvent,
                        recurrence: undefined
                      })
                    }
                  }}
                >
                  <option value="">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                
                {/* 繰り返し終了日設定 */}
                {editingEvent.recurrence && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editingEvent.recurrence.until || ''}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (editingEvent.recurrence) {
                          setEditingEvent({
                            ...editingEvent,
                            recurrence: {
                              ...editingEvent.recurrence,
                              until: e.target.value
                            }
                          })
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* リマインダー */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reminders</label>
              <div className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[44px] flex items-center gap-2 flex-wrap">
                {/* 既存のリマインダーを表示 */}
                {(editingEvent.reminders || []).map((reminder) => (
                  <div key={reminder.id} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm">
                    {reminder.minutesBefore < 60 ? `${reminder.minutesBefore}分前` :
                     reminder.minutesBefore < 1440 ? `${reminder.minutesBefore / 60}時間前` :
                     `${reminder.minutesBefore / 1440}日前`}
                    <button
                      type="button"
                      onClick={() => {
                        const newReminders = (editingEvent.reminders || []).filter(r => r.id !== reminder.id)
                        setEditingEvent({ ...editingEvent, reminders: newReminders })
                      }}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* 追加用ドロップダウン */}
                {(!editingEvent.reminders || editingEvent.reminders.length < 3) && (
                  <select
                    className="text-sm px-2 py-1 border border-dashed border-gray-400 dark:border-gray-500 rounded-md bg-transparent text-gray-600 dark:text-gray-300 hover:border-gray-600 dark:hover:border-gray-400 focus:outline-none focus:border-blue-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        const minutesBefore = parseInt(e.target.value)
                        const newReminder = {
                          id: Math.random().toString(36).substr(2, 9),
                          type: 'notification' as const,
                          minutesBefore,
                          isTriggered: false
                        }
                        const newReminders = [...(editingEvent.reminders || []), newReminder]
                        setEditingEvent({ ...editingEvent, reminders: newReminders })
                        e.target.value = ''
                      }
                    }}
                    value=""
                  >
                    <option value="">+ Add notification</option>
                    {[5, 10, 15, 30, 60, 1440]
                      .filter(preset => !(editingEvent.reminders || []).some(r => r.minutesBefore === preset))
                      .map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes < 60 ? `${minutes}分前` :
                           minutes < 1440 ? `${minutes / 60}時間前` :
                           `${minutes / 1440}日前`}
                        </option>
                      ))}
                  </select>
                )}
                
                {/* 空の状態のプレースホルダー */}
                {(!editingEvent.reminders || editingEvent.reminders.length === 0) && (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">No reminders</span>
                )}
              </div>
            </div>
            
            {/* メモ */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Detailed notes..."
                value={editingEvent.memo || ''}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  memo: e.target.value
                })}
              />
            </div>
            
            {/* Step 21: タグ選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isSelected = editingEvent.tagIds?.includes(tag.id) || false
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const currentTags = editingEvent.tagIds || []
                        const newTags = isSelected
                          ? currentTags.filter(id => id !== tag.id)
                          : [...currentTags, tag.id]
                        setEditingEvent({
                          ...editingEvent,
                          tagIds: newTags
                        })
                      }}
                      className={`
                        px-2 py-1 text-xs rounded transition-all
                        ${isSelected
                          ? 'text-white'
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                        }
                      `}
                      style={{
                        backgroundColor: isSelected ? tag.color : undefined
                      }}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* 色選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Color</label>
              <div className="flex gap-2 flex-wrap">
                {presetColors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded transition-all ${
                      editingEvent.color === color 
                        ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-gray-200 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditingEvent({
                      ...editingEvent,
                      color
                    })}
                  />
                ))}
              </div>
            </div>
            
            {/* ボタン */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // 予定を更新
                  setSavedEvents(prev => prev.map(e => 
                    e.id === editingEvent.id ? editingEvent : e
                  ))
                  setEditingEvent(null)
                  console.log('🎯 Step 16: 予定更新:', editingEvent)
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Step 21: タグ管理モーダル */}
      {showTagModal && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowTagModal(false)}
          />
          
          {/* モーダル本体 */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tag Management</h2>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            {/* タグフィルタリング */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter Events by Tags</h3>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setTagFilterMode('OR')}
                  className={`px-2 py-1 text-xs rounded ${
                    tagFilterMode === 'OR' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  OR (any tag)
                </button>
                <button
                  onClick={() => setTagFilterMode('AND')}
                  className={`px-2 py-1 text-xs rounded ${
                    tagFilterMode === 'AND' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  AND (all tags)
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTags(prev =>
                          isSelected
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }}
                      className={`
                        px-2 py-1 text-xs rounded transition-all
                        ${isSelected
                          ? 'text-white'
                          : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                        }
                      `}
                      style={{
                        backgroundColor: isSelected ? tag.color : undefined
                      }}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
              
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            {/* イベントのタグ編集（選択されたイベントがある場合） */}
            {selectedEventId && (() => {
              const selectedEvent = savedEvents.find(e => e.id === selectedEventId)
              if (!selectedEvent) return null
              
              return (
                <div className="mb-4 p-3 border rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Edit Tags for: {selectedEvent.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                      const isSelected = selectedEvent.tagIds?.includes(tag.id) || false
                      return (
                        <button
                          key={tag.id}
                          onClick={() => {
                            const currentTags = selectedEvent.tagIds || []
                            const newTags = isSelected
                              ? currentTags.filter(id => id !== tag.id)
                              : [...currentTags, tag.id]
                            
                            setSavedEvents(prev => prev.map(e => 
                              e.id === selectedEventId 
                                ? { ...e, tagIds: newTags }
                                : e
                            ))
                          }}
                          className={`
                            px-2 py-1 text-xs rounded transition-all
                            ${isSelected
                              ? 'text-white'
                              : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                            }
                          `}
                          style={{
                            backgroundColor: isSelected ? tag.color : undefined
                          }}
                        >
                          {tag.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
            
            {/* 新しいタグの作成 */}
            <div className="mb-4 p-3 border rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Create New Tag</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Tag name"
                  className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const name = e.currentTarget.value.trim()
                      if (name && !tags.some(t => t.name === name)) {
                        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
                        const newTag = {
                          id: Date.now().toString(),
                          name,
                          color: colors[Math.floor(Math.random() * colors.length)]
                        }
                        setTags(prev => [...prev, newTag])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">Press Enter to create a tag</p>
            </div>
            
            {/* 既存タグの管理 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Existing Tags</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                      {tag.name}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete tag "${tag.name}"?`)) {
                          setTags(prev => prev.filter(t => t.id !== tag.id))
                          // イベントからもタグを削除
                          setSavedEvents(prev => prev.map(e => ({
                            ...e,
                            tagIds: e.tagIds?.filter(id => id !== tag.id) || []
                          })))
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 閉じるボタン */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* Step 24改: Googleカレンダー風第3層 - マウス追従ポータル（安定化） */}
      {typeof window !== 'undefined' && 
       draggingEventId && 
       mousePosition.x > 0 && mousePosition.y > 0 && 
       draggedEventDimensions.width > 0 && draggedEventDimensions.height > 0 && 
        createPortal(
          <div
            className="fixed pointer-events-none z-[9999] transition-all duration-75 ease-out transform-gpu"
            style={{
              left: Math.max(0, Math.min(window.innerWidth - draggedEventDimensions.width, mousePosition.x - draggedEventDimensions.width / 2)),
              top: Math.max(0, Math.min(window.innerHeight - draggedEventDimensions.height, mousePosition.y - draggedEventDimensions.height / 2)),
              width: draggedEventDimensions.width,
              height: Math.max(20, draggedEventDimensions.height), // 最小高さ確保
              transform: 'scale(1.05)',
              opacity: 0.85
            }}
          >
            {(() => {
              const draggedEvent = expandedEvents.find(e => e.id === draggingEventId)
              if (!draggedEvent) return null
              
              return (
                <div
                  className="w-full h-full px-2 py-1 text-white text-xs rounded shadow-2xl border-2 border-white/30"
                  style={{
                    backgroundColor: draggedEvent.color,
                    backdropFilter: 'blur(1px)'
                  }}
                >
                  <div className="font-medium truncate">{draggedEvent.title}</div>
                  <div className="text-xs opacity-90 truncate">
                    {draggedEvent.startTime} - {draggedEvent.endTime}
                  </div>
                  {/* スナップターゲット表示 - 条件を厳しくして安定化 */}
                  {snapTargetTime && 
                   snapTargetTime.hours >= 0 && snapTargetTime.hours < 24 && 
                   snapTargetTime.minutes >= 0 && snapTargetTime.minutes < 60 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full shadow-lg border border-blue-500">
                        {String(snapTargetTime.hours).padStart(2, '0')}:{String(snapTargetTime.minutes).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>,
          document.body
        )
      }
    </div>
  )
}

// メインコンポーネント
export function PureCalendarLayout({ dates, events, onCreateEvent, onEventClick }: PureCalendarLayoutProps) {
  // Step 23: 通知機能は一旦無効化（エラー回避のため）
  const visibleNotifications: Array<{
    id: string
    eventId: string
    title: string
    message: string
    timestamp: Date
  }> = []
  
  const dismissNotification = (_id: string) => {}
  const clearAllNotifications = () => {}

  // Step 15: 初期スクロール位置の調整
  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto')
    if (scrollContainer) {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const currentPosition = (hours * 60 + minutes) * (HOUR_HEIGHT / 60)
      
      // 現在時刻の少し上（2時間分上）にスクロール
      const scrollTarget = Math.max(0, currentPosition - 160)
      scrollContainer.scrollTop = scrollTarget
      
      console.log('🎯 Step 15: 初期スクロール位置設定:', {
        currentTime: `${hours}:${minutes.toString().padStart(2, '0')}`,
        currentPosition,
        scrollTarget
      })
    }
  }, [])

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* 時間軸とカレンダーグリッドが一緒にスクロール */}
      <div className="flex-1 flex overflow-y-auto min-h-0 bg-transparent">
        {/* 時間軸ラベル */}
        <TimeAxisLabels />
        
        {/* カレンダーグリッド本体 */}
        <div className="flex-1">
          <CalendarGrid 
            dates={dates} 
            events={events}
            onCreateEvent={onCreateEvent}
            onEventClick={onEventClick}
          />
        </div>
      </div>
      
      {/* 通知表示 */}
      <NotificationDisplay
        notifications={visibleNotifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
      />
    </div>
  )
}