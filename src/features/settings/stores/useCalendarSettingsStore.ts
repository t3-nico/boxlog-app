import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ChronotypeType, ProductivityZone } from '@/features/settings/types/chronotype';

import { listenToTimezoneChange } from '../utils/timezone';

export type CalendarViewType = 'day' | '3day' | '5day' | 'week';

// 日付フォーマット型
export type DateFormatType = 'yyyy/MM/dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';

interface CalendarSettings {
  // タイムゾーン設定
  timezone: string; // 例: 'Asia/Tokyo', 'America/New_York'
  showUTCOffset: boolean; // UTC表示のON/OFF

  // 時間表示形式
  timeFormat: '24h' | '12h';

  // 日付表示形式
  dateFormat: DateFormatType; // yyyy/MM/dd（日本）, MM/dd/yyyy（米国）, dd/MM/yyyy（欧州）, yyyy-MM-dd（ISO）

  // デフォルトビュー設定
  defaultView: CalendarViewType; // 起動時のデフォルトビュー

  // その他の設定
  weekStartsOn: 0 | 1 | 6; // 日曜、月曜、土曜
  defaultDuration: number; // デフォルトのタスク時間（分）
  snapInterval: 5 | 10 | 15 | 30; // ドラッグ&ドロップのスナップ間隔（分）
  businessHours: {
    start: number; // 営業開始時間（0-23）
    end: number; // 営業終了時間（0-23）
  };

  // 表示設定
  showWeekNumbers: boolean;
  showDeclinedEvents: boolean;
  showWeekends: boolean;

  // クロノタイプ設定
  chronotype: {
    enabled: boolean;
    type: ChronotypeType;
    customZones?: ProductivityZone[];
    displayMode: 'border' | 'background' | 'both';
    opacity: number; // 0-100
  };

  // Plan/Record表示設定
  planRecordMode: 'plan' | 'record' | 'both';

  // 睡眠スケジュール設定
  sleepSchedule: {
    enabled: boolean; // 睡眠時間帯の表示オン/オフ
    bedtime: number; // 就寝時刻（0-23）
    wakeTime: number; // 起床時刻（0-23）
  };

  // 睡眠時間帯折りたたみ
  sleepHoursCollapsed: boolean;
}

interface CalendarSettingsStore extends CalendarSettings {
  updateSettings: (settings: Partial<CalendarSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: CalendarSettings = {
  timezone: 'Asia/Tokyo', // デフォルトはJST、useEffectで実際の値に更新
  showUTCOffset: true,
  timeFormat: '24h',
  dateFormat: 'yyyy/MM/dd', // デフォルトは日本式
  defaultView: 'week', // デフォルトは週表示
  weekStartsOn: 1, // 月曜始まり
  defaultDuration: 60,
  snapInterval: 15, // デフォルトは15分間隔
  businessHours: {
    start: 9,
    end: 18,
  },
  showWeekNumbers: false,
  showDeclinedEvents: false,
  showWeekends: true, // デフォルトは週末も表示
  chronotype: {
    enabled: true,
    type: 'bear',
    displayMode: 'border',
    opacity: 90,
  },
  planRecordMode: 'both',
  sleepSchedule: {
    enabled: true,
    bedtime: 23,
    wakeTime: 7,
  },
  sleepHoursCollapsed: false,
};

export const useCalendarSettingsStore = create<CalendarSettingsStore>()(
  devtools(
    persist(
      (set, get) => {
        // タイムゾーン変更リスナーをセットアップ
        if (typeof window !== 'undefined') {
          listenToTimezoneChange((newTimezone) => {
            const currentState = get();
            if (currentState.timezone !== newTimezone) {
              console.log('📅 Preferencesからのタイムゾーン変更を検出:', newTimezone);
              set({ ...currentState, timezone: newTimezone });
            }
          });

          // クリーンアップ関数は保存されない（Zustandの制約）
          // 必要に応じて手動でクリーンアップ
        }

        return {
          ...defaultSettings,

          updateSettings: (newSettings) =>
            set((state) => ({
              ...state,
              ...newSettings,
            })),

          resetSettings: () => set(defaultSettings),
        };
      },
      {
        name: 'calendar-settings',
      },
    ),
    {
      name: 'calendar-settings-store',
    },
  ),
);
