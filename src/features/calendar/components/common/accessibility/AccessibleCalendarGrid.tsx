// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import { useCallback, useMemo, useRef } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

import { AccessibilityLiveRegion, useAccessibilityKeyboard } from '../../../hooks/useAccessibilityKeyboard'

interface AccessibleCalendarGridProps {
  dates: Date[]
  events: CalendarPlan[]
  currentDate: Date
  selectedDate?: Date
  selectedTime?: string
  selectedEventId?: string | null
  onCreateEvent: (date: Date, time: string) => void
  onEditEvent: (eventId: string) => void
  onDeleteEvent: (eventId: string) => void
  onSelectEvent: (eventId: string) => void
  onNavigateDate: (date: Date) => void
  onNavigateTime: (time: string) => void
  onEscapeAction: () => void
  hourHeight?: number
  startHour?: number
  endHour?: number
  className?: string
}

// 時間スロットの生成（15分刻み）
const generateTimeSlots = (startHour: number, endHour: number) => {
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push({
        hour,
        minute,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      })
    }
  }
  return slots
}

export const AccessibleCalendarGrid = ({
  dates,
  events,
  currentDate,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onSelectEvent,
  onNavigateDate,
  onNavigateTime,
  onEscapeAction,
  hourHeight = 60,
  startHour = 0,
  endHour = 24,
  className,
}: AccessibleCalendarGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null)

  // アクセシビリティキーボード操作
  const { navigationState, announcements, focusCalendar, getDetailedStatus } = useAccessibilityKeyboard(
    events,
    currentDate,
    {
      onCreateEvent,
      onEditEvent,
      onDeleteEvent,
      onSelectEvent,
      onNavigateDate,
      onNavigateTime,
      onEscapeAction,
    }
  )

  // 時間スロットの生成
  const timeSlots = useMemo(() => generateTimeSlots(startHour, endHour), [startHour, endHour])

  // 日付のフォーマット
  const formatDateForAria = useCallback((date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }, [])

  // 時間のフォーマット
  const formatTimeForAria = useCallback((time: string) => {
    const [hour, minute] = time.split(':')
    return `${parseInt(hour)}時${parseInt(minute)}分`
  }, [])

  // イベントの詳細説明
  const getEventDescription = useCallback((event: CalendarPlan) => {
    const startTime = event.startDate?.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const endTime = event.endDate?.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return [
      event.title,
      startTime && endTime ? `${startTime}から${endTime}まで` : '',
      event.description || '',
      event.location ? `場所: ${event.location}` : '',
      event.tags?.length ? `タグ: ${event.tags.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('。')
  }, [])

  // グリッドセルのARIA属性
  const getCellAriaProps = useCallback(
    (date: Date, time: string, colIndex: number) => {
      const cellEvents = events.filter(
        (event) =>
          event.startDate &&
          event.startDate.toDateString() === date.toDateString() &&
          event.startDate.getHours() === parseInt(time.split(':')[0]) &&
          event.startDate.getMinutes() === parseInt(time.split(':')[1])
      )

      const isSelected =
        navigationState.selectedDate.toDateString() === date.toDateString() && navigationState.selectedTime === time

      const cellDate = formatDateForAria(date)
      const cellTime = formatTimeForAria(time)

      let ariaLabel = `${cellDate} ${cellTime}`

      if (cellEvents.length > 0) {
        const eventTitles = cellEvents.map((e) => e.title).join(', ')
        ariaLabel += `。イベント: ${eventTitles}`
      } else {
        ariaLabel += '。空き時間'
      }

      if (isSelected) {
        ariaLabel += '。選択中'
      }

      return {
        'aria-label': ariaLabel,
        'aria-selected': isSelected,
        'aria-describedby': cellEvents.length > 0 ? `events-${date.getTime()}-${time}` : undefined,
        'aria-colindex': colIndex,
        role: 'gridcell',
        tabIndex: isSelected ? 0 : -1,
      }
    },
    [events, navigationState, formatDateForAria, formatTimeForAria]
  )

  // イベントのARIA属性
  const getEventAriaProps = useCallback(
    (event: CalendarPlan) => {
      const isSelected = navigationState.selectedEventId === event.id
      const description = getEventDescription(event)

      return {
        'aria-label': description,
        'aria-selected': isSelected,
        role: 'button',
        tabIndex: isSelected ? 0 : -1,
        'aria-describedby': `event-details-${event.id}`,
      }
    },
    [navigationState.selectedEventId, getEventDescription]
  )

  return (
    <div className={cn('relative', className)}>
      {/* スクリーンリーダー用のライブリージョン */}
      <AccessibilityLiveRegion announcements={announcements} />

      {/* カレンダーの説明 */}
      <div className="sr-only" id="calendar-instructions">
        カレンダーグリッド。矢印キーで日付と時間を移動、Enterキーでイベント作成・編集、
        Deleteキーでイベント削除、Escapeキーで操作をキャンセル、F1キーでヘルプを表示できます。
      </div>

      {/* メインカレンダーグリッド */}
      <div
        ref={gridRef}
        role="grid"
        aria-label="週間カレンダー"
        aria-describedby="calendar-instructions"
        aria-rowcount={timeSlots.length + 1}
        aria-colcount={dates.length + 1}
        tabIndex={0}
        className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        onFocus={focusCalendar}
      >
        {/* ヘッダー行（日付） */}
        <div role="row" aria-rowindex={1} className="flex border-b">
          {/* 時間列のヘッダー */}
          <div role="columnheader" aria-colindex={1} className="w-16 bg-gray-50 p-2 text-sm font-medium">
            <span className="sr-only">時間</span>
          </div>

          {/* 日付ヘッダー */}
          {dates.map((date, dateIndex) => (
            <div
              key={date.toISOString()}
              role="columnheader"
              aria-colindex={dateIndex + 2}
              className={cn(
                'flex-1 bg-gray-50 p-2 text-center text-sm font-medium',
                date.toDateString() === new Date().toDateString() && 'bg-blue-50'
              )}
            >
              <div aria-label={formatDateForAria(date)}>
                <div className="text-xs text-gray-600">{date.toLocaleDateString('ja-JP', { weekday: 'short' })}</div>
                <div
                  className={cn(
                    'text-lg',
                    date.toDateString() === new Date().toDateString() && 'font-bold text-blue-600'
                  )}
                >
                  {date.getDate()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 時間行 */}
        {timeSlots.map((slot, slotIndex) => (
          <div
            key={slot.time}
            role="row"
            aria-rowindex={slotIndex + 2}
            className={`flex ${slot.hour < 23 ? 'border-b border-neutral-900/20 dark:border-neutral-100/20' : ''}`}
            style={{ height: hourHeight }}
          >
            {/* 時間ラベル */}
            <div
              role="rowheader"
              aria-colindex={1}
              className="w-16 border-r border-neutral-900/20 p-1 text-xs text-gray-500 dark:border-neutral-100/20"
            >
              <span aria-label={formatTimeForAria(slot.time)}>{slot.time}</span>
            </div>

            {/* 日付セル */}
            {dates.map((date, dateIndex) => {
              const cellEvents = events.filter(
                (event) =>
                  event.startDate &&
                  event.startDate.toDateString() === date.toDateString() &&
                  event.startDate.getHours() === slot.hour &&
                  event.startDate.getMinutes() === slot.minute
              )

              return (
                <button
                  key={`${date.toISOString()}-${slot.time}`}
                  type="button"
                  {...getCellAriaProps(date, slot.time, dateIndex + 2)}
                  className={cn(
                    'relative flex-1 border-r border-neutral-900/20 p-1 dark:border-neutral-100/20',
                    'hover:bg-gray-50 focus:bg-blue-50 focus:outline-none',
                    navigationState.selectedDate.toDateString() === date.toDateString() &&
                      navigationState.selectedTime === slot.time &&
                      'bg-blue-100 ring-2 ring-blue-500 ring-inset'
                  )}
                  onClick={() => {
                    onNavigateDate(date)
                    onNavigateTime(slot.time)
                  }}
                >
                  {/* イベント表示 */}
                  {cellEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      {...getEventAriaProps(event)}
                      className={cn(
                        'absolute inset-x-1 cursor-pointer rounded p-1 text-xs',
                        'focus:ring-2 focus:ring-white focus:ring-offset-1 focus:outline-none',
                        navigationState.selectedEventId === event.id && 'ring-2 ring-white ring-offset-1'
                      )}
                      style={{
                        backgroundColor: event.color || '#3b82f6',
                        color: 'white',
                        top: event.startDate ? `${(event.startDate.getMinutes() / 60) * 100}%` : '0%',
                        height:
                          event.endDate && event.startDate
                            ? `${((event.endDate.getTime() - event.startDate.getTime()) / (60 * 60 * 1000)) * 100}%`
                            : '100%',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(event.id)
                      }}
                    >
                      <div className="truncate font-medium">{event.title}</div>

                      {/* スクリーンリーダー用の詳細情報 */}
                      <div className="sr-only" id={`event-details-${event.id}`}>
                        {getEventDescription(event)}
                      </div>
                    </button>
                  ))}

                  {/* 空のセル用の隠しテキスト */}
                  {cellEvents.length === 0 && (
                    <span className="sr-only">空き時間。Enterキーで新しいイベントを作成</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* 現在の状態表示（スクリーンリーダー用） */}
      <div className="sr-only" aria-live="polite" role="status">
        {getDetailedStatus()}
      </div>

      {/* キーボードヘルプ（スクリーンリーダー用） */}
      <div className="sr-only" id="keyboard-help">
        <h3>キーボード操作</h3>
        <ul>
          <li>矢印キー: 日付・時間・イベント間の移動</li>
          <li>Shift + 左右矢印キー: 週単位で移動</li>
          <li>Tab: 次のイベントに移動</li>
          <li>Enter: イベント作成（未選択時）・編集（選択時）</li>
          <li>Delete または Backspace: 選択中のイベントを削除</li>
          <li>Escape: 操作をキャンセル・選択を解除</li>
          <li>Home: 最初の時間に移動</li>
          <li>End: 最後の時間に移動</li>
          <li>PageUp: 前の週に移動</li>
          <li>PageDown: 次の週に移動</li>
          <li>スペース: 選択中のイベントの詳細を読み上げ</li>
          <li>F1: このヘルプを読み上げ</li>
        </ul>
      </div>

      {/* 隠しイベントリスト（スクリーンリーダー用詳細情報） */}
      <div className="sr-only">
        <h3>この週のイベント一覧</h3>
        {dates.map((date) => {
          const dayEvents = events
            .filter((event) => event.startDate && event.startDate.toDateString() === date.toDateString())
            .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

          if (dayEvents.length === 0) return null

          return (
            <div key={date.toISOString()}>
              <h4>{formatDateForAria(date)}</h4>
              <ul>
                {dayEvents.map((event) => (
                  <li
                    key={event.id}
                    id={`events-${date.getTime()}-${event.startDate?.getHours()}:${event.startDate?.getMinutes()}`}
                  >
                    {getEventDescription(event)}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
