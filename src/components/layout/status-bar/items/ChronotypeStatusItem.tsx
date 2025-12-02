'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Dna } from 'lucide-react'

import { cn } from '@/lib/utils'

import { StatusBarItem } from '../StatusBarItem'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { CHRONOTYPE_PRESETS, getProductivityZoneForHour } from '@/types/chronotype'

import type { ProductivityZone } from '@/types/chronotype'

// ゾーンレベルに応じたアイコンの色
const LEVEL_ICON_COLORS: Record<ProductivityZone['level'], string> = {
  peak: 'text-green-500',
  good: 'text-green-400',
  moderate: 'text-blue-400',
  low: 'text-gray-400',
  sleep: 'text-indigo-400',
}

/**
 * クロノタイプ（現在の生産性ゾーン）をステータスバーに表示
 *
 * 表示パターン:
 * - 設定済み: "ピーク時間帯 (残り1h 30m)"
 * - 未設定: "クロノタイプ未設定"
 */
export function ChronotypeStatusItem() {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const { chronotype } = useCalendarSettingsStore()
  const openSettingsDialog = useSettingsDialogStore((state) => state.openSettings)

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60 * 1000)

    return () => clearInterval(timer)
  }, [])

  // 現在のゾーン情報を取得
  const zoneInfo = useMemo(() => {
    if (!chronotype?.enabled || !chronotype?.type || chronotype.type === 'custom') {
      return null
    }

    const profile = CHRONOTYPE_PRESETS[chronotype.type]
    if (!profile) return null

    const currentHour = currentTime.getHours()
    const zone = getProductivityZoneForHour(profile, currentHour)

    if (!zone) return null

    // 残り時間を計算
    const currentMinutes = currentTime.getMinutes()
    let remainingMinutes: number

    if (zone.startHour <= zone.endHour) {
      // 同日内の時間帯
      remainingMinutes = (zone.endHour - currentHour - 1) * 60 + (60 - currentMinutes)
    } else {
      // 日跨ぎの時間帯
      if (currentHour >= zone.startHour) {
        // 当日部分
        remainingMinutes = (24 - currentHour - 1) * 60 + (60 - currentMinutes) + zone.endHour * 60
      } else {
        // 翌日部分
        remainingMinutes = (zone.endHour - currentHour - 1) * 60 + (60 - currentMinutes)
      }
    }

    return {
      label: zone.label,
      level: zone.level,
      remainingMinutes: Math.max(0, remainingMinutes),
    }
  }, [chronotype, currentTime])

  // 残り時間のフォーマット
  const formatRemaining = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `残り${hours}h ${mins}m`
    }
    return `残り${mins}m`
  }, [])

  // クリック時: 設定ダイアログを開き、クロノタイプ設定へスクロール
  const handleClick = useCallback(() => {
    openSettingsDialog('personalization', 'chronotype')
  }, [openSettingsDialog])

  // ラベル生成
  const label = useMemo(() => {
    if (!zoneInfo) {
      return 'クロノタイプ未設定'
    }

    return `${zoneInfo.label} (${formatRemaining(zoneInfo.remainingMinutes)})`
  }, [zoneInfo, formatRemaining])

  // アイコンの色を決定
  const iconColor = zoneInfo ? LEVEL_ICON_COLORS[zoneInfo.level] : 'text-muted-foreground'

  return (
    <StatusBarItem
      icon={<Dna className={cn('h-3 w-3', iconColor)} />}
      label={label}
      onClick={handleClick}
      tooltip={zoneInfo ? '生産性ゾーン設定を開く' : 'クロノタイプを設定'}
    />
  )
}
