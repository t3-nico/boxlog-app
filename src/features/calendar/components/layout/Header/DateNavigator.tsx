'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

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
  lg: 'h-6 w-6',
}

/**
 * 日付ナビゲーション
 * 前後移動と今日への移動を提供
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
  const { t } = useI18n()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 今日ボタン */}
      {showTodayButton != null ? (
        <button
          type="button"
          onClick={() => onNavigate('today')}
          className={cn(buttonVariants({ variant: 'outline' }), buttonClassName)}
          title={t('calendar.actions.goToToday')}
        >
          <span>{todayLabel}</span>
        </button>
      ) : null}

      {/* 前後ナビゲーション */}
      {showArrows != null ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate('prev')}
            className={cn(
              'rounded-full p-2 transition-colors',
              'hover:bg-foreground/8',
              'text-muted-foreground',
              'hover:text-foreground'
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
              'rounded-full p-2 transition-colors',
              'hover:bg-foreground/8',
              'text-muted-foreground',
              'hover:text-foreground'
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
