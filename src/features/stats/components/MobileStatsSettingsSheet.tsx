'use client'

import { MobileSettingsButtonGroup, MobileSettingsSection, MobileSettingsSheet } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { ComparePeriod, PeriodType } from '@/features/stats/stores'
import { useStatsPeriodStore } from '@/features/stats/stores'
import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, Download, GitCompareArrows, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

/**
 * モバイル用統計設定シート
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * - 期間ナビゲーション（前へ/次へ/現在）
 * - 期間タイプ選択（今日/今週/今月/今年）
 * - 比較設定（ON/OFF + 比較対象）
 * - エクスポート
 *
 * @example
 * ```tsx
 * <MobileStatsSettingsSheet />
 * ```
 */
export function MobileStatsSettingsSheet() {
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
    { value: 'previous', label: t('stats.toolbar.previousPeriod') },
    { value: 'lastYear', label: t('stats.toolbar.lastYear') },
  ]

  // アクティブな設定があるかどうか（比較が有効な場合）
  const hasActiveSettings = compareEnabled

  return (
    <MobileSettingsSheet title={t('stats.toolbar.settings')} hasActiveSettings={hasActiveSettings}>
      {/* 期間ナビゲーション */}
      <MobileSettingsSection icon={<Calendar />} title={formatDateRange()}>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} className="flex-1">
            <ChevronLeft className="mr-1 size-4" />
            {t('stats.toolbar.previous')}
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrent} className="shrink-0">
            <RotateCcw className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} className="flex-1">
            {t('stats.toolbar.next')}
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </MobileSettingsSection>

      {/* 期間タイプ */}
      <MobileSettingsSection icon={<Calendar />} title={t('stats.toolbar.periodType')}>
        <MobileSettingsButtonGroup options={periodOptions} value={periodType} onValueChange={setPeriodType} />
      </MobileSettingsSection>

      {/* 比較設定 */}
      <MobileSettingsSection icon={<GitCompareArrows />} title={t('stats.toolbar.compare')}>
        <div className="space-y-3">
          <MobileSettingsButtonGroup
            options={[
              { value: 'off', label: t('stats.toolbar.noCompare') },
              { value: 'on', label: t('stats.toolbar.compare') },
            ]}
            value={compareEnabled ? 'on' : 'off'}
            onValueChange={(value) => setCompareEnabled(value === 'on')}
            fullWidth
          />
          {compareEnabled && (
            <MobileSettingsButtonGroup
              options={compareOptions}
              value={comparePeriod === 'none' ? 'previous' : comparePeriod}
              onValueChange={setComparePeriod}
              fullWidth
            />
          )}
        </div>
      </MobileSettingsSection>

      {/* エクスポート */}
      <MobileSettingsSection icon={<Download />} title={t('stats.toolbar.export')} showSeparator={false}>
        <Button variant="outline" className="w-full gap-2">
          <Download className="size-4" />
          {t('stats.toolbar.exportData')}
        </Button>
      </MobileSettingsSection>
    </MobileSettingsSheet>
  )
}
