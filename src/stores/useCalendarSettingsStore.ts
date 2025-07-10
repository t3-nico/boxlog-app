import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChronotypeType, ProductivityZone } from '@/types/chronotype'

interface CalendarSettings {
  // タイムゾーン設定
  timezone: string // 例: 'Asia/Tokyo', 'America/New_York'
  
  // 時間表示形式
  timeFormat: '24h' | '12h'
  
  // その他の設定
  weekStartsOn: 0 | 1 | 6 // 日曜、月曜、土曜
  defaultDuration: number // デフォルトのタスク時間（分）
  businessHours: {
    start: number // 営業開始時間（0-23）
    end: number   // 営業終了時間（0-23）
  }
  
  // 表示設定
  showWeekNumbers: boolean
  showDeclinedEvents: boolean
  
  // クロノタイプ設定
  chronotype: {
    enabled: boolean
    type: ChronotypeType
    customZones?: ProductivityZone[]
    displayMode: 'border' | 'background' | 'both'
    opacity: number // 0-100
  }
  
  // Plan/Record表示設定
  planRecordMode: 'plan' | 'record' | 'both'
}

interface CalendarSettingsStore extends CalendarSettings {
  updateSettings: (settings: Partial<CalendarSettings>) => void
  resetSettings: () => void
}

const defaultSettings: CalendarSettings = {
  timezone: typeof window !== 'undefined' 
    ? Intl.DateTimeFormat().resolvedOptions().timeZone 
    : 'Asia/Tokyo',
  timeFormat: '24h',
  weekStartsOn: 1, // 月曜始まり
  defaultDuration: 60,
  businessHours: {
    start: 9,
    end: 18
  },
  showWeekNumbers: false,
  showDeclinedEvents: false,
  chronotype: {
    enabled: true,
    type: 'bear',
    displayMode: 'border',
    opacity: 90
  },
  planRecordMode: 'plan'
}

export const useCalendarSettingsStore = create<CalendarSettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (newSettings) => set((state) => ({
        ...state,
        ...newSettings
      })),
      
      resetSettings: () => set(defaultSettings)
    }),
    {
      name: 'calendar-settings',
    }
  )
)