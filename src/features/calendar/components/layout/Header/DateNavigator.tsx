'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { selection, secondary, text } from '@/config/theme/colors'

export type NavigationDirection = 'prev' | 'next' | 'today'

interface DateNavigatorProps {
  onNavigate: (direction: NavigationDirection) => void
  todayLabel?: string
  showTodayButton?: boolean
  showArrows?: boolean
  className?: string
  buttonClassName?: string
  arrowSize?: 'sm' | 'md' | 'lg'
}

const arrowSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

/**
 * 日付ナビゲーション
 * 前後移動と今日への移動を提供
 */
export function DateNavigator({
  onNavigate,
  todayLabel = 'Today',
  showTodayButton = true,
  showArrows = true,
  className,
  buttonClassName,
  arrowSize = 'md'
}: DateNavigatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 今日ボタン */}
      {showTodayButton && (
        <button
          onClick={() => onNavigate('today')}
          className={cn(
            'px-4 py-2 text-sm font-medium',
            'rounded-md transition-colors',
            secondary.DEFAULT,
            secondary.text,
            secondary.hover,
            'flex items-center gap-2',
            buttonClassName
          )}
          title="Go to today"
        >
          <span>{todayLabel}</span>
        </button>
      )}
      
      {/* 前後ナビゲーション */}
      {showArrows && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('prev')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              secondary.hover,
              text.muted,
              'hover:text-foreground'
            )}
            title="Previous period"
            aria-label="Previous"
          >
            <ChevronLeft className={arrowSizes[arrowSize]} />
          </button>
          <button
            onClick={() => onNavigate('next')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              secondary.hover,
              text.muted,
              'hover:text-foreground'
            )}
            title="Next period"
            aria-label="Next"
          >
            <ChevronRight className={arrowSizes[arrowSize]} />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * コンパクトな日付ナビゲーション（矢印のみ）
 */
export function CompactDateNavigator({
  onNavigate,
  className,
  arrowSize = 'sm'
}: Pick<DateNavigatorProps, 'onNavigate' | 'className' | 'arrowSize'>) {
  return (
    <DateNavigator
      onNavigate={onNavigate}
      showTodayButton={false}
      showArrows={true}
      className={className}
      arrowSize={arrowSize}
    />
  )
}