import { calendarColors } from '@/features/calendar/theme'

import { HOUR_HEIGHT } from '../constants/grid.constants'

/**
 * ドラッグ要素作成（position: fixed で自由移動）
 */
export const createDragElement = (originalElement: HTMLElement) => {
  const rect = originalElement.getBoundingClientRect()
  const dragElement = originalElement.cloneNode(true) as HTMLElement

  // 元のクラスをクリアして、draggingスタイルを適用
  dragElement.className = ''
  dragElement.classList.add('rounded-md', 'px-2', 'py-1', 'overflow-hidden')

  // scheduledのactiveカラーを適用（colors.tsから参照）
  const activeColorClasses = calendarColors.event.scheduled.active?.split(' ') || []
  activeColorClasses.forEach((cls) => {
    if (cls) dragElement.classList.add(cls)
  })

  // 重要: position: fixed で画面全体を基準に配置（親要素の制約を無視）
  dragElement.style.position = 'fixed'
  dragElement.style.left = `${rect.left}px`
  dragElement.style.top = `${rect.top}px`
  dragElement.style.width = `${rect.width}px`
  dragElement.style.height = `${rect.height}px`
  dragElement.style.opacity = '0.9'
  dragElement.style.pointerEvents = 'none' // マウスイベントを透過
  dragElement.style.zIndex = '9999' // 最上位レイヤー
  dragElement.style.transition = 'none'
  dragElement.style.boxShadow = 'none'
  dragElement.classList.add('dragging-element')

  // bodyに追加（親要素の制約を受けない）
  document.body.appendChild(dragElement)

  return { dragElement, initialRect: rect }
}

/**
 * 15分単位でスナップする関数
 */
export const snapToQuarterHour = (yPosition: number): { snappedTop: number; hour: number; minute: number } => {
  const hourDecimal = yPosition / HOUR_HEIGHT
  const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
  const minuteDecimal = (hourDecimal - hour) * 60
  const minute = Math.round(minuteDecimal / 15) * 15 // 15分単位にスナップ

  const snappedTop = (hour + minute / 60) * HOUR_HEIGHT

  return { snappedTop, hour, minute: Math.min(minute, 59) }
}

/**
 * 境界制限処理
 */
export const getConstrainedPosition = (clientX: number, clientY: number) => {
  const calendarContainer =
    (document.querySelector('[data-calendar-main]') as HTMLElement) ||
    (document.querySelector('.calendar-main') as HTMLElement) ||
    (document.querySelector('main') as HTMLElement)

  let constrainedX = clientX
  let constrainedY = clientY

  if (calendarContainer) {
    const rect = calendarContainer.getBoundingClientRect()
    constrainedX = Math.max(rect.left, Math.min(rect.right, clientX))
    constrainedY = Math.max(rect.top, Math.min(rect.bottom, clientY))
  }

  return { constrainedX, constrainedY }
}

/**
 * 日付インデックス計算
 */
interface DragData {
  originalDateIndex: number
  hasMoved: boolean
  originalElement?: HTMLElement
  columnWidth: number
}

export const calculateTargetDateIndex = (
  constrainedX: number,
  dragData: DragData,
  deltaX: number,
  viewMode: string,
  displayDates?: Date[]
) => {
  let targetDateIndex = dragData.originalDateIndex

  if (viewMode !== 'day' && displayDates && dragData.hasMoved) {
    const gridContainer =
      (dragData.originalElement?.closest('.flex') as HTMLElement) ||
      (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
      (dragData.originalElement?.parentElement?.parentElement as HTMLElement)

    if (gridContainer && dragData.columnWidth > 0) {
      const rect = gridContainer.getBoundingClientRect()
      const relativeX = Math.max(0, Math.min(constrainedX - rect.left, rect.width))

      const columnIndex = Math.floor(relativeX / dragData.columnWidth)
      const newTargetIndex = Math.max(0, Math.min(displayDates.length - 1, columnIndex))

      targetDateIndex = newTargetIndex

      // デバッグログ
      if (Math.abs(newTargetIndex - dragData.originalDateIndex) > 0 && Math.abs(deltaX) > 30) {
        console.log('🔧 日付間移動（非連続日付対応）:', {
          originalIndex: dragData.originalDateIndex,
          originalDate: displayDates[dragData.originalDateIndex]?.toDateString?.(),
          newTargetIndex,
          targetDate: displayDates[newTargetIndex]?.toDateString?.(),
          relativeX,
          columnWidth: dragData.columnWidth,
          columnIndex,
          isNonConsecutive: displayDates.length < 7,
        })
      }
    }
  }

  return targetDateIndex
}

/**
 * ターゲット日付計算
 */
export const calculateTargetDate = (
  targetDateIndex: number,
  date: Date,
  viewMode: string,
  displayDates?: Date[],
  dragDataRef?: { current?: DragData }
) => {
  let targetDate = date

  if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
    targetDate = displayDates[targetDateIndex]
    console.log('🎯 ドロップ時のターゲット日付決定（非連続対応）:', {
      targetDateIndex,
      targetDate: targetDate.toDateString(),
      originalDateIndex: dragDataRef?.current?.originalDateIndex,
      originalDate: displayDates[dragDataRef?.current?.originalDateIndex]?.toDateString?.(),
      displayDatesLength: displayDates.length,
      isNonConsecutive: displayDates.length < 7,
      allDisplayDates: displayDates.map((d) => d.toDateString()),
    })
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = date
    console.log('⚠️ 無効な日付のためデフォルト使用:', targetDate.toDateString())
  }

  return targetDate
}
