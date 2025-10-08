export type ChronotypeType = 'lion' | 'bear' | 'wolf' | 'dolphin' | 'custom'

export interface ChronotypeProfile {
  type: ChronotypeType
  name: string
  description: string
  productivityZones: ProductivityZone[]
}

export interface ProductivityZone {
  startHour: number // 0-23
  endHour: number // 0-23
  level: 'peak' | 'good' | 'moderate' | 'low' | 'sleep'
  label: string
  color: string // Tailwind color class or hex
}

// プリセットのクロノタイプ定義
export const CHRONOTYPE_PRESETS: Record<ChronotypeType, ChronotypeProfile> = {
  lion: {
    type: 'lion',
    name: 'Lion (Super Early Bird)',
    description: 'Most productive in early morning. Wake up at 5-6 AM and peak during morning hours.',
    productivityZones: [
      { startHour: 5, endHour: 7, level: 'good', label: 'Morning Prep', color: 'bg-yellow-300' },
      { startHour: 7, endHour: 11, level: 'peak', label: 'Peak Time', color: 'bg-green-500' },
      { startHour: 11, endHour: 14, level: 'good', label: 'Focus Time', color: 'bg-green-300' },
      { startHour: 14, endHour: 17, level: 'moderate', label: 'Regular Time', color: 'bg-blue-200' },
      { startHour: 17, endHour: 21, level: 'low', label: 'Low Energy', color: 'bg-gray-200' },
      { startHour: 21, endHour: 5, level: 'sleep', label: 'Sleep Time', color: 'bg-indigo-500' },
    ],
  },

  bear: {
    type: 'bear',
    name: 'Bear (Standard Type)',
    description: 'Follows sun rhythm. Wake up around 7 AM, productive in morning and early afternoon.',
    productivityZones: [
      { startHour: 7, endHour: 9, level: 'moderate', label: 'Morning Prep', color: 'bg-yellow-200' },
      { startHour: 9, endHour: 12, level: 'peak', label: 'Peak Time', color: 'bg-green-500' },
      { startHour: 12, endHour: 14, level: 'moderate', label: 'Post Lunch', color: 'bg-blue-200' },
      { startHour: 14, endHour: 17, level: 'good', label: 'Second Peak', color: 'bg-green-300' },
      { startHour: 17, endHour: 22, level: 'moderate', label: 'Evening', color: 'bg-blue-200' },
      { startHour: 22, endHour: 7, level: 'sleep', label: 'Sleep Time', color: 'bg-indigo-500' },
    ],
  },

  wolf: {
    type: 'wolf',
    name: 'Wolf (Night Owl)',
    description: 'Most creative at night. Struggle in morning, productivity rises from afternoon to night.',
    productivityZones: [
      { startHour: 7, endHour: 11, level: 'low', label: 'Low Period', color: 'bg-gray-200' },
      { startHour: 11, endHour: 14, level: 'moderate', label: 'Gradual Rise', color: 'bg-blue-200' },
      { startHour: 14, endHour: 17, level: 'good', label: 'Focus Time', color: 'bg-green-300' },
      { startHour: 17, endHour: 22, level: 'peak', label: 'Peak Time', color: 'bg-green-500' },
      { startHour: 22, endHour: 2, level: 'good', label: 'Creative Time', color: 'bg-purple-300' },
      { startHour: 2, endHour: 7, level: 'sleep', label: 'Sleep Time', color: 'bg-indigo-500' },
    ],
  },

  dolphin: {
    type: 'dolphin',
    name: 'Dolphin (Irregular Type)',
    description: 'Light sleep and irregular rhythm. Multiple short focus periods throughout the day.',
    productivityZones: [
      { startHour: 6, endHour: 8, level: 'moderate', label: 'Wake Up', color: 'bg-blue-200' },
      { startHour: 8, endHour: 10, level: 'good', label: 'Morning Focus', color: 'bg-green-300' },
      { startHour: 10, endHour: 12, level: 'moderate', label: 'Regular', color: 'bg-blue-200' },
      { startHour: 12, endHour: 14, level: 'low', label: 'Low Energy', color: 'bg-gray-200' },
      { startHour: 14, endHour: 16, level: 'peak', label: 'Peak Time', color: 'bg-green-500' },
      { startHour: 16, endHour: 18, level: 'good', label: 'Focus Time', color: 'bg-green-300' },
      { startHour: 18, endHour: 22, level: 'moderate', label: 'Evening', color: 'bg-blue-200' },
      { startHour: 22, endHour: 6, level: 'sleep', label: 'Sleep Time', color: 'bg-indigo-500' },
    ],
  },

  custom: {
    type: 'custom',
    name: 'Custom',
    description: 'Set your own personalized rhythm',
    productivityZones: [],
  },
}

// 色のマッピング (より鮮明で目立つ色に変更)
export const PRODUCTIVITY_COLORS = {
  'bg-green-500': { bg: 'rgb(34 197 94)', border: 'rgb(22 163 74)' }, // Peak - 濃い緑
  'bg-green-300': { bg: 'rgb(134 239 172)', border: 'rgb(34 197 94)' }, // Good - 緑
  'bg-blue-200': { bg: 'rgb(191 219 254)', border: 'rgb(59 130 246)' }, // Moderate - 青
  'bg-yellow-300': { bg: 'rgb(253 224 71)', border: 'rgb(245 158 11)' }, // 準備時間 - 黄色
  'bg-yellow-200': { bg: 'rgb(254 240 138)', border: 'rgb(245 158 11)' }, // 起床時間 - 薄い黄色
  'bg-purple-300': { bg: 'rgb(196 181 253)', border: 'rgb(147 51 234)' }, // 創造時間 - 紫
  'bg-gray-200': { bg: 'rgb(229 231 235)', border: 'rgb(107 114 128)' }, // Low - グレー
  'bg-gray-300': { bg: 'rgb(209 213 219)', border: 'rgb(107 114 128)' }, // 睡眠試行 - グレー
  'bg-gray-400': { bg: 'rgb(156 163 175)', border: 'rgb(75 85 99)' }, // 睡眠推奨 - 濃いグレー
  'bg-indigo-500': { bg: 'rgb(99 102 241)', border: 'rgb(67 56 202)' }, // Sleep - インディゴ
}

// ヘルパー関数
export function getProductivityZoneForHour(profile: ChronotypeProfile, hour: number): ProductivityZone | null {
  return (
    profile.productivityZones.find((zone) => {
      if (zone.startHour <= zone.endHour) {
        // 同日内の時間帯 (e.g. 9-17)
        return hour >= zone.startHour && hour < zone.endHour
      } else {
        // 日跨ぎの時間帯 (e.g. 22-5)
        return hour >= zone.startHour || hour < zone.endHour
      }
    }) || null
  )
}

export function getProductivityLevelColor(level: ProductivityZone['level']): string {
  switch (level) {
    case 'peak':
      return 'bg-green-500'
    case 'good':
      return 'bg-green-300'
    case 'moderate':
      return 'bg-blue-200'
    case 'low':
      return 'bg-gray-200'
    case 'sleep':
      return 'bg-indigo-500'
    default:
      return 'bg-gray-200'
  }
}
