import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  showDeclinedEvents: false
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