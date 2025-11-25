'use client'

import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  GitCompareArrows,
  RotateCcw,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useStatsPeriodStore } from '@/features/stats/stores'
import type { ComparePeriod, PeriodType } from '@/features/stats/stores'
import { cn } from '@/lib/utils'

/**
 * 統計ページ用ツールバー
 *
 * 期間選択、ナビゲーション、比較機能を提供
 */
export function StatsToolbar() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
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
    if (isSameDay(startDate, endDate)) {
      return format(startDate, 'M/d (E)', { locale: dateLocale })
    }
    return `${format(startDate, 'M/d', { locale: dateLocale })} - ${format(endDate, 'M/d', { locale: dateLocale })}`
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
    <TooltipProvider>
      <div className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-4">
        {/* 期間ナビゲーション */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goToPrevious}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">{t('stats.toolbar.previous')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('stats.toolbar.previous')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goToNext}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">{t('stats.toolbar.next')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('stats.toolbar.next')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goToCurrent}
              >
                <RotateCcw className="size-4" />
                <span className="sr-only">{t('stats.toolbar.current')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('stats.toolbar.current')}</TooltipContent>
          </Tooltip>
        </div>

        {/* 日付範囲表示 */}
        <div className="bg-muted text-foreground flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium">
          <Calendar className="text-muted-foreground size-4" />
          <span>{formatDateRange()}</span>
        </div>

        {/* 期間タイプ選択 */}
        <Select
          value={periodType}
          onValueChange={(value) => setPeriodType(value as PeriodType)}
        >
          <SelectTrigger className="h-8 w-[100px]">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={compareEnabled ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('h-8 gap-1.5', compareEnabled && 'bg-accent')}
              onClick={() => setCompareEnabled(!compareEnabled)}
            >
              <GitCompareArrows className="size-4" />
              <span className="hidden sm:inline">{t('stats.toolbar.compare')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('stats.toolbar.compareTooltip')}</TooltipContent>
        </Tooltip>

        {/* 比較期間選択（比較有効時のみ表示） */}
        {compareEnabled && (
          <Select
            value={comparePeriod}
            onValueChange={(value) => setComparePeriod(value as ComparePeriod)}
          >
            <SelectTrigger className="h-8 w-[120px]">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Download className="size-4" />
              <span className="hidden sm:inline">{t('stats.toolbar.export')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('stats.toolbar.exportTooltip')}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
