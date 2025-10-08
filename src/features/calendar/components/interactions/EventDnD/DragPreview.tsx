'use client'

import { useEffect, useState } from 'react'

import { useDragLayer } from 'react-dnd'

import { HOUR_HEIGHT } from '@/features/calendar/constants/calendar-constants'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'

import { DRAG_TYPE } from './DraggableEvent'

const MINUTES_PER_PIXEL = 60 / HOUR_HEIGHT

export const DragPreview = () => {
  const [mounted, setMounted] = useState(false)
  const snapInterval = useCalendarSettingsStore((state) => state.snapInterval)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging() && monitor.getItemType() === DRAG_TYPE.EVENT,
  }))

  if (!mounted || !isDragging || !currentOffset || !item) {
    return null
  }

  // ドラッグ中のイベント情報
  const { event } = item
  const eventDuration =
    event.endDate && event.startDate
      ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
      : 60 // デフォルト1時間

  // カレンダーグリッドに対する相対位置を計算
  const calendarGrid = document.querySelector('.full-day-scroll')
  if (!calendarGrid) return null

  const gridRect = calendarGrid.getBoundingClientRect()
  const scrollTop = calendarGrid.scrollTop || 0

  // マウスオフセットを考慮したカード上部の位置
  const cardTopY = currentOffset.y - (item.mouseOffsetY || 0)
  const relativeY = cardTopY - gridRect.top + scrollTop

  // 設定可能な間隔でスナップ
  const minutesFromStart = relativeY * MINUTES_PER_PIXEL
  const snappedMinutes = Math.round(minutesFromStart / snapInterval) * snapInterval
  const snappedY = snappedMinutes / MINUTES_PER_PIXEL - scrollTop + gridRect.top

  // 時刻を計算
  const hours = Math.floor(snappedMinutes / 60)
  const minutes = snappedMinutes % 60
  const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const endHours = Math.floor((snappedMinutes + eventDuration) / 60)
  const endMinutes = (snappedMinutes + eventDuration) % 60
  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: currentOffset.x,
        top: snappedY,
        width: '200px',
        transform: 'translateX(-50%)',
      }}
    >
      {/* 時刻表示のツールチップ */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">
        {startTime} - {endTime}
      </div>

      {/* スナップ位置のインジケーター */}
      <div className="absolute right-0 left-0 -mt-0.5 h-0.5 bg-blue-500" />

      {/* イベントカードのプレビュー（フルカラー） */}
      <div
        className="rounded-md border border-white/20 p-1.5 shadow-lg"
        style={{
          height: `${(eventDuration * HOUR_HEIGHT) / 60}px`,
          backgroundColor: event.color || '#3b82f6',
        }}
      >
        <div className="text-xs leading-tight font-medium text-white">{event.title}</div>
        <div className="mt-0.5 text-xs text-white/90">
          {startTime} - {endTime}
        </div>
      </div>
    </div>
  )
}
