'use client'

import { useCallback, useRef } from 'react'
import { useHapticFeedback } from './useHapticFeedback'

interface UseLongPressOptions {
  /** ロングプレス発火までの時間（ms） */
  threshold?: number
  /** ロングプレス時のコールバック */
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void
  /** 通常クリック時のコールバック（オプション） */
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void
  /** Haptic Feedbackを有効化 */
  enableHaptic?: boolean
  /** 無効化フラグ */
  disabled?: boolean
}

interface UseLongPressReturn {
  /** タッチ/マウスイベントハンドラー */
  onTouchStart: (event: React.TouchEvent) => void
  onTouchEnd: (event: React.TouchEvent) => void
  onTouchMove: (event: React.TouchEvent) => void
  onMouseDown: (event: React.MouseEvent) => void
  onMouseUp: (event: React.MouseEvent) => void
  onMouseLeave: (event: React.MouseEvent) => void
}

/**
 * Long Press（長押し）ジェスチャーフック
 *
 * モバイルデバイスでのコンテキストメニュー表示等に使用
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/gestures
 * @see https://m3.material.io/foundations/interaction/gestures
 *
 * @example
 * ```tsx
 * const longPressHandlers = useLongPress({
 *   onLongPress: () => setContextMenuOpen(true),
 *   onClick: () => handleItemClick(),
 *   threshold: 500,
 * })
 *
 * return <div {...longPressHandlers}>Item</div>
 * ```
 */
export function useLongPress({
  threshold = 500,
  onLongPress,
  onClick,
  enableHaptic = true,
  disabled = false,
}: UseLongPressOptions): UseLongPressReturn {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressRef = useRef(false)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const { impact } = useHapticFeedback()

  // 移動しきい値（これ以上動いたらキャンセル）
  const MOVE_THRESHOLD = 10

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleStart = useCallback(
    (event: React.TouchEvent | React.MouseEvent, clientX: number, clientY: number) => {
      if (disabled) return

      isLongPressRef.current = false
      startPosRef.current = { x: clientX, y: clientY }

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true
        if (enableHaptic) {
          impact()
        }
        onLongPress(event)
      }, threshold)
    },
    [disabled, threshold, onLongPress, enableHaptic, impact]
  )

  const handleEnd = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      clearTimer()

      // ロングプレスが発火していない場合は通常クリック
      if (!isLongPressRef.current && onClick && !disabled) {
        onClick(event)
      }

      startPosRef.current = null
    },
    [clearTimer, onClick, disabled]
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!startPosRef.current) return

      // 移動距離を計算
      const deltaX = Math.abs(clientX - startPosRef.current.x)
      const deltaY = Math.abs(clientY - startPosRef.current.y)

      // しきい値を超えたらキャンセル
      if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
        clearTimer()
        startPosRef.current = null
      }
    },
    [clearTimer]
  )

  // Touch Events
  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0]
      if (touch) {
        handleStart(event, touch.clientX, touch.clientY)
      }
    },
    [handleStart]
  )

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      handleEnd(event)
    },
    [handleEnd]
  )

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0]
      if (touch) {
        handleMove(touch.clientX, touch.clientY)
      }
    },
    [handleMove]
  )

  // Mouse Events（デスクトップ対応）
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      handleStart(event, event.clientX, event.clientY)
    },
    [handleStart]
  )

  const onMouseUp = useCallback(
    (event: React.MouseEvent) => {
      handleEnd(event)
    },
    [handleEnd]
  )

  const onMouseLeave = useCallback(() => {
    clearTimer()
    startPosRef.current = null
  }, [clearTimer])

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
  }
}
