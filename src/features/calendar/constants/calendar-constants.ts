/**
 * Google Calendar風のグリッド定数
 */

// レイアウト定数
export const HOUR_HEIGHT = 48 // 1時間の高さ（ピクセル）
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60
export const GRID_GAP = 1 // グリッド間のギャップ
export const TIME_LABEL_WIDTH = 64 // 時間ラベルの幅（ピクセル）
export const ALL_DAY_ROW_HEIGHT = 24 // 全日イベント1行の高さ（ピクセル）
export const HEADER_HEIGHT = 56 // 日付ヘッダーの高さ（ピクセル）

// カラー定義
export const GRID_COLORS = {
  border: 'border-gray-200 dark:border-gray-700',
  borderLight: 'border-gray-100 dark:border-gray-800',
  weekend: 'bg-gray-50/50 dark:bg-gray-800/20',
  businessHours: 'bg-white dark:bg-gray-900',
  nonBusinessHours: 'bg-gray-50/30 dark:bg-gray-800/30',
  currentTime: 'bg-red-500 dark:bg-red-400',
  allDaySection: 'bg-gray-50 dark:bg-gray-800/50'
}

// スクロール設定
export const SCROLL_OPTIONS = {
  behavior: 'smooth' as const,
  block: 'start' as const,
  inline: 'nearest' as const
}

// 営業時間の設定
export const BUSINESS_HOURS = {
  start: 9,
  end: 18
}

// グリッド間隔の設定
export const GRID_INTERVALS = {
  15: 15,
  30: 30,
  60: 60
} as const

export type GridInterval = keyof typeof GRID_INTERVALS

// 時間フォーマット設定
export const TIME_FORMAT = {
  hour: 'HH:mm',
  minute: 'mm',
  display: 'H:mm'
}

// レスポンシブブレークポイント
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024
}