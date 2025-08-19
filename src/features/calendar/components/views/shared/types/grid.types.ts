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

export interface TimeGridProps {
  startHour?: number // 開始時間（デフォルト: 0）
  endHour?: number // 終了時間（デフォルト: 24）
  hourHeight?: number // 1時間の高さ（デフォルト: 60）
  showHalfHourLines?: boolean // 30分線を表示するか
  showCurrentTime?: boolean // 現在時刻線を表示するか
  className?: string
  children?: React.ReactNode
  onTimeClick?: (hour: number, minute: number) => void
  scrollToHour?: number // 初期スクロール位置
}

export interface TimeColumnProps {
  startHour?: number
  endHour?: number
  hourHeight?: number
  format?: '12h' | '24h' // 時刻表示形式
  className?: string
}

export interface GridLinesProps {
  startHour?: number
  endHour?: number
  hourHeight?: number
  showHalfHourLines?: boolean
  className?: string
}

export interface CurrentTimeLineProps {
  hourHeight?: number
  timeColumnWidth?: number
  containerWidth?: number
  className?: string
  showDot?: boolean // 現在時刻のドットを表示するか
  updateInterval?: number // 更新間隔（ミリ秒）
}

export interface TimeRange {
  start: Date
  end: Date
}

export interface TimeSlot {
  hour: number
  minute: number
  date: Date
}

export interface GridEvent {
  id: string
  start: Date
  end: Date
  column?: number // 重複時の列番号
  width?: number // イベントの幅（％）
  left?: number // 左からの位置（％）
}