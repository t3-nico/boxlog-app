/**
 * グリッドシステムの型定義
 */

export interface GridDimensions {
  width: number
  height: number
  hourHeight: number
  minuteHeight: number
  timeColumnWidth: number
}

export interface GridPosition {
  top: number
  left: number
  width: number
  height: number
}

export interface TimeSelection {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

export interface TimeGridProps {
  startHour?: number | undefined // 開始時間（デフォルト: 0）
  endHour?: number | undefined // 終了時間（デフォルト: 24）
  hourHeight?: number | undefined // 1時間の高さ（デフォルト: 72）
  showHalfHourLines?: boolean | undefined // 30分線を表示するか
  showQuarterHourLines?: boolean | undefined // 15分線を表示するか
  showCurrentTime?: boolean | undefined // 現在時刻線を表示するか
  className?: string | undefined
  children?: React.ReactNode | undefined
  onTimeClick?: ((hour: number, minute: number) => void) | undefined
  onTimeRangeSelect?: ((selection: TimeSelection) => void) | undefined // ドラッグ選択時のコールバック
  scrollToHour?: number | undefined // 初期スクロール位置
  displayDates?: Date[] | undefined // 表示日付（現在時刻線の表示判定に使用）
}

export interface TimeColumnProps {
  startHour?: number | undefined
  endHour?: number | undefined
  hourHeight?: number | undefined
  format?: '12h' | '24h' | undefined // 時刻表示形式
  className?: string | undefined
}

export interface GridLinesProps {
  startHour?: number | undefined
  endHour?: number | undefined
  hourHeight?: number | undefined
  showHalfHourLines?: boolean | undefined
  className?: string | undefined
}

export interface CurrentTimeLineProps {
  hourHeight?: number | undefined
  timeColumnWidth?: number | undefined
  containerWidth?: number | undefined
  className?: string | undefined
  showDot?: boolean | undefined // 現在時刻のドットを表示するか
  updateInterval?: number | undefined // 更新間隔（ミリ秒）
  // 複数日ビュー用の新しいProps
  displayDates?: Date[] | undefined // 表示している日付の配列
  viewMode?: 'day' | '3day' | 'week' | '2week' | undefined
}

export interface TimeRange {
  start: Date
  end: Date
}

export interface TimeSlot {
  time: string // "09:15"
  hour: number // 9
  minute: number // 15
  label: string // "9:00" または "09:15"
  isHour: boolean // true if 正時(00分)
  isHalfHour: boolean // true if 30分
  isQuarterHour: boolean // true if 15分または45分
}

export interface GridEvent {
  id: string
  start: Date
  end: Date
  column?: number | undefined // 重複時の列番号
  width?: number | undefined // イベントの幅（％）
  left?: number | undefined // 左からの位置（％）
}
