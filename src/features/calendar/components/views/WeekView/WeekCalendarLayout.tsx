// @ts-nocheck TODO(#389): 型エラー6件を段階的に修正する
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { format, isSameDay, isToday } from 'date-fns'
import { X } from 'lucide-react'

import { DeleteToast } from '@/components/shadcn-ui/delete-toast'
import { useRecordsStore } from '@/features/calendar/stores/useRecordsStore'
import type { CalendarEvent } from '@/features/events'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { useAddPopup } from '@/hooks/useAddPopup'

import { HOUR_HEIGHT } from '../../../constants/calendar-constants'
import type { Task, ViewDateRange } from '../../../types/calendar.types'

import { TimeColumn } from '../shared/grid/TimeColumn'

interface WeekCalendarLayoutProps {
  dates: Date[]
  tasks: Task[]
  events: CalendarEvent[]
  dateRange: ViewDateRange
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  onRestoreEvent?: (event: CalendarEvent) => Promise<void>
}

// 現在時刻線コンポーネント（シンプル版）
const CurrentTimeLine = ({ day }: { day: Date }) => {
  if (!isToday(day)) return null

  const now = new Date()
  const currentHours = now.getHours() + now.getMinutes() / 60

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-30 h-0.5 bg-red-500"
      style={{
        top: `${currentHours * HOUR_HEIGHT}px`,
      }}
    >
      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-red-500" />
    </div>
  )
}

export const WeekCalendarLayout = ({
  dates,
  tasks: _tasks,
  events = [],
  dateRange,
  onEventClick,
  onCreateEvent,
  onUpdateEvent: _onUpdateEvent,
  onDeleteEvent,
  onRestoreEvent,
}: WeekCalendarLayoutProps) => {
  const { openEventPopup } = useAddPopup()
  const { planRecordMode } = useCalendarSettingsStore()
  const { records: _records, fetchRecords } = useRecordsStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // 削除機能用のstate
  const [deletedEvent, setDeletedEvent] = useState<CalendarEvent | null>(null)

  // ドラッグ機能は一時的に無効化
  const _enableDragToCreate = false

  // Records取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(dateRange)
    }
  }, [planRecordMode, dateRange, fetchRecords])

  // 削除処理関数（トースト機能付き）
  const handleDeleteEvent = useCallback(
    (eventId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }

      // 削除対象のイベントを見つける
      const eventToDelete = events.find((event) => event.id === eventId)
      if (!eventToDelete) return

      // 確認なしで即座に削除（トーストで元に戻せるため）
      onDeleteEvent?.(eventId)

      // 削除されたイベントをトースト用に保存
      setDeletedEvent(eventToDelete)

      // 選択状態をクリア
      if (selectedEventId === eventId) {
        setSelectedEventId(null)
      }
    },
    [onDeleteEvent, selectedEventId, events]
  )

  // Undoハンドラー（削除を元に戻す）
  const handleUndoDelete = useCallback(
    async (restoredEvent: CalendarEvent) => {
      // 上位コンポーネントに復元を委譲
      if (onRestoreEvent) {
        await onRestoreEvent(restoredEvent)
      }

      setDeletedEvent(null)
    },
    [onRestoreEvent]
  )

  // トースト閉じるハンドラー
  const handleDismissToast = useCallback(() => {
    setDeletedEvent(null)
  }, [])

  // キーボードショートカット（Delete/Backspace）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEventId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        handleDeleteEvent(selectedEventId)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedEventId, handleDeleteEvent])

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
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
        status: 'Todo',
      })

      // デフォルト値を設定（AddPopupが使用）
      if (onCreateEvent) {
        onCreateEvent(date, timeString)
      }
    },
    [openEventPopup, onCreateEvent]
  )

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
      (endHours + endMinutes / 60 - (hours + minutes / 60)) * HOUR_HEIGHT
    )

    return { top, height }
  }, [])

  // jsx-no-bind optimization: Empty slot click handler creator
  const createEmptySlotClickHandler = useCallback(
    (day: Date) => {
      return (e: React.MouseEvent | unknown) => handleEmptySlotClick(e, day)
    },
    [handleEmptySlotClick]
  )

  // jsx-no-bind optimization: Empty slot keyboard handler creator
  const createEmptySlotKeyDownHandler = useCallback(
    (day: Date) => {
      return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleEmptySlotClick(e as unknown, day)
        }
      }
    },
    [handleEmptySlotClick]
  )

  // jsx-no-bind optimization: Event click handler creator
  const createEventClickHandler = useCallback(
    (event: CalendarEvent) => {
      return (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedEventId(event.id)
        onEventClick?.(event)
      }
    },
    [setSelectedEventId, onEventClick]
  )

  // jsx-no-bind optimization: Event keyboard handler creator
  const createEventKeyDownHandler = useCallback(
    (event: CalendarEvent) => {
      return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          setSelectedEventId(event.id)
          onEventClick?.(event)
        }
      }
    },
    [setSelectedEventId, onEventClick]
  )

  // jsx-no-bind optimization: Delete event handler creator
  const createDeleteEventHandler = useCallback(
    (eventId: string) => {
      return (e: React.MouseEvent) => handleDeleteEvent(eventId, e)
    },
    [handleDeleteEvent]
  )

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <div className="full-day-scroll flex h-full overflow-y-auto">
        {/* 時間軸ラベル */}
        <div
          className="bg-background sticky left-0 z-10 flex-shrink-0 shadow-sm"
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          <TimeColumn startHour={0} endHour={24} interval={60} className="w-16" />
        </div>

        {/* カレンダーグリッド */}
        <div className="bg-background relative flex flex-1" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {dates.map((day, _dayIndex) => {
            // その日のイベントをフィルタリング
            const dayEvents = events
              .filter((event) => {
                if (!event.startDate) return false
                return isSameDay(event.startDate, day)
              })
              .sort((a, b) => {
                const aTime = a.startDate ? a.startDate.getTime() : 0
                const bTime = b.startDate ? b.startDate.getTime() : 0
                return aTime - bTime
              })

            return (
              <div
                key={day.toISOString()}
                className="relative flex-1 border-r border-neutral-900/20 last:border-r-0 dark:border-neutral-100/20"
              >
                {/* クリック可能な背景エリア */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={createEmptySlotClickHandler(day)}
                  onKeyDown={createEmptySlotKeyDownHandler(day)}
                  className="absolute inset-0 z-10 cursor-cell"
                  aria-label={`${format(day, 'yyyy年M月d日')}の予定を追加`}
                >
                  {/* 分割線（bothモード時のみ） */}
                  {planRecordMode === 'both' ? (
                    <div className="bg-border absolute bottom-0 left-1/2 top-0 z-20 w-px -translate-x-0.5"></div>
                  ) : null}

                  {/* 時間グリッド背景 */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="border-b border-neutral-900/20 transition-colors last:border-b-0 hover:bg-blue-50/30 dark:border-neutral-100/20 dark:hover:bg-blue-900/10"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        title={`${hour}:00 - ${hour + 1}:00`}
                      />
                    ))}
                  </div>
                </div>

                {/* 現在時刻線 */}
                <CurrentTimeLine day={day} />

                {/* イベント表示 */}
                {(planRecordMode === 'plan' || planRecordMode === 'both') &&
                  dayEvents.map((event) => {
                    if (!event.startDate) return null

                    const { top, height } = calculateEventPosition(event)
                    const eventColor = event.color || '#3b82f6'

                    // bothモードでは左半分、planモードでは全幅
                    const leftPosition = planRecordMode === 'both' ? '2px' : '4px'
                    const widthValue = planRecordMode === 'both' ? 'calc(50% - 4px)' : 'calc(100% - 8px)'

                    return (
                      <div
                        key={event.id}
                        data-event-block
                        role="button"
                        tabIndex={0}
                        className={`group absolute z-20 cursor-pointer rounded-md border border-white/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${selectedEventId === event.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                        style={{
                          left: leftPosition,
                          width: widthValue,
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: eventColor,
                        }}
                        onClick={createEventClickHandler(event)}
                        onKeyDown={createEventKeyDownHandler(event)}
                        aria-label={`イベント: ${event.title}${event.startDate ? ` (${format(event.startDate, 'HH:mm')}開始)` : ''}`}
                      >
                        {/* ホバー時の削除ボタン */}
                        <button
                          type="button"
                          onClick={createDeleteEventHandler(event.id)}
                          className="absolute right-1 top-1 z-30 rounded bg-white/90 p-0.5 opacity-0 shadow-lg transition-all duration-200 hover:bg-white group-hover:opacity-100 dark:bg-gray-800/90 dark:hover:bg-gray-700"
                          title="予定を削除"
                        >
                          <X className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                        </button>

                        <div className="h-full overflow-hidden p-1 text-white sm:p-1.5">
                          <div className="flex h-full flex-col">
                            <div className="min-h-0 flex-1">
                              <div className="mb-0.5 line-clamp-2 text-xs font-medium leading-tight">{event.title}</div>
                              {height > 30 ? (
                                <div className="text-xs leading-tight opacity-90">
                                  {format(event.startDate, 'HH:mm')}
                                  {event.endDate ? ` - ${format(event.endDate, 'HH:mm')}` : null}
                                </div>
                              ) : null}
                            </div>
                            {event.location && height > 60 ? (
                              <div className="mt-1 line-clamp-1 text-xs leading-tight opacity-80">
                                📍 {event.location}
                              </div>
                            ) : null}
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

      {/* 削除完了トースト */}
      <DeleteToast deletedEvent={deletedEvent} onUndo={handleUndoDelete} onDismiss={handleDismissToast} />
    </div>
  )
}
