'use client'

import { useCallback, useRef, useEffect } from 'react'

import { MEDIA_QUERIES } from '@/config/ui/breakpoints'

export interface SwipeGestureOptions {
  /** スワイプと判定する最小距離（px）*/
  threshold?: number
  /** 垂直移動に対する水平移動の最小比率 */
  directionRatio?: number
  /** タッチデバイスのみで有効にするか */
  touchOnly?: boolean
  /** スワイプ中のプレビュー表示を有効にするか */
  enablePreview?: boolean
  /** 無効化 */
  disabled?: boolean
}

export interface SwipeGestureResult {
  /** スワイプ方向を検出するハンドラーを取得 */
  handlers: {
    onTouchStart: (e: React.TouchEvent | TouchEvent) => void
    onTouchMove: (e: React.TouchEvent | TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent | TouchEvent) => void
  }
  /** ref を要素に設定 */
  ref: React.RefObject<HTMLElement | null>
  /** 現在のスワイプ方向（プレビュー用） */
  swipeDirection: 'left' | 'right' | null
  /** 現在のスワイプ距離（プレビュー用） */
  swipeDistance: number
}

/**
 * スワイプジェスチャーを検出するフック
 *
 * モバイルカレンダーで左右スワイプによる期間移動に使用
 *
 * @example
 * ```tsx
 * const { handlers, ref } = useSwipeGesture({
 *   onSwipeLeft: () => navigate('next'),
 *   onSwipeRight: () => navigate('prev'),
 * })
 *
 * return <div ref={ref} {...handlers}>...</div>
 * ```
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options: SwipeGestureOptions = {}
): SwipeGestureResult {
  const { threshold = 50, directionRatio = 1.5, touchOnly = true, disabled = false } = options

  const ref = useRef<HTMLElement | null>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)
  const swipeDirection = useRef<'left' | 'right' | null>(null)
  const swipeDistance = useRef<number>(0)

  // タッチデバイスかどうかを確認
  const isTouchDevice = useRef<boolean>(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isTouchDevice.current = window.matchMedia(MEDIA_QUERIES.touch).matches
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (disabled) return
      if (touchOnly && !isTouchDevice.current) return

      const touch = 'touches' in e ? e.touches[0] : null
      if (!touch) return

      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
      touchStartTime.current = Date.now()
      isSwiping.current = true
      swipeDirection.current = null
      swipeDistance.current = 0
    },
    [disabled, touchOnly]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!isSwiping.current || disabled) return

      const touch = 'touches' in e ? e.touches[0] : null
      if (!touch) return

      const deltaX = touch.clientX - touchStartX.current
      const deltaY = touch.clientY - touchStartY.current

      // 垂直スクロールが優勢な場合はスワイプをキャンセル
      if (Math.abs(deltaY) > Math.abs(deltaX) * directionRatio) {
        isSwiping.current = false
        return
      }

      // 水平スワイプが優勢な場合はスクロールを防止
      if (Math.abs(deltaX) > Math.abs(deltaY) * directionRatio) {
        e.preventDefault()
      }

      swipeDistance.current = deltaX
      swipeDirection.current = deltaX > 0 ? 'right' : 'left'
    },
    [disabled, directionRatio]
  )

  const handleTouchEnd = useCallback(
    (_e: React.TouchEvent | TouchEvent) => {
      if (!isSwiping.current || disabled) return

      const deltaX = swipeDistance.current
      const elapsed = Date.now() - touchStartTime.current

      // 最大時間制限（500ms以内）
      const isQuickSwipe = elapsed < 500

      // しきい値を超えたかチェック
      if (Math.abs(deltaX) >= threshold && isQuickSwipe) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      // リセット
      isSwiping.current = false
      swipeDirection.current = null
      swipeDistance.current = 0
    },
    [disabled, threshold, onSwipeLeft, onSwipeRight]
  )

  // ネイティブイベントリスナー（passive: false でpreventDefaultを有効化）
  useEffect(() => {
    const element = ref.current
    if (!element || disabled) return

    const touchMoveHandler = (e: TouchEvent) => {
      handleTouchMove(e)
    }

    // passive: false でスクロールを防止可能に
    element.addEventListener('touchmove', touchMoveHandler, { passive: false })

    return () => {
      element.removeEventListener('touchmove', touchMoveHandler)
    }
  }, [handleTouchMove, disabled])

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    ref,
    swipeDirection: swipeDirection.current,
    swipeDistance: swipeDistance.current,
  }
}
