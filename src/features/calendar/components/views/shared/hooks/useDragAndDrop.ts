// @ts-nocheck TODO(#389): 型エラー9件を段階的に修正する
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'
import { calendarColors } from '@/features/calendar/theme'
import { useI18n } from '@/features/i18n/lib/hooks'

import { HOUR_HEIGHT } from '../constants/grid.constants'
import { formatTimeRange } from '../utils/dateHelpers'

// プランデータの型定義
interface CalendarPlan {
  id: string
  title: string
  startTime: Date
  endTime: Date
  startDate?: Date
  endDate?: Date
  [key: string]: unknown
}

// 分離されたヘルパー関数をインポート

export interface DragState {
  isDragging: boolean
  isResizing: boolean
  draggedEventId: string | null
  dragStartPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { top: number; left: number; width: number; height: number } | null
  snappedPosition: { top: number; height?: number; left?: number } | null // leftを追加
  previewTime: { start: Date; end: Date } | null
  recentlyDragged: boolean // ドラッグ終了直後のクリック防止用
  recentlyResized: boolean // リサイズ終了直後のクリック防止用（より厳格）
  dragElement: HTMLElement | null // ドラッグ要素（position: fixed）
  targetDateIndex?: number // ドラッグ先の日付インデックス（日付間移動用）
  originalDateIndex?: number // ドラッグ元の日付インデックス
  ghostElement: HTMLElement | null // ゴースト要素
}

export interface DragHandlers {
  handleMouseDown: (
    eventId: string,
    e: React.MouseEvent,
    originalPosition: { top: number; left: number; width: number; height: number },
    dateIndex?: number
  ) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleEventDrop: (eventId: string, newStartTime: Date) => void
  handleResizeStart: (
    eventId: string,
    direction: 'top' | 'bottom',
    e: React.MouseEvent,
    originalPosition: { top: number; left: number; width: number; height: number }
  ) => void
}

interface UseDragAndDropProps {
  onPlanUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  onPlanClick?: (plan: CalendarPlan) => void // クリック処理用
  date: Date // DayViewでは単一日付、他のビューでは基準日付
  plans: CalendarPlan[] // プランデータを受け取る
  displayDates?: Date[] // WeekView/TwoWeekView/ThreeDayView用の日付配列
  viewMode?: 'day' | 'week' | '2week' | '3day' // ビューモード
}

/**
 * カレンダービュー共通のドラッグ&ドロップ機能
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 * 高機能版：ゴースト要素、詳細な状態管理、5px移動閾値、日付間移動を含む
 */
export function useDragAndDrop({
  onPlanUpdate,
  onPlanClick,
  date,
  plans,
  displayDates,
  viewMode = 'day',
}: UseDragAndDropProps) {
  const { t } = useI18n()
  const calendarToast = useCalendarToast()
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    draggedEventId: null,
    dragStartPosition: null,
    currentPosition: null,
    originalPosition: null,
    snappedPosition: null,
    previewTime: null,
    recentlyDragged: false,
    recentlyResized: false,
    dragElement: null,
    ghostElement: null,
  })

  const dragDataRef = useRef<{
    eventId: string
    startX: number
    startY: number
    originalTop: number
    eventDuration: number
    hasMoved: boolean // マウスが実際に移動したかの判定
    originalElement: HTMLElement | null // 元の要素への参照
    originalDateIndex: number // ドラッグ開始時の日付インデックス
    columnWidth?: number // カラムの幅（日付間移動用）
    dragElement?: HTMLElement | null // position: fixed ドラッグ要素
    initialRect?: DOMRect | null // 初期位置情報
    initialScrollTop?: number // ドラッグ開始時のスクロール位置
  } | null>(null)

  // ドラッグ要素作成（position: fixed で自由移動）
  const createDragElement = useCallback((originalElement: HTMLElement) => {
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
  }, [])

  // ドラッグ開始
  const handleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex: number = 0 // 日付インデックス（デフォルトは0）
    ) => {
      // 左クリック以外は無視
      if (e.button !== 0) return

      e.preventDefault()
      e.stopPropagation()

      const startPosition = { x: e.clientX, y: e.clientY }

      // 元のプラン要素を取得
      const originalElement = (e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement

      // カラム幅を計算（日付間移動用）
      let columnWidth = 0
      if (viewMode !== 'day' && displayDates) {
        // 複数の方法でグリッドコンテナを取得
        const gridContainer =
          (originalElement?.closest('.flex') as HTMLElement) ||
          (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
          (originalElement?.parentElement?.parentElement as HTMLElement)

        if (gridContainer && gridContainer.offsetWidth > 0) {
          const totalWidth = gridContainer.offsetWidth
          columnWidth = totalWidth / displayDates.length
        } else {
          // フォールバック: ビューポート幅ベース
          columnWidth = (window.innerWidth / displayDates.length) * 0.75
        }
      }

      // ドラッグ要素作成（position: fixed）
      let dragElement: HTMLElement | null = null
      let initialRect: DOMRect | null = null
      if (originalElement) {
        const result = createDragElement(originalElement)
        dragElement = result.dragElement
        initialRect = result.initialRect

        // 元の要素を半透明に
        originalElement.style.opacity = '0.3'
      }

      // 現在のスクロール位置を記録
      const scrollArea = document.querySelector('[data-calendar-scroll]')
      const scrollContainer = scrollArea?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      const initialScrollTop = scrollContainer?.scrollTop || 0

      // ドラッグデータを設定
      dragDataRef.current = {
        eventId,
        startX: e.clientX,
        startY: e.clientY,
        originalTop: originalPosition.top,
        eventDuration: originalPosition.height,
        hasMoved: false,
        originalElement,
        originalDateIndex: dateIndex,
        columnWidth,
        dragElement,
        initialRect,
        initialScrollTop,
      }

      setDragState({
        isDragging: true,
        isResizing: false,
        draggedEventId: eventId,
        dragStartPosition: startPosition,
        currentPosition: startPosition,
        originalPosition,
        snappedPosition: {
          top: originalPosition.top,
          height: originalPosition.height,
        },
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        dragElement,
        originalDateIndex: dateIndex,
        targetDateIndex: dateIndex,
        ghostElement: null,
      })
    },
    [createDragElement, viewMode, displayDates]
  )

  // 15分単位でスナップする関数
  const snapToQuarterHour = useCallback((yPosition: number): { snappedTop: number; hour: number; minute: number } => {
    const hourDecimal = yPosition / HOUR_HEIGHT
    const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
    const minuteDecimal = (hourDecimal - hour) * 60
    const minute = Math.round(minuteDecimal / 15) * 15 // 15分単位にスナップ

    const snappedTop = (hour + minute / 60) * HOUR_HEIGHT

    return { snappedTop, hour, minute: Math.min(minute, 59) }
  }, [])

  // リサイズ処理のヘルパー関数
  const handleResizing = useCallback(
    (dragData: { [key: string]: unknown }, constrainedX: number, constrainedY: number, deltaY: number) => {
      // TODO(#389): dragDataRefの型とDragStateの型を統一する
      const typedDragData = dragData as { eventId: string; eventDuration: number; originalTop: number }
      const newHeight = Math.max(15, typedDragData.eventDuration + deltaY)
      const { snappedTop: snappedHeight } = snapToQuarterHour(newHeight)
      const finalHeight = Math.max(HOUR_HEIGHT / 4, snappedHeight)

      const event = plans.find((e) => e.id === typedDragData.eventId)
      let previewTime = null

      if (event?.startDate) {
        const newDurationMs = (finalHeight / HOUR_HEIGHT) * 60 * 60 * 1000
        const previewEndTime = new Date(event.startDate.getTime() + newDurationMs)

        // 終了時刻を15分単位にスナップ
        const minutes = previewEndTime.getMinutes()
        const snappedMinutes = Math.round(minutes / 15) * 15
        previewEndTime.setMinutes(snappedMinutes, 0, 0)

        previewTime = { start: event.startDate, end: previewEndTime }
      }

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: constrainedX, y: constrainedY },
        snappedPosition: {
          top: typedDragData.originalTop,
          height: finalHeight,
        },
        previewTime,
      }))
    },
    [snapToQuarterHour, plans]
  )

  // ヘルパー関数: 位置スナッピング処理
  const calculateSnappedPosition = useCallback(
    (
      dragData: Pick<DragState, 'originalPosition' | 'originalDateIndex'> & { originalTop: number },
      deltaY: number,
      targetDateIndex: number
    ) => {
      const newTop = dragData.originalTop + deltaY
      const { snappedTop, hour, minute } = snapToQuarterHour(newTop)

      let snappedLeft = undefined
      if (viewMode !== 'day' && displayDates) {
        const columnWidthPercent = 100 / displayDates.length
        snappedLeft = targetDateIndex * columnWidthPercent + 1

        if (targetDateIndex !== dragData.originalDateIndex) {
          console.log('🔧 日付間移動 - 水平移動実行:', {
            originalDateIndex: dragData.originalDateIndex,
            targetDateIndex,
            columnWidthPercent,
            snappedLeft,
          })
        }
      }

      return { snappedTop, snappedLeft, hour, minute }
    },
    [snapToQuarterHour, viewMode, displayDates]
  )

  // ヘルパー関数: ドラッグ要素の位置更新
  const updateDragElementPosition = useCallback(
    (
      dragData: Pick<DragState, 'dragElement' | 'originalPosition'> & { initialRect: DOMRect },
      deltaX: number,
      deltaY: number
    ) => {
      if (!dragData.dragElement || !dragData.initialRect) return

      let newLeft = dragData.initialRect.left + deltaX
      let newTop = dragData.initialRect.top + deltaY

      // Get calendar container for boundary constraints
      const _calendarContainer =
        (document.querySelector('[data-calendar-main]') as HTMLElement) ||
        (document.querySelector('.calendar-main') as HTMLElement) ||
        (document.querySelector('main') as HTMLElement)

      if (_calendarContainer) {
        const containerRect = _calendarContainer.getBoundingClientRect()
        const elementWidth = dragData.dragElement.offsetWidth
        const elementHeight = dragData.dragElement.offsetHeight

        newLeft = Math.max(containerRect.left, Math.min(containerRect.right - elementWidth, newLeft))
        newTop = Math.max(containerRect.top, Math.min(containerRect.bottom - elementHeight, newTop))
      }

      dragData.dragElement.style.left = `${newLeft}px`
      dragData.dragElement.style.top = `${newTop}px`

      console.log('🎯 ドラッグ要素移動:', {
        deltaX,
        deltaY,
        newLeft,
        newTop,
        originalLeft: dragData.initialRect.left,
        originalTop: dragData.initialRect.top,
      })
    },
    []
  )

  // ヘルパー関数: プレビュー時間計算
  const calculatePreviewTime = useCallback(
    (
      dragData: Pick<DragState, 'draggedEventId' | 'originalDateIndex'> & { eventDuration?: number },
      hour: number,
      minute: number,
      targetDateIndex: number
    ) => {
      const event = plans.find((e) => e.id === dragData.draggedEventId)
      let durationMs = 60 * 60 * 1000

      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      } else if (dragData.eventDuration) {
        durationMs = (dragData.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
      }

      // 期間を15分単位に丸める
      const durationMinutes = Math.round(durationMs / (60 * 1000))
      const snappedDurationMinutes = Math.round(durationMinutes / 15) * 15
      durationMs = snappedDurationMinutes * 60 * 1000

      let targetDate = date
      if (viewMode !== 'day' && displayDates && targetDateIndex in displayDates && displayDates[targetDateIndex]) {
        targetDate = displayDates[targetDateIndex]

        if (targetDateIndex !== dragData.originalDateIndex) {
          console.log('🎯 プレビュー日付計算（非連続対応）:', {
            targetDateIndex,
            originalDateIndex: dragData.originalDateIndex,
            targetDate: targetDate.toDateString(),
            originalDate: displayDates[dragData.originalDateIndex]?.toDateString?.(),
          })
        }
      }

      if (!targetDate || isNaN(targetDate.getTime())) {
        targetDate = date
      }

      const previewStartTime = new Date(targetDate)
      previewStartTime.setHours(hour, minute, 0, 0)
      const previewEndTime = new Date(previewStartTime.getTime() + durationMs)

      // 終了時刻を15分単位にスナップ
      const endMinutes = previewEndTime.getMinutes()
      const snappedEndMinutes = Math.round(endMinutes / 15) * 15
      previewEndTime.setMinutes(snappedEndMinutes, 0, 0)

      return { previewStartTime, previewEndTime }
    },
    [plans, date, viewMode, displayDates]
  )

  // ヘルパー関数: 時間表示更新
  const updateTimeDisplay = useCallback(
    (dragData: Pick<DragState, 'dragElement'>, previewStartTime: Date, previewEndTime: Date) => {
      if (!dragData.dragElement) return

      const timeElement = dragData.dragElement.querySelector('.event-time')
      if (timeElement) {
        const formattedTimeRange = formatTimeRange(previewStartTime, previewEndTime, '24h')
        timeElement.textContent = formattedTimeRange

        console.log('🕐 ドラッグ要素時間更新:', {
          formattedTimeRange,
          start: previewStartTime.toLocaleTimeString(),
          end: previewEndTime.toLocaleTimeString(),
        })
      }
    },
    []
  )

  // ドラッグ処理のメイン関数（複雑度削減版）
  const handleDragging = useCallback(
    (
      dragData: { [key: string]: unknown },
      constrainedX: number,
      constrainedY: number,
      deltaX: number,
      deltaY: number,
      targetDateIndex: number
    ) => {
      // TODO(#389): dragDataRefの型とDragStateの型を統一する
      const { snappedTop, snappedLeft, hour, minute } = calculateSnappedPosition(
        dragData as Pick<DragState, 'originalPosition' | 'originalDateIndex'> & { originalTop: number },
        deltaY,
        targetDateIndex
      )

      updateDragElementPosition(
        dragData as Pick<DragState, 'dragElement' | 'originalPosition'> & { initialRect: DOMRect },
        deltaX,
        deltaY
      )

      const { previewStartTime, previewEndTime } = calculatePreviewTime(
        dragData as Pick<DragState, 'draggedEventId' | 'originalDateIndex'> & { eventDuration?: number },
        hour,
        minute,
        targetDateIndex
      )

      updateTimeDisplay(dragData as Pick<DragState, 'dragElement'>, previewStartTime, previewEndTime)

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: constrainedX, y: constrainedY },
        snappedPosition: { top: snappedTop, left: snappedLeft },
        previewTime: { start: previewStartTime, end: previewEndTime },
        targetDateIndex,
      }))
    },
    [calculateSnappedPosition, updateDragElementPosition, calculatePreviewTime, updateTimeDisplay]
  )

  // 境界制限処理（handleMouseMoveより前に定義）
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

  // 日付インデックス計算（handleMouseMoveより前に定義）
  const calculateTargetDateIndex = useCallback(
    (constrainedX: number, dragData: { [key: string]: unknown }, deltaX: number): number => {
      // TODO(#389): dragDataRefの型とDragStateの型を統一する
      const typedDragData = dragData as {
        originalDateIndex: number
        hasMoved?: boolean
        originalElement?: HTMLElement
        columnWidth?: number
      }
      let targetDateIndex = typedDragData.originalDateIndex

      if (viewMode !== 'day' && displayDates && typedDragData.hasMoved) {
        const gridContainer =
          (typedDragData.originalElement?.closest('.flex') as HTMLElement) ||
          (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
          (typedDragData.originalElement?.parentElement?.parentElement as HTMLElement)

        if (gridContainer && typedDragData.columnWidth && typedDragData.columnWidth > 0) {
          const rect = gridContainer.getBoundingClientRect()
          const relativeX = Math.max(0, Math.min(constrainedX - rect.left, rect.width))

          const columnIndex = Math.floor(relativeX / typedDragData.columnWidth)
          const newTargetIndex = Math.max(0, Math.min(displayDates.length - 1, columnIndex))

          targetDateIndex = newTargetIndex

          // デバッグログ
          if (Math.abs(newTargetIndex - typedDragData.originalDateIndex) > 0 && Math.abs(deltaX) > 30) {
            console.log('🔧 日付間移動（非連続日付対応）:', {
              originalIndex: typedDragData.originalDateIndex,
              originalDate: displayDates[typedDragData.originalDateIndex]?.toDateString?.(),
              newTargetIndex,
              targetDate: displayDates[newTargetIndex]?.toDateString?.(),
              relativeX,
              columnWidth: typedDragData.columnWidth,
              columnIndex,
              isNonConsecutive: displayDates.length < 7,
            })
          }
        }
      }

      return targetDateIndex
    },
    [viewMode, displayDates]
  )

  // ドラッグ要素のクリーンアップ
  const cleanupDragElements = useCallback(() => {
    if (dragState.dragElement) {
      dragState.dragElement.remove()
    }

    if (dragDataRef.current?.originalElement) {
      dragDataRef.current.originalElement.style.opacity = '1'
    }
  }, [dragState.dragElement])

  // 状態リセット
  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      isResizing: false,
      draggedEventId: null,
      dragStartPosition: null,
      currentPosition: null,
      originalPosition: null,
      snappedPosition: null,
      previewTime: null,
      recentlyDragged: false,
      recentlyResized: false,
      dragElement: null,
      ghostElement: null,
    })
    dragDataRef.current = null
  }, [])

  // クリック処理
  const handleEventClick = useCallback(() => {
    if (!dragDataRef.current || dragDataRef.current.hasMoved || !onPlanClick) {
      return false
    }

    const eventToClick = plans.find((e) => e.id === dragDataRef.current!.eventId)
    if (eventToClick) {
      resetDragState()
      onPlanClick(eventToClick)
      return true
    }
    return false
  }, [plans, onPlanClick, resetDragState])

  // マウス移動処理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if ((!dragState.isDragging && !dragState.isResizing) || !dragDataRef.current) return

      const dragData = dragDataRef.current

      // 自動スクロール処理
      const scrollArea = document.querySelector('[data-calendar-scroll]')
      const scrollContainer = scrollArea?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      if (scrollContainer) {
        const scrollRect = scrollContainer.getBoundingClientRect()
        const scrollThreshold = 80 // スクロール開始の閾値（px）
        const scrollSpeed = 10 // スクロール速度（px）

        // 上端に近い場合は上にスクロール
        if (e.clientY - scrollRect.top < scrollThreshold) {
          scrollContainer.scrollTop -= scrollSpeed
        }
        // 下端に近い場合は下にスクロール
        else if (scrollRect.bottom - e.clientY < scrollThreshold) {
          scrollContainer.scrollTop += scrollSpeed
        }
      }

      // 累積スクロール量を計算
      const currentScrollTop = scrollContainer?.scrollTop || 0
      const initialScrollTop = dragData.initialScrollTop || 0
      const totalScrollDelta = currentScrollTop - initialScrollTop

      const { constrainedX, constrainedY } = getConstrainedPosition(e.clientX, e.clientY)
      const deltaX = constrainedX - dragData.startX
      // 累積スクロール量を考慮してdeltaYを調整
      const deltaY = constrainedY - dragData.startY + totalScrollDelta

      if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
        dragData.hasMoved = true
      }

      if (Math.abs(deltaX) > 30) {
        console.log('🔧 水平移動検出:', { deltaX, columnWidth: dragData.columnWidth })
      }

      const targetDateIndex = calculateTargetDateIndex(constrainedX, dragData, deltaX)

      if (dragState.isResizing) {
        handleResizing(dragData, constrainedX, constrainedY, deltaY)
      } else if (dragState.isDragging) {
        handleDragging(dragData, constrainedX, constrainedY, deltaX, deltaY, targetDateIndex)
      }
    },
    [
      dragState.isDragging,
      dragState.isResizing,
      getConstrainedPosition,
      calculateTargetDateIndex,
      handleResizing,
      handleDragging,
    ]
  )

  // リサイズ処理
  const handleResize = useCallback(() => {
    if (!dragDataRef.current || !dragState.snappedPosition?.height) {
      return
    }

    console.log('🟡 リサイズ終了:', {
      eventId: dragDataRef.current.eventId,
      newHeight: dragState.snappedPosition?.height,
    })

    // 実際にリサイズが発生した場合のみ更新
    if (!onPlanUpdate || !dragDataRef.current.hasMoved) {
      return
    }

    const event = plans.find((e) => e.id === dragDataRef.current.eventId)
    if (!event?.startDate) {
      return
    }

    const newDurationMs = (dragState.snappedPosition.height / HOUR_HEIGHT) * 60 * 60 * 1000
    const newEndTime = new Date(event.startDate.getTime() + newDurationMs)

    // Calendar Toast用のプランデータを準備
    const eventData = {
      id: event.id,
      title: event.title || t('calendar.event.title'),
      displayStartDate: event.startDate,
      displayEndDate: newEndTime,
      duration: Math.round(newDurationMs / (1000 * 60)), // 分単位
      isMultiDay: event.startDate.toDateString() !== newEndTime.toDateString(),
      isRecurring: false,
    }

    // プラン更新を実行
    try {
      const promise = onPlanUpdate(dragDataRef.current.eventId, {
        startTime: event.startDate,
        endTime: newEndTime,
      })

      // Promiseが返される場合
      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => {
            calendarToast.eventUpdated(eventData)
          })
          .catch((error: unknown) => {
            console.error('Failed to resize event:', error)
            calendarToast.error(t('calendar.event.resizeFailed'))
          })
      } else {
        // 同期的な場合
        calendarToast.eventUpdated(eventData)
      }
    } catch (error) {
      console.error('Failed to resize event:', error)
      calendarToast.error(t('calendar.event.resizeFailed'))
    }
  }, [plans, onPlanUpdate, dragState.snappedPosition, calendarToast, t])

  // リサイズ完了処理
  const handleResizeComplete = useCallback(() => {
    handleResize()

    const actuallyResized = dragDataRef.current.hasMoved

    setDragState({
      isDragging: false,
      isResizing: false,
      draggedEventId: null,
      dragStartPosition: null,
      currentPosition: null,
      originalPosition: null,
      snappedPosition: null,
      previewTime: null,
      recentlyDragged: actuallyResized,
      recentlyResized: actuallyResized,
      dragElement: null,
      ghostElement: null,
    })

    dragDataRef.current = null

    if (actuallyResized) {
      setTimeout(() => {
        setDragState((prev) => ({ ...prev, recentlyDragged: false, recentlyResized: false }))
      }, 1000)
    }
  }, [handleResize])

  // ターゲット日付計算
  const calculateTargetDate = useCallback(
    (targetDateIndex: number) => {
      let targetDate = date

      if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
        targetDate = displayDates[targetDateIndex]
        console.log('🎯 ドロップ時のターゲット日付決定（非連続対応）:', {
          targetDateIndex,
          targetDate: targetDate.toDateString(),
          originalDateIndex: dragDataRef.current.originalDateIndex,
          originalDate: displayDates[dragDataRef.current.originalDateIndex]?.toDateString?.(),
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
    },
    [date, viewMode, displayDates]
  )

  // 新しい時刻を計算する
  const calculateNewTime = useCallback(
    (newTop: number, targetDateIndex: number) => {
      // 新しい時刻を計算（15分単位に丸める）
      const hourDecimal = newTop / HOUR_HEIGHT
      const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
      const minute = Math.round(Math.max(0, ((hourDecimal - hour) * 60) / 15)) * 15

      // ターゲット日付を決定
      const targetDate = calculateTargetDate(targetDateIndex)

      // 新しい開始時刻を作成
      const newStartTime = new Date(targetDate)
      newStartTime.setHours(hour, minute, 0, 0)

      return newStartTime
    },
    [calculateTargetDate]
  )

  // プラン期間を計算する
  const calculateEventDuration = useCallback(
    (eventId: string) => {
      const event = plans.find((e) => e.id === eventId)
      let durationMs = 60 * 60 * 1000 // デフォルト1時間

      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      } else if (dragDataRef.current?.eventDuration) {
        durationMs = (dragDataRef.current.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
      }

      return { event, durationMs }
    },
    [plans]
  )

  // Toast通知を処理する
  const handleEventUpdateToast = useCallback(
    async (promise: Promise<void>, plan: CalendarPlan, newStartTime: Date, durationMs: number) => {
      if (!plan) return

      const previousStartTime = plan.startDate || date
      // 時間が実際に変更されたかチェック
      const timeChanged = Math.abs(newStartTime.getTime() - previousStartTime.getTime()) > 1000 // 1秒以上の差

      if (!timeChanged) {
        console.log('🔧 時間変更なし - Toast表示をスキップ:', {
          previousTime: previousStartTime.toISOString(),
          newTime: newStartTime.toISOString(),
          timeDifference: Math.abs(newStartTime.getTime() - previousStartTime.getTime()),
        })
        return
      }

      const eventData = {
        id: plan.id,
        title: plan.title || t('calendar.event.title'),
        displayStartDate: newStartTime,
        displayEndDate: new Date(newStartTime.getTime() + durationMs),
        duration: Math.round(durationMs / (1000 * 60)), // 分単位
        isMultiDay: false,
        isRecurring: false,
      }

      // Promiseが返される場合
      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => {
            // 移動成功のToast表示
            calendarToast.eventMoved(eventData, newStartTime, {
              undoAction: async () => {
                try {
                  const originalEndTime = new Date(previousStartTime.getTime() + durationMs)
                  await onPlanUpdate!(dragDataRef.current!.eventId, {
                    startTime: previousStartTime,
                    endTime: originalEndTime,
                  })
                  calendarToast.success(t('calendar.event.undoMove'))
                } catch (error) {
                  calendarToast.error(t('calendar.event.undoFailed'))
                }
              },
            })
          })
          .catch((error: unknown) => {
            console.error('Failed to update event time:', error)
            calendarToast.error(t('calendar.event.moveFailed'))
          })
      } else {
        // 同期的な場合（Promiseが返されない場合）
        calendarToast.eventMoved(eventData, newStartTime)
      }
    },
    [date, calendarToast, onPlanUpdate, t]
  )

  // プラン更新処理を実行する
  const executeEventUpdate = useCallback(
    async (newStartTime: Date) => {
      console.log('🔍 executeEventUpdate 開始:', {
        hasOnPlanUpdate: !!onPlanUpdate,
        eventId: dragDataRef.current?.eventId,
        hasMoved: dragDataRef.current?.hasMoved,
      })

      if (!onPlanUpdate || !dragDataRef.current?.eventId || !dragDataRef.current?.hasMoved) {
        console.log('⚠️ プラン更新スキップ:', {
          hasOnPlanUpdate: !!onPlanUpdate,
          eventId: dragDataRef.current?.eventId,
          hasMoved: dragDataRef.current?.hasMoved,
        })
        return
      }

      const { event, durationMs } = calculateEventDuration(dragDataRef.current.eventId)

      // eventがundefinedの場合は早期リターン
      if (!event) {
        console.warn('Plan not found for update')
        return
      }

      const newEndTime = new Date(newStartTime.getTime() + durationMs)

      // エッジケース: 終了時刻が開始時刻より前の場合は修正
      if (newEndTime <= newStartTime) {
        newEndTime.setTime(newStartTime.getTime() + 60 * 60 * 1000) // 最低1時間の期間
      }

      try {
        console.log('🚀 プラン更新実行:', {
          eventId: dragDataRef.current.eventId,
          newStartTime: newStartTime.toISOString(),
          newEndTime: newEndTime.toISOString(),
        })

        const result = onPlanUpdate(dragDataRef.current.eventId, {
          startTime: newStartTime,
          endTime: newEndTime,
        })

        // Toast通知の処理
        await handleEventUpdateToast(Promise.resolve(result), event, newStartTime, durationMs)
      } catch (error) {
        console.error('Failed to update event time:', error)
        calendarToast.error(t('calendar.event.moveFailed'))
      }
    },
    [onPlanUpdate, calculateEventDuration, handleEventUpdateToast, calendarToast, t]
  )

  // ドラッグ完了後の状態リセット
  const completeDragOperation = useCallback((actuallyDragged: boolean) => {
    // ドラッグ状態をリセット
    setDragState({
      isDragging: false,
      isResizing: false,
      draggedEventId: null,
      dragStartPosition: null,
      currentPosition: null,
      originalPosition: null,
      snappedPosition: null,
      previewTime: null,
      recentlyDragged: actuallyDragged, // 実際にドラッグした場合のみクリック無効化
      recentlyResized: false, // ドラッグ終了時はリサイズフラグをクリア
      dragElement: null,
      ghostElement: null,
    })
    dragDataRef.current = null

    // 実際にドラッグが発生した場合のみ、1000ms後にrecentlyDraggedを解除（長めに設定）
    if (actuallyDragged) {
      setTimeout(() => {
        setDragState((prev) => ({
          ...prev,
          recentlyDragged: false,
        }))
      }, 1000)
    }
  }, [])

  // ドラッグ終了
  const handleMouseUp = useCallback(async () => {
    cleanupDragElements()

    if (handleEventClick()) {
      return
    }

    if (
      (!dragState.isDragging && !dragState.isResizing) ||
      !dragDataRef.current ||
      !dragState.currentPosition ||
      !dragState.dragStartPosition
    ) {
      resetDragState()
      return
    }

    if (dragState.isResizing) {
      handleResizeComplete()
      return
    }

    const deltaY = dragState.currentPosition.y - dragState.dragStartPosition.y
    const newTop = dragDataRef.current.originalTop + deltaY
    const targetDateIndex =
      dragState.targetDateIndex !== undefined ? dragState.targetDateIndex : dragDataRef.current.originalDateIndex

    // 新しい時刻を計算
    const newStartTime = calculateNewTime(newTop, targetDateIndex)

    // プラン更新を実行
    await executeEventUpdate(newStartTime)

    // 実際にドラッグが発生した場合のみrecentlyDraggedを設定
    const actuallyDragged = dragDataRef.current?.hasMoved || false

    // ドラッグ操作を完了
    completeDragOperation(actuallyDragged)
  }, [
    dragState,
    calculateNewTime,
    executeEventUpdate,
    completeDragOperation,
    handleEventClick,
    resetDragState,
    handleResizeComplete,
    cleanupDragElements,
  ])

  // プランドロップのヘルパー
  const handleEventDrop = useCallback(
    (eventId: string, newStartTime: Date) => {
      if (onPlanUpdate) {
        // プランの元の期間を取得して新しい終了時刻を計算
        const event = plans.find((e) => e.id === eventId)
        let durationMs = 60 * 60 * 1000 // デフォルト1時間

        if (event?.startDate && event?.endDate) {
          durationMs = event.endDate.getTime() - event.startDate.getTime()
        }

        const newEndTime = new Date(newStartTime.getTime() + durationMs)
        onPlanUpdate(eventId, { startTime: newStartTime, endTime: newEndTime })
      }
    },
    [onPlanUpdate, plans]
  )

  // リサイズ開始
  const handleResizeStart = useCallback(
    (
      eventId: string,
      direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number }
    ) => {
      // 左クリック以外は無視
      if (e.button !== 0) return

      console.log('🟡 リサイズ開始:', { eventId, direction, originalPosition })

      const startPosition = { x: e.clientX, y: e.clientY }

      // ドラッグデータを設定
      dragDataRef.current = {
        eventId,
        startX: e.clientX,
        startY: e.clientY,
        originalTop: originalPosition.top,
        eventDuration: originalPosition.height,
        hasMoved: false,
        originalElement: null,
        originalDateIndex: 0,
        columnWidth: undefined,
      }

      setDragState({
        isDragging: false,
        isResizing: true,
        draggedEventId: eventId,
        dragStartPosition: startPosition,
        currentPosition: startPosition,
        originalPosition,
        snappedPosition: { top: originalPosition.top, height: originalPosition.height },
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        dragElement: null,
        ghostElement: null,
      })
    },
    []
  )

  // マウスイベントリスナーを設定
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      // ドラッグまたはリサイズ中の場合、ドキュメント全体でマウスイベントをリッスン
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  return {
    dragState,
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop,
      handleResizeStart,
    },
  }
}
