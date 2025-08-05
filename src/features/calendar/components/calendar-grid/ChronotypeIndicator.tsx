'use client'

import React from 'react'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'
import { CHRONOTYPE_PRESETS, getProductivityZoneForHour, PRODUCTIVITY_COLORS } from '@/types/chronotype'

interface ChronotypeIndicatorProps {
  hour: number
  className?: string
}

export function ChronotypeIndicator({ hour, className = '' }: ChronotypeIndicatorProps) {
  const { chronotype } = useCalendarSettingsStore()
  
  if (!chronotype.enabled) return null
  
  const profile = chronotype.type === 'custom' && chronotype.customZones
    ? { 
        type: 'custom' as const,
        name: 'カスタム',
        description: 'カスタム設定',
        productivityZones: chronotype.customZones 
      }
    : CHRONOTYPE_PRESETS[chronotype.type]
  
  // 現在の時間帯のゾーンを見つける
  const zone = getProductivityZoneForHour(profile, hour)
  
  if (!zone) return null
  
  const colorMapping = PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]
  if (!colorMapping) return null
  
  const opacityFactor = chronotype.opacity / 100
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* 右端のボーダー（ゾーン全体にわたって表示） */}
      {zone.level === 'sleep' ? (
        /* 睡眠時間は点線でより目立つように */
        <div
          className="absolute right-0 w-2 h-full"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${colorMapping.border} 60%, transparent 60%)`,
            backgroundSize: '100% 8px',
            backgroundRepeat: 'repeat-y',
            opacity: Math.max(opacityFactor, 0.9), // 睡眠時間は90%以上の不透明度
          }}
          title={`💤 ${zone.label} (${zone.level})`}
        />
      ) : (
        /* 通常の生産性ゾーンは実線 */
        <div
          className="absolute right-0 w-2 h-full"
          style={{
            backgroundColor: colorMapping.border,
            opacity: Math.max(opacityFactor, 0.8), // 最低80%の不透明度を保証
          }}
          title={`${zone.label} (${zone.level})`}
        />
      )}
    </div>
  )
}

// 時間ラベル用のインジケーター（より小さい表示）
export function ChronotypeIndicatorCompact({ hour }: { hour: number }) {
  const { chronotype } = useCalendarSettingsStore()
  
  if (!chronotype.enabled) return null
  
  const profile = chronotype.type === 'custom' && chronotype.customZones
    ? { 
        type: 'custom' as const,
        name: 'カスタム',
        description: 'カスタム設定',
        productivityZones: chronotype.customZones 
      }
    : CHRONOTYPE_PRESETS[chronotype.type]
  
  const zone = getProductivityZoneForHour(profile, hour)
  
  if (!zone) return null
  
  const colorMapping = PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]
  if (!colorMapping) return null
  
  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'peak': return '🔥'
      case 'good': return '⚡'
      case 'moderate': return '📊'
      case 'low': return '😴'
      case 'sleep': return '💤'
      default: return ''
    }
  }
  
  return (
    <div 
      className="absolute right-0 top-0 w-2 h-2 rounded-full opacity-75"
      style={{
        backgroundColor: colorMapping.border,
        opacity: chronotype.opacity / 100,
      }}
      title={`${zone.label} (${zone.level}) ${getLevelEmoji(zone.level)}`}
    />
  )
}

// グリッド全体のクロノタイプ表示用
export function ChronotypeGridOverlay({ 
  startHour = 0, 
  endHour = 24, 
  hourHeight = 60 
}: { 
  startHour?: number
  endHour?: number
  hourHeight?: number 
}) {
  const { chronotype } = useCalendarSettingsStore()
  
  if (!chronotype.enabled) return null
  
  const profile = chronotype.type === 'custom' && chronotype.customZones
    ? { 
        type: 'custom' as const,
        name: 'カスタム',
        description: 'カスタム設定',
        productivityZones: chronotype.customZones 
      }
    : CHRONOTYPE_PRESETS[chronotype.type]
  
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {hours.map(hour => {
        const zone = getProductivityZoneForHour(profile, hour)
        if (!zone) return null
        
        const colorMapping = PRODUCTIVITY_COLORS[zone.color as keyof typeof PRODUCTIVITY_COLORS]
        if (!colorMapping) return null
        
        const top = (hour - startHour) * hourHeight
        const opacityFactor = chronotype.opacity / 100
        
        return (
          <div 
            key={hour}
            className="absolute w-full"
            style={{ 
              top: `${top}px`, 
              height: `${hourHeight}px` 
            }}
          >
            {/* 左端のボーダー */}
            {(chronotype.displayMode === 'border' || chronotype.displayMode === 'both') && (
              <div
                className="absolute left-0 w-2 h-full"
                style={{
                  backgroundColor: colorMapping.border,
                  opacity: opacityFactor,
                }}
              />
            )}
            
            {/* 背景色 */}
            {(chronotype.displayMode === 'background' || chronotype.displayMode === 'both') && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: colorMapping.bg,
                  opacity: opacityFactor * 0.3,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}