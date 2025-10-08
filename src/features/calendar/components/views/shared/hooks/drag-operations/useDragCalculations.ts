/**
 * ドラッグ計算処理の専用フック
 */

'use client'

import { useCallback } from 'react'

import { HOUR_HEIGHT } from '../../constants/grid.constants'

export function useDragCalculations() {
  // 15分単位でスナップ
  const snapToQuarterHour = useCallback((yPosition: number) => {
    const hourDecimal = yPosition / HOUR_HEIGHT
    const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
    const minuteDecimal = (hourDecimal - hour) * 60
    const minute = Math.round(minuteDecimal / 15) * 15

    const snappedTop = (hour + minute / 60) * HOUR_HEIGHT

    return { snappedTop, hour, minute: Math.min(minute, 59) }
  }, [])

  // 新しい時刻を計算
  const calculateNewTime = useCallback((newTop: number, targetDate: Date) => {
    const hourDecimal = newTop / HOUR_HEIGHT
    const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
    const minute = Math.round(Math.max(0, ((hourDecimal - hour) * 60) / 15)) * 15

    const newStartTime = new Date(targetDate)
    newStartTime.setHours(hour, minute, 0, 0)

    return newStartTime
  }, [])

  // 境界制限された座標を取得
  const getConstrainedPosition = useCallback((clientX: number, clientY: number) => {
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
  }, [])

  // 日付インデックスを計算
  const calculateTargetDateIndex = useCallback(
    (
      constrainedX: number,
      originalDateIndex: number,
      hasMoved: boolean,
      columnWidth: number,
      displayDates: Date[],
      originalElement?: HTMLElement,
      viewMode = 'day'
    ) => {
      let targetDateIndex = originalDateIndex

      if (viewMode !== 'day' && displayDates && hasMoved) {
        const gridContainer =
          (originalElement?.closest('.flex') as HTMLElement) ||
          (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
          (originalElement?.parentElement?.parentElement as HTMLElement)

        if (gridContainer && columnWidth > 0) {
          const rect = gridContainer.getBoundingClientRect()
          const relativeX = Math.max(0, Math.min(constrainedX - rect.left, rect.width))

          const columnIndex = Math.floor(relativeX / columnWidth)
          const newTargetIndex = Math.max(0, Math.min(displayDates.length - 1, columnIndex))

          targetDateIndex = newTargetIndex
        }
      }

      return targetDateIndex
    },
    []
  )

  // ターゲット日付を計算
  const calculateTargetDate = useCallback(
    (targetDateIndex: number, date: Date, displayDates?: Date[], viewMode = 'day') => {
      let targetDate = date

      if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
        targetDate = displayDates[targetDateIndex]
      }

      if (!targetDate || isNaN(targetDate.getTime())) {
        targetDate = date
      }

      return targetDate
    },
    []
  )

  // ドラッグの動きを計算
  const calculateDragMovement = useCallback(
    (originalTop: number, deltaY: number, targetDateIndex: number, displayDates?: Date[], viewMode = 'day') => {
      const newTop = originalTop + deltaY
      const { snappedTop, hour, minute } = snapToQuarterHour(newTop)

      let snappedLeft: number | undefined

      if (viewMode !== 'day' && displayDates) {
        const columnWidthPercent = 100 / displayDates.length
        snappedLeft = targetDateIndex * columnWidthPercent + 1
      }

      return {
        snappedTop,
        snappedLeft,
        hour,
        minute,
      }
    },
    [snapToQuarterHour]
  )

  // リサイズの動きを計算
  const calculateResizeMovement = useCallback(
    (originalTop: number, eventDuration: number, deltaY: number) => {
      const newHeight = Math.max(15, eventDuration + deltaY)
      const { snappedTop: snappedHeight } = snapToQuarterHour(newHeight)
      const finalHeight = Math.max(HOUR_HEIGHT / 4, snappedHeight)

      return {
        finalHeight,
        originalTop,
      }
    },
    [snapToQuarterHour]
  )

  return {
    snapToQuarterHour,
    calculateNewTime,
    getConstrainedPosition,
    calculateTargetDateIndex,
    calculateTargetDate,
    calculateDragMovement,
    calculateResizeMovement,
  }
}
