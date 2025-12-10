'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type NavigationDirection = 'prev' | 'next' | 'today'

interface DateNavigatorProps {
  onNavigate: (direction: NavigationDirection) => void
  todayLabel?: string | undefined
  showTodayButton?: boolean | undefined
  showArrows?: boolean | undefined
  className?: string | undefined
  buttonClassName?: string | undefined
  arrowSize?: 'sm' | 'md' | 'lg' | undefined
}

const arrowSizes = {
  sm: 'size-4',
  md: 'size-4',
  lg: 'size-5',
}

/**
 * 日付ナビゲーション
 * 前後移動と今日への移動を提供
 *
 * **デザイン仕様**:
 * - ボタン: 32px（8pxグリッド準拠）
 * - アイコン: 16px（size-4）
 */
export const DateNavigator = ({
  onNavigate,
  todayLabel = 'Today',
  showTodayButton = true,
  showArrows = true,
  className,
  buttonClassName,
  arrowSize = 'md',
}: DateNavigatorProps) => {
  const t = useTranslations()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 今日ボタン - 32px（8pxグリッド準拠） */}
      {showTodayButton != null ? (
        <button
          type="button"
          onClick={() => onNavigate('today')}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), buttonClassName)}
          title={t('calendar.actions.goToToday')}
        >
          <span>{todayLabel}</span>
        </button>
      ) : null}

      {/* 前後ナビゲーション - 32px（8pxグリッド準拠） */}
      {showArrows != null ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate('prev')}
            className={cn(
              'flex size-8 items-center justify-center rounded-full transition-colors',
              'hover:bg-state-hover',
              'text-muted-foreground'
            )}
            title="Previous period"
            aria-label="Previous"
          >
            <ChevronLeft className={arrowSizes[arrowSize]} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('next')}
            className={cn(
              'flex size-8 items-center justify-center rounded-full transition-colors',
              'hover:bg-state-hover',
              'text-muted-foreground'
            )}
            title="Next period"
            aria-label="Next"
          >
            <ChevronRight className={arrowSizes[arrowSize]} />
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * コンパクトな日付ナビゲーション（矢印のみ）
 */
export const CompactDateNavigator = ({
  onNavigate,
  className,
  arrowSize = 'sm',
}: Pick<DateNavigatorProps, 'onNavigate' | 'className' | 'arrowSize'>) => {
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
