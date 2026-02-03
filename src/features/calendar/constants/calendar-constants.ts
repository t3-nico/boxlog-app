/**
 * Google Calendar風のグリッド定数
 */

// レイアウト定数
export const HOUR_HEIGHT = 48; // 1時間の高さ（ピクセル）
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const GRID_GAP = 1; // グリッド間のギャップ
export const TIME_LABEL_WIDTH = 64; // 時間ラベルの幅（ピクセル）
export const ALL_DAY_ROW_HEIGHT = 24; // 全日プラン1行の高さ（ピクセル）
export const HEADER_HEIGHT = 56; // 日付ヘッダーの高さ（ピクセル）

// カラー定義（セマンティックトークン使用）
export const GRID_COLORS = {
  border: 'border-border',
  borderLight: 'border-border/50',
  weekend: 'bg-muted/50',
  businessHours: 'bg-background',
  nonBusinessHours: 'bg-muted/30',
  currentTime: 'bg-primary',
  allDaySection: 'bg-muted/50',
};

// スクロール設定
export const SCROLL_OPTIONS = {
  behavior: 'smooth' as const,
  block: 'start' as const,
  inline: 'nearest' as const,
};

// 営業時間の設定
export const BUSINESS_HOURS = {
  start: 9,
  end: 18,
};

// グリッド間隔の設定
export const GRID_INTERVALS = {
  15: 15,
  30: 30,
  60: 60,
} as const;

export type GridInterval = keyof typeof GRID_INTERVALS;

// 時間フォーマット設定
export const TIME_FORMAT = {
  hour: 'HH:mm',
  minute: 'mm',
  display: 'H:mm',
};

// レスポンシブブレークポイント
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
};

// Tailwind CSS クラス（スタイルシステム簡素化対応）
export const CALENDAR_CLASSES = {
  // レイアウト
  hourHeight: 'h-12', // 48px = h-12
  timeColumnWidth: 'w-16', // 64px = w-16
  allDayRowHeight: 'h-6', // 24px = h-6
  headerHeight: 'h-14', // 56px = h-14

  // 色・背景（セマンティックトークン）
  currentTimeColor: 'bg-primary',
  gridBorder: 'border-border',
  weekendBg: 'bg-muted/50',
  businessHoursBg: 'bg-background',
  nonBusinessHoursBg: 'bg-muted/30',

  // プランブロック（shadowなし：フラットデザイン）
  planShadow: '',
  planBorder: 'border-l-4',
  planRounding: 'rounded-lg',
  planPadding: 'px-2 py-1',

  // アニメーション
  transition: 'transition-all duration-200',
  hoverScale: 'hover:scale-[1.02]',
  dragCursor: 'cursor-grab',
  draggingCursor: 'cursor-grabbing',
} as const;
