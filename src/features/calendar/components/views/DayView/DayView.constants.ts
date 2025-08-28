/**
 * DayView固有の定数定義
 */

// ビュー識別子
export const DAY_VIEW_TYPE = 'day' as const

// DayView固有の表示設定
export const DAY_VIEW_CONFIG = {
  // 表示する時間範囲
  startHour: 0,
  endHour: 24,
  
  // スクロール設定
  defaultScrollToHour: 8, // デフォルトで8時にスクロール
  scrollBehavior: 'smooth' as const,
  
  // イベント表示設定
  showAllDayEvents: true,
  maxVisibleEvents: 10, // 最大表示イベント数（それ以上は「+n more」表示）
  
  // グリッド設定  
  showCurrentTimeLine: true,
  showHalfHourLines: true,
  
  // ヘッダー設定
  headerDateFormat: 'yyyy年MM月dd日(EEEE)',
  headerTimeZoneDisplay: true
} as const

// アニメーション設定
export const DAY_VIEW_ANIMATIONS = {
  eventTransition: 'all 0.2s ease-in-out',
  scrollDuration: 300,
  highlightDuration: 500
} as const