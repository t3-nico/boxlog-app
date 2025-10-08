'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface TimeSelection {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

interface UseTimeSelectionProps {
  hourHeight: number
  timeColumnWidth: number
  onTimeRangeSelect?: (selection: TimeSelection) => void
}

interface UseTimeSelectionReturn {
  isSelecting: boolean
  selection: TimeSelection | null
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: (e: React.MouseEvent) => void
  selectionStyle: React.CSSProperties | null
  clearSelection: () => void
}

/**
 * タイムグリッドでのドラッグ選択機能を提供するフック
 */
export function useTimeSelection({
  hourHeight,
  timeColumnWidth,
  onTimeRangeSelect,
}: UseTimeSelectionProps): UseTimeSelectionReturn {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<TimeSelection | null>(null)
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  // 座標から時間を計算するヘルパー
  const pixelsToTime = useCallback(
    (y: number) => {
      const totalMinutes = (y / hourHeight) * 60
      const hour = Math.floor(totalMinutes / 60)
      const minute = Math.floor((totalMinutes % 60) / 15) * 15 // 15分単位に丸める
      return { hour: Math.max(0, Math.min(23, hour)), minute: Math.max(0, Math.min(45, minute)) }
    },
    [hourHeight]
  )

  // マウスダウンイベント
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.currentTarget as HTMLElement
      containerRef.current = target

      const rect = target.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top + target.scrollTop

      // 時間列の外側のみ対応
      if (x < timeColumnWidth) return

      const startTime = pixelsToTime(y)
      setSelectionStart(startTime)
      setSelection({
        startHour: startTime.hour,
        startMinute: startTime.minute,
        endHour: startTime.hour,
        endMinute: startTime.minute + 15, // 最小15分
      })
      setIsSelecting(true)

      // ドラッグ中のマウス移動を防ぐ
      e.preventDefault()
    },
    [timeColumnWidth, pixelsToTime]
  )

  // マウス移動イベント
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !selectionStart || !containerRef.current) return

      const target = containerRef.current
      const rect = target.getBoundingClientRect()
      const y = e.clientY - rect.top + target.scrollTop

      const currentTime = pixelsToTime(y)

      // 開始時刻と終了時刻を決定
      let startHour, startMinute, endHour, endMinute

      if (
        currentTime.hour < selectionStart.hour ||
        (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)
      ) {
        // 上向きにドラッグ
        startHour = currentTime.hour
        startMinute = currentTime.minute
        endHour = selectionStart.hour
        endMinute = selectionStart.minute + 15
      } else {
        // 下向きにドラッグ
        startHour = selectionStart.hour
        startMinute = selectionStart.minute
        endHour = currentTime.hour
        endMinute = currentTime.minute + 15
      }

      // 最低15分の選択を保証
      if (endHour === startHour && endMinute <= startMinute) {
        endMinute = startMinute + 15
        if (endMinute >= 60) {
          endHour += 1
          endMinute = 0
        }
      }

      setSelection({
        startHour: Math.max(0, startHour),
        startMinute: Math.max(0, startMinute),
        endHour: Math.min(23, endHour),
        endMinute: Math.min(59, endMinute),
      })
    },
    [isSelecting, selectionStart, pixelsToTime]
  )

  // マウスアップイベント
  const handleMouseUp = useCallback(
    (_e: React.MouseEvent) => {
      if (!isSelecting || !selection) return

      setIsSelecting(false)

      // 最小選択時間（15分）をチェック
      const startTotalMinutes = selection.startHour * 60 + selection.startMinute
      const endTotalMinutes = selection.endHour * 60 + selection.endMinute
      const durationMinutes = endTotalMinutes - startTotalMinutes

      if (durationMinutes >= 15) {
        onTimeRangeSelect?.(selection)
      }

      // 少し遅延してselectionをクリア（視覚的フィードバックのため）
      setTimeout(() => {
        setSelection(null)
        setSelectionStart(null)
      }, 100)
    },
    [isSelecting, selection, onTimeRangeSelect]
  )

  // 選択範囲の表示スタイルを計算
  const selectionStyle: React.CSSProperties | null = selection
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${(selection.startHour * 60 + selection.startMinute) * (hourHeight / 60)}px`,
        height: `${(selection.endHour * 60 + selection.endMinute - (selection.startHour * 60 + selection.startMinute)) * (hourHeight / 60)}px`,
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
        border: '2px solid rgb(59, 130, 246)', // blue-500
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 1000,
      }
    : null

  // 選択をクリア
  const clearSelection = useCallback(() => {
    setSelection(null)
    setSelectionStart(null)
    setIsSelecting(false)
  }, [])

  // グローバルマウスイベントの設定（ドラッグ中の移動とアップを捕捉）
  useEffect(() => {
    if (!isSelecting) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top + containerRef.current.scrollTop

      if (selectionStart) {
        const currentTime = pixelsToTime(y)

        let startHour, startMinute, endHour, endMinute

        if (
          currentTime.hour < selectionStart.hour ||
          (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)
        ) {
          startHour = currentTime.hour
          startMinute = currentTime.minute
          endHour = selectionStart.hour
          endMinute = selectionStart.minute + 15
        } else {
          startHour = selectionStart.hour
          startMinute = selectionStart.minute
          endHour = currentTime.hour
          endMinute = currentTime.minute + 15
        }

        if (endHour === startHour && endMinute <= startMinute) {
          endMinute = startMinute + 15
          if (endMinute >= 60) {
            endHour += 1
            endMinute = 0
          }
        }

        setSelection({
          startHour: Math.max(0, startHour),
          startMinute: Math.max(0, startMinute),
          endHour: Math.min(23, endHour),
          endMinute: Math.min(59, endMinute),
        })
      }
    }

    const handleGlobalMouseUp = () => {
      if (selection) {
        const startTotalMinutes = selection.startHour * 60 + selection.startMinute
        const endTotalMinutes = selection.endHour * 60 + selection.endMinute
        const durationMinutes = endTotalMinutes - startTotalMinutes

        if (durationMinutes >= 15) {
          onTimeRangeSelect?.(selection)
        }
      }

      setIsSelecting(false)
      setTimeout(() => {
        setSelection(null)
        setSelectionStart(null)
      }, 100)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isSelecting, selectionStart, selection, pixelsToTime, onTimeRangeSelect])

  return {
    isSelecting,
    selection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    selectionStyle,
    clearSelection,
  }
}
