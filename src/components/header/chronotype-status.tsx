'use client'

import React, { useState, useEffect } from 'react'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'
import { 
  CHRONOTYPE_PRESETS, 
  getProductivityZoneForHour, 
  PRODUCTIVITY_COLORS 
} from '@/types/chronotype'
import { getCSSVariableValue } from '@/config/theme/colors'

export function ChronotypeStatus() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { chronotype } = useCalendarSettingsStore()

  // リアルタイム時間更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // クロノタイプ状態を取得
  const getChronotypeStatus = () => {
    if (!chronotype || !chronotype.enabled) {
      return null
    }

    if (chronotype.type === 'custom') {
      return {
        type: 'Custom',
        level: 'Active',
        color: `rgb(${getCSSVariableValue('--color-info') || 'var(--color-info)'})`
      }
    }

    try {
      const profile = CHRONOTYPE_PRESETS[chronotype.type]
      const currentHour = currentTime.getHours()
      const zone = getProductivityZoneForHour(profile, currentHour)
      
      if (!zone || !PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]) {
        return null
      }

      const colors = PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]
      
      // レベルの日本語表示
      const levelMap = {
        'peak': 'ピーク',
        'good': '集中',
        'moderate': '通常',
        'low': '低調',
        'sleep': '休息'
      }

      // タイプの表示名
      const typeMap = {
        'lion': 'ライオン',
        'bear': 'クマ',
        'wolf': 'オオカミ',
        'dolphin': 'イルカ'
      }

      return {
        type: typeMap[chronotype.type] || chronotype.type,
        level: levelMap[zone.level] || zone.level,
        color: colors.border,
        zone: zone
      }
    } catch (error) {
      return null
    }
  }

  const status = getChronotypeStatus()

  if (!status) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <div 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: status.color }}
      />
      <div className="flex flex-col text-xs">
        <span className="font-medium text-gray-900 dark:text-white leading-none">
          {status.level}
        </span>
        <span className="text-gray-500 dark:text-gray-400 leading-none">
          {status.type}
        </span>
      </div>
    </div>
  )
}