'use client'

import { useCallback, useState } from 'react'

import { format, getWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import type { CalendarViewType } from '../../../types/calendar.types'

export type MobileNavigationDirection = 'prev' | 'next' | 'today'

interface MobileHeaderProps {
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: MobileNavigationDirection) => void
  onMenuToggle?: () => void
  onViewChange?: (view: CalendarViewType) => void
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

/**
 * モバイル用ヘッダー
 * コンパクトな表示でタッチ操作に最適化
 */
export const MobileHeader = ({
  viewType,
  currentDate,
  onNavigate,
  onMenuToggle,
  onViewChange,
  title,
  showBackButton = false,
  onBack,
  className,
}: MobileHeaderProps) => {
  const { t } = useI18n()
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 })

  const viewLabels: Record<CalendarViewType, string> = {
    day: t('calendar.mobile.header.viewLabels.day'),
    '3day': t('calendar.mobile.header.viewLabels.3day'),
    '5day': t('calendar.mobile.header.viewLabels.5day'),
    week: t('calendar.mobile.header.viewLabels.week'),
    '2week': t('calendar.mobile.header.viewLabels.2week'),
    month: t('calendar.mobile.header.viewLabels.month'),
  }

  // jsx-no-bind optimization: Navigation handlers
  const handleViewMenuOpen = useCallback(() => {
    setIsViewMenuOpen(true)
  }, [])

  const handleNavigatePrev = useCallback(() => {
    onNavigate('prev')
  }, [onNavigate])

  const handleNavigateNext = useCallback(() => {
    onNavigate('next')
  }, [onNavigate])

  const handleViewMenuClose = useCallback(() => {
    setIsViewMenuOpen(false)
  }, [])

  const handleViewMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsViewMenuOpen(false)
    }
  }, [])

  // jsx-no-bind optimization: View change handler creator
  const createViewChangeHandler = useCallback(
    (value: CalendarViewType) => {
      return () => {
        onViewChange?.(value)
        setIsViewMenuOpen(false)
      }
    },
    [onViewChange]
  )

  // 日付の表示形式をモバイル用に短縮
  const getDateDisplay = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'M/d (E)', { locale: ja })
      case 'week':
      case '2week':
        return `${format(currentDate, 'M月')} W${weekNumber}`
      default:
        return format(currentDate, 'M月 yyyy')
    }
  }

  return (
    <header
      className={cn(
        'bg-background relative h-14',
        'flex items-center justify-between px-4',
        'sticky top-0 z-40',
        className
      )}
    >
      {/* 左側: メニューボタンまたは戻るボタン */}
      <div className="flex items-center">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="hover:bg-accent/50 -ml-2 rounded-full p-2 transition-colors"
            aria-label={t('calendar.mobile.header.back')}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onMenuToggle}
            className="hover:bg-accent/50 -ml-2 rounded-full p-2 transition-colors"
            aria-label={t('calendar.mobile.header.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 中央: 日付とビュー表示 */}
      <div className="flex min-w-0 flex-1 flex-col items-center">
        {title ? (
          <h1 className="truncate text-lg font-semibold">{title}</h1>
        ) : (
          <>
            {/* 日付表示 */}
            <div className="text-lg font-semibold">{getDateDisplay()}</div>
            {/* ビュー表示 */}
            <button
              type="button"
              onClick={handleViewMenuOpen}
              className="text-muted-foreground hover:bg-accent/50 rounded px-2 py-0.5 text-xs transition-colors"
            >
              {viewLabels[viewType] || viewType}
              {t('calendar.mobile.header.viewSuffix')}
            </button>
          </>
        )}
      </div>

      {/* 右側: ナビゲーション */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleNavigatePrev}
          className="hover:bg-accent/50 rounded-full p-2 transition-colors"
          aria-label={t('calendar.mobile.header.prevPeriod')}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleNavigateNext}
          className="hover:bg-accent/50 rounded-full p-2 transition-colors"
          aria-label={t('calendar.mobile.header.nextPeriod')}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ビュー切り替えメニュー */}
      {isViewMenuOpen && onViewChange ? (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={handleViewMenuClose}
            onKeyDown={handleViewMenuKeyDown}
            role="button"
            tabIndex={0}
            aria-label={t('calendar.mobile.header.closeMenu')}
          />

          {/* メニュー */}
          <div className="bg-background border-border absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border shadow-lg">
            <div className="py-2">
              {Object.entries(viewLabels).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={createViewChangeHandler(value as CalendarViewType)}
                  className={cn(
                    'hover:bg-accent/50 w-full px-4 py-3 text-left text-sm transition-colors',
                    viewType === value && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  {label}
                  {t('calendar.mobile.header.viewSuffix')}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </header>
  )
}
