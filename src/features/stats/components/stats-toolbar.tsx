'use client'

import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, Download, GitCompareArrows, RotateCcw } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HoverTooltip } from '@/components/ui/tooltip'
import type { ComparePeriod, PeriodType } from '@/features/stats/stores'
import { useStatsPeriodStore } from '@/features/stats/stores'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * 統計ページ用ツールバー
 *
 * 期間選択、ナビゲーション、比較機能を提供
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - コンテナ: 32px（h-8）
 * - 8pxグリッドシステム準拠
 */
export function StatsToolbar() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const t = useTranslations()
  const dateLocale = localeFromPath === 'ja' ? ja : undefined

  const {
    periodType,
    startDate,
    endDate,
    compareEnabled,
    comparePeriod,
    setPeriodType,
    goToPrevious,
    goToNext,
    goToCurrent,
    setCompareEnabled,
    setComparePeriod,
  } = useStatsPeriodStore()

  // 日付範囲のフォーマット
  const formatDateRange = () => {
    const formatOptions = dateLocale ? { locale: dateLocale } : {}
    if (isSameDay(startDate, endDate)) {
      return format(startDate, 'M/d (E)', formatOptions)
    }
    return `${format(startDate, 'M/d', formatOptions)} - ${format(endDate, 'M/d', formatOptions)}`
  }

  // 期間タイプの選択肢
  const periodOptions: { value: PeriodType; label: string }[] = [
    { value: 'today', label: t('stats.toolbar.today') },
    { value: 'week', label: t('stats.toolbar.thisWeek') },
    { value: 'month', label: t('stats.toolbar.thisMonth') },
    { value: 'year', label: t('stats.toolbar.thisYear') },
  ]

  // 比較期間の選択肢
  const compareOptions: { value: ComparePeriod; label: string }[] = [
    { value: 'none', label: t('stats.toolbar.noCompare') },
    { value: 'previous', label: t('stats.toolbar.previousPeriod') },
    { value: 'lastYear', label: t('stats.toolbar.lastYear') },
  ]

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 px-4 py-2">
      {/* 期間ナビゲーション */}
      <div className="flex items-center gap-1">
        <HoverTooltip content={t('stats.toolbar.previous')} side="bottom">
          <Button variant="ghost" size="icon" className="size-8" onClick={goToPrevious}>
            <ChevronLeft className="size-4" />
            <span className="sr-only">{t('stats.toolbar.previous')}</span>
          </Button>
        </HoverTooltip>

        <HoverTooltip content={t('stats.toolbar.next')} side="bottom">
          <Button variant="ghost" size="icon" className="size-8" onClick={goToNext}>
            <ChevronRight className="size-4" />
            <span className="sr-only">{t('stats.toolbar.next')}</span>
          </Button>
        </HoverTooltip>

        <HoverTooltip content={t('stats.toolbar.current')} side="bottom">
          <Button variant="ghost" size="icon" className="size-8" onClick={goToCurrent}>
            <RotateCcw className="size-4" />
            <span className="sr-only">{t('stats.toolbar.current')}</span>
          </Button>
        </HoverTooltip>
      </div>

      {/* 日付範囲表示 */}
      <div className="bg-surface-container text-foreground flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium">
        <Calendar className="text-muted-foreground size-4" />
        <span>{formatDateRange()}</span>
      </div>

      {/* 期間タイプ選択 */}
      <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
        <SelectTrigger className="h-8 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* 比較トグル */}
      <HoverTooltip content={t('stats.toolbar.compareTooltip')} side="bottom">
        <Button
          variant={compareEnabled ? 'secondary' : 'ghost'}
          size="sm"
          className={cn('h-8 gap-1.5', compareEnabled && 'bg-surface-container')}
          onClick={() => setCompareEnabled(!compareEnabled)}
        >
          <GitCompareArrows className="size-4" />
          <span className="hidden sm:inline">{t('stats.toolbar.compare')}</span>
        </Button>
      </HoverTooltip>

      {/* 比較期間選択（比較有効時のみ表示） */}
      {compareEnabled && (
        <Select value={comparePeriod} onValueChange={(value) => setComparePeriod(value as ComparePeriod)}>
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {compareOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* スペーサー */}
      <div className="flex-1" />

      {/* エクスポート */}
      <HoverTooltip content={t('stats.toolbar.exportTooltip')} side="bottom">
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Download className="size-4" />
          <span className="hidden sm:inline">{t('stats.toolbar.export')}</span>
        </Button>
      </HoverTooltip>
    </div>
  )
}
