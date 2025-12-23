'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useHapticFeedback } from './useHapticFeedback'

interface UsePullToRefreshOptions {
  /** リフレッシュ時のコールバック */
  onRefresh: () => Promise<void>
  /** リフレッシュをトリガーする距離（px） */
  threshold?: number
  /** 最大引っ張り距離（px） */
  maxPullDistance?: number
  /** 無効化フラグ */
  disabled?: boolean
}

interface UsePullToRefreshReturn {
  /** スクロールコンテナに設定するref */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** 現在の引っ張り距離（0〜maxPullDistance） */
  pullDistance: number
  /** リフレッシュ中かどうか */
  isRefreshing: boolean
  /** 引っ張り中かどうか */
  isPulling: boolean
  /** しきい値を超えたかどうか */
  isOverThreshold: boolean
  /** 進捗（0〜1） */
  progress: number
}

/**
 * Pull-to-Refresh フック
 *
 * モバイルデバイスで上から下にスワイプしてコンテンツを更新する機能を提供
 *
 * @see https://developer.chrome.com/blog/overscroll-behavior
 * @see https://material.io/components/progress-indicators#circular-progress-indicators
 *
 * @example
 * ```tsx
 * const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetch()
 *   },
 * })
 *
 * return (
 *   <div ref={containerRef} className="overflow-auto">
 *     {pullDistance > 0 && <RefreshIndicator progress={progress} />}
 *     {children}
 *   </div>
 * )
 * ```
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)

  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const isAtTopRef = useRef(false)
  const hasTriggeredHapticRef = useRef(false)

  const { tap, success } = useHapticFeedback()

  const isOverThreshold = pullDistance >= threshold
  const progress = Math.min(pullDistance / threshold, 1)

  // タッチ開始
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return

      const container = containerRef.current
      if (!container) return

      // スクロール位置が最上部かどうかチェック
      isAtTopRef.current = container.scrollTop <= 0
      if (!isAtTopRef.current) return

      startYRef.current = e.touches[0]!.clientY
      currentYRef.current = startYRef.current
      hasTriggeredHapticRef.current = false
    },
    [disabled, isRefreshing]
  )

  // タッチ移動
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || !isAtTopRef.current) return

      const container = containerRef.current
      if (!container) return

      // スクロール中に最上部からずれた場合はリセット
      if (container.scrollTop > 0) {
        isAtTopRef.current = false
        setPullDistance(0)
        setIsPulling(false)
        return
      }

      currentYRef.current = e.touches[0]!.clientY
      const distance = currentYRef.current - startYRef.current

      // 下方向へのスワイプのみ処理
      if (distance > 0) {
        // ラバーバンド効果（距離に応じて抵抗を増やす）
        const rubberBandDistance = Math.min(distance * 0.5, maxPullDistance)
        setPullDistance(rubberBandDistance)
        setIsPulling(true)

        // しきい値到達時にHaptic Feedback（1回のみ）
        if (rubberBandDistance >= threshold && !hasTriggeredHapticRef.current) {
          tap()
          hasTriggeredHapticRef.current = true
        }

        // ネイティブスクロールを防止
        e.preventDefault()
      }
    },
    [disabled, isRefreshing, maxPullDistance, threshold, tap]
  )

  // タッチ終了
  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return

    setIsPulling(false)

    if (isOverThreshold) {
      // リフレッシュ実行
      setIsRefreshing(true)
      success() // リフレッシュ開始時のHaptic Feedback

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      // しきい値未満の場合はリセット
      setPullDistance(0)
    }
  }, [disabled, isRefreshing, isPulling, isOverThreshold, onRefresh, success])

  // イベントリスナーの登録
  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    // passive: false でpreventDefaultを有効化
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled])

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling,
    isOverThreshold,
    progress,
  }
}
