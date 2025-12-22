'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { HoverTooltip } from '@/components/ui/tooltip'
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
        <HoverTooltip content={t('calendar.actions.goToToday')} side="bottom">
          <button
            type="button"
            onClick={() => onNavigate('today')}
            className={cn(buttonVariants({ variant: 'outline' }), buttonClassName)}
          >
            <span>{todayLabel}</span>
          </button>
        </HoverTooltip>
      ) : null}

      {/* 前後ナビゲーション - 32px（8pxグリッド準拠） */}
      {showArrows != null ? (
        <div className="flex items-center gap-1">
          <HoverTooltip content={t('calendar.navigation.previous')} side="bottom">
            <button
              type="button"
              onClick={() => onNavigate('prev')}
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-colors',
                'hover:bg-state-hover',
                'text-muted-foreground'
              )}
              aria-label={t('calendar.navigation.previous')}
            >
              <ChevronLeft className={arrowSizes[arrowSize]} />
            </button>
          </HoverTooltip>
          <HoverTooltip content={t('calendar.navigation.next')} side="bottom">
            <button
              type="button"
              onClick={() => onNavigate('next')}
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-colors',
                'hover:bg-state-hover',
                'text-muted-foreground'
              )}
              aria-label={t('calendar.navigation.next')}
            >
              <ChevronRight className={arrowSizes[arrowSize]} />
            </button>
          </HoverTooltip>
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
