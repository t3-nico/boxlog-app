import { HOUR_HEIGHT } from '../../constants/grid.constants'

/**
 * 15分単位でスナップする
 */
export function snapToQuarterHour(yPosition: number): { snappedTop: number; hour: number; minute: number } {
  const hourDecimal = yPosition / HOUR_HEIGHT
  const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
  const minuteDecimal = (hourDecimal - hour) * 60
  const minute = Math.round(minuteDecimal / 15) * 15

  const snappedTop = (hour + minute / 60) * HOUR_HEIGHT

  return { snappedTop, hour, minute: Math.min(minute, 59) }
}

/**
 * マウス位置を境界内に制限する
 */
export function getConstrainedPosition(clientX: number, clientY: number) {
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
 * スナップされた位置を計算する
 */
export function calculateSnappedPosition(
  originalTop: number,
  originalDateIndex: number | undefined,
  deltaY: number,
  targetDateIndex: number,
  viewMode: string,
  displayDates: Date[] | undefined
): { snappedTop: number; snappedLeft: number | undefined; hour: number; minute: number } {
  const newTop = originalTop + deltaY
  const { snappedTop, hour, minute } = snapToQuarterHour(newTop)

  let snappedLeft = undefined
  if (viewMode !== 'day' && displayDates) {
    const columnWidthPercent = 100 / displayDates.length
    snappedLeft = targetDateIndex * columnWidthPercent + 1

    if (targetDateIndex !== originalDateIndex) {
      console.log('🔧 日付間移動 - 水平移動実行:', {
        originalDateIndex,
        targetDateIndex,
        columnWidthPercent,
        snappedLeft,
      })
    }
  }

  return { snappedTop, snappedLeft, hour, minute }
}

/**
 * ターゲット日付インデックスを計算する
 */
export function calculateTargetDateIndex(
  constrainedX: number,
  originalDateIndex: number,
  hasMoved: boolean,
  originalElement: HTMLElement | null,
  columnWidth: number | undefined,
  deltaX: number,
  viewMode: string,
  displayDates: Date[] | undefined
): number {
  let targetDateIndex = originalDateIndex

  if (viewMode !== 'day' && displayDates && hasMoved) {
    const gridContainer =
      (originalElement?.closest('.flex') as HTMLElement) ||
      (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
      (originalElement?.parentElement?.parentElement as HTMLElement)

    if (gridContainer && columnWidth && columnWidth > 0) {
      const rect = gridContainer.getBoundingClientRect()
      const relativeX = Math.max(0, Math.min(constrainedX - rect.left, rect.width))

      const columnIndex = Math.floor(relativeX / columnWidth)
      const newTargetIndex = Math.max(0, Math.min(displayDates.length - 1, columnIndex))

      targetDateIndex = newTargetIndex

      if (Math.abs(newTargetIndex - originalDateIndex) > 0 && Math.abs(deltaX) > 30) {
        console.log('🔧 日付間移動（非連続日付対応）:', {
          originalIndex: originalDateIndex,
          originalDate: displayDates[originalDateIndex]?.toDateString?.(),
          newTargetIndex,
          targetDate: displayDates[newTargetIndex]?.toDateString?.(),
          relativeX,
          columnWidth,
          columnIndex,
          isNonConsecutive: displayDates.length < 7,
        })
      }
    }
  }

  return targetDateIndex
}
