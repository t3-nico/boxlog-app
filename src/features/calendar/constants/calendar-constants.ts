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

// Tailwind CSS クラス（スタイルシステム簡素化対応）
export const CALENDAR_CLASSES = {
  // レイアウト
  hourHeight: 'h-12', // 48px = h-12
  timeColumnWidth: 'w-16', // 64px = w-16
  allDayRowHeight: 'h-6', // 24px = h-6
  headerHeight: 'h-14', // 56px = h-14
  
  // 色・背景
  currentTimeColor: 'bg-red-500',
  gridBorder: 'border-neutral-200 dark:border-neutral-700',
  weekendBg: 'bg-neutral-50 dark:bg-neutral-800/20',
  businessHoursBg: 'bg-white dark:bg-neutral-950',
  nonBusinessHoursBg: 'bg-neutral-50/50 dark:bg-neutral-800/30',
  
  // イベントブロック
  eventShadow: 'shadow-sm hover:shadow-md',
  eventBorder: 'border-l-4',
  eventRounding: 'rounded-md',
  eventPadding: 'px-2 py-1',
  
  // アニメーション
  transition: 'transition-all duration-200',
  hoverScale: 'hover:scale-[1.02]',
  dragCursor: 'cursor-grab',
  draggingCursor: 'cursor-grabbing'
} as const