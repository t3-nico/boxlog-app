/**
 * ScheduleView - Google Calendar風スケジュール表示の型定義
 */

export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  startDate: Date  // 既存のCalendarEventとの互換性を保持
  endDate: Date
  color?: string
  location?: string
  attendees?: Array<{
    id: string
    email: string
    name: string
    avatar?: string
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  }>
  isAllDay: boolean
  meetingUrl?: string // Zoom/Meet/Teams等のURL
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval?: number
    until?: Date
  }
  reminder?: Array<{
    method: 'email' | 'popup'
    minutes: number
  }>
}

export interface ScheduleViewProps {
  events: ScheduleEvent[]
  dateRange?: {
    start: Date
    end: Date
  }
  onEventClick?: (event: ScheduleEvent) => void
  onEventEdit?: (event: ScheduleEvent) => void
  onEventDelete?: (eventId: string) => void
  onDateClick?: (date: Date) => void
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void // ナビゲーション制御
  onDateRangeChange?: (startDate: Date) => void // 開始日変更
  groupBy?: 'day' | 'week' | 'month'
  showWeekends?: boolean
  timezone?: string
  currentDate?: Date // 現在表示中の開始日
  displayDays?: number // 表示する日数（デフォルト: 14日間）
  isLoading?: boolean
  className?: string
}

// 日付グループ化の結果型
export interface EventDateGroup {
  date: Date
  label: string
  isToday: boolean
  isPast: boolean
  isWeekend: boolean
  events: ScheduleEvent[]
  freeSlots?: FreeSlot[] // 空き時間（オプション）
}

// 空き時間スロット
export interface FreeSlot {
  startTime: Date
  endTime: Date
  duration: number // 分単位
  label: string // "9:00 - 10:30 (1時間30分空き)"
}

// キーボードショートカット定義
export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[]
}

// スクロール状態管理
export interface ScheduleScrollState {
  currentVisibleDate: Date
  scrollPosition: number
  visibleRange: {
    start: number
    end: number
  }
}

// イベント表示設定
export interface EventDisplaySettings {
  showTime: boolean
  showLocation: boolean
  showAttendees: boolean
  showMeetingLinks: boolean
  compactMode: boolean
}

// クイックアクション定義
export interface QuickAction {
  id: string
  label: string
  icon: string
  action: (event: ScheduleEvent) => void
  visible: (event: ScheduleEvent) => boolean
}

// フィルタリング設定
export interface ScheduleFilter {
  showAllDay: boolean
  showBusy: boolean
  showFree: boolean
  showTentative: boolean
  showCancelled: boolean
  attendeeFilter?: string[] // 参加者でフィルタ
  locationFilter?: string[] // 場所でフィルタ
}

// ソート設定
export type ScheduleSortBy = 'startTime' | 'title' | 'location' | 'duration'
export type ScheduleSortOrder = 'asc' | 'desc'

// エラー状態
export interface ScheduleErrorState {
  type: 'load_error' | 'update_error' | 'delete_error' | 'network_error'
  message: string
  retry?: () => void
  details?: any
}

// ローディング状態
export interface ScheduleLoadingState {
  isLoading: boolean
  loadingText?: string
  progress?: number // 0-100
}

// 仮想化設定
export interface VirtualizationSettings {
  itemHeight: number // 各アイテムの高さ
  containerHeight: number // コンテナ高さ
  overscan: number // バッファアイテム数
}

// アニメーション設定
export interface ScheduleAnimationSettings {
  enableTransitions: boolean
  duration: number
  easing: string
}

// アクセシビリティ設定
export interface ScheduleA11ySettings {
  announceUpdates: boolean
  focusManagement: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
}