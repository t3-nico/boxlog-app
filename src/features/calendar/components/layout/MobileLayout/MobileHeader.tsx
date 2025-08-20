'use client'

import { useState } from 'react'
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, getWeek } from 'date-fns'
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

const viewLabels = {
  day: '日',
  '3day': '3日',
  'week-no-weekend': '平日',
  week: '週',
  '2week': '2週',
  schedule: 'リスト'
} as const

/**
 * モバイル用ヘッダー
 * コンパクトな表示でタッチ操作に最適化
 */
export function MobileHeader({
  viewType,
  currentDate,
  onNavigate,
  onMenuToggle,
  onViewChange,
  title,
  showBackButton = false,
  onBack,
  className
}: MobileHeaderProps) {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 })
  
  // 日付の表示形式をモバイル用に短縮
  const getDateDisplay = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'M/d (E)', { locale: { code: 'ja' } })
      case 'week':
      case '2week':
        return `${format(currentDate, 'M月')} W${weekNumber}`
      default:
        return format(currentDate, 'M月 yyyy')
    }
  }

  return (
    <header className={cn(
      'relative h-14 bg-background border-b border-border',
      'flex items-center justify-between px-4',
      'sticky top-0 z-40',
      className
    )}>
      {/* 左側: メニューボタンまたは戻るボタン */}
      <div className="flex items-center">
        {showBackButton ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-accent/50 rounded-full transition-colors"
            aria-label="戻る"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 hover:bg-accent/50 rounded-full transition-colors"
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 中央: 日付とビュー表示 */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        {title ? (
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        ) : (
          <>
            {/* 日付表示 */}
            <div className="text-lg font-semibold">
              {getDateDisplay()}
            </div>
            {/* ビュー表示 */}
            <button
              onClick={() => setIsViewMenuOpen(true)}
              className="text-xs text-muted-foreground px-2 py-0.5 rounded hover:bg-accent/50 transition-colors"
            >
              {viewLabels[viewType] || viewType}表示
            </button>
          </>
        )}
      </div>

      {/* 右側: ナビゲーション */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('prev')}
          className="p-2 hover:bg-accent/50 rounded-full transition-colors"
          aria-label="前の期間"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => onNavigate('next')}
          className="p-2 hover:bg-accent/50 rounded-full transition-colors"
          aria-label="次の期間"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ビュー切り替えメニュー */}
      {isViewMenuOpen && onViewChange && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setIsViewMenuOpen(false)}
          />
          
          {/* メニュー */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="py-2">
              {Object.entries(viewLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    onViewChange(value as CalendarViewType)
                    setIsViewMenuOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm hover:bg-accent/50 transition-colors',
                    viewType === value && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  {label}表示
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  )
}