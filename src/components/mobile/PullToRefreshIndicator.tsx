'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface PullToRefreshIndicatorProps {
  /** 引っ張り距離（px） */
  pullDistance: number
  /** しきい値（px） */
  threshold?: number
  /** リフレッシュ中かどうか */
  isRefreshing: boolean
  /** 進捗（0〜1） */
  progress: number
  /** しきい値を超えたかどうか */
  isOverThreshold: boolean
}

/**
 * Pull-to-Refresh インジケーター
 *
 * 引っ張り距離に応じてアニメーションするリフレッシュインジケーター
 *
 * @see Material Design 3 - Progress Indicators
 * @see https://material.io/components/progress-indicators
 */
export function PullToRefreshIndicator({
  pullDistance,
  threshold = 80,
  isRefreshing,
  progress,
  isOverThreshold,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-center"
      style={{
        height: isRefreshing ? threshold : pullDistance,
        transition: isRefreshing ? 'height 0.2s ease-out' : 'none',
      }}
    >
      <div
        className={cn(
          'bg-surface-bright flex items-center justify-center rounded-full shadow-md',
          'border-border border',
          isOverThreshold || isRefreshing ? 'text-primary' : 'text-muted-foreground'
        )}
        style={{
          width: 40,
          height: 40,
          transform: `scale(${Math.min(progress, 1)})`,
          opacity: Math.min(progress * 1.5, 1),
          transition: isRefreshing ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {isRefreshing ? (
          // リフレッシュ中: 回転するローダー
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          // 引っ張り中: 矢印（回転で進捗を表現）
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${progress * 180}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  )
}
