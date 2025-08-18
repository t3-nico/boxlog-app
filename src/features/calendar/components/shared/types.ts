// 時間軸ビュー共有型定義

export interface TimeSlot {
  hour: number
  time: string        // "14:00"
  position: number    // ピクセル位置
}

export interface TimeGridConfig {
  startHour?: number     // デフォルト: 0
  endHour?: number       // デフォルト: 24
  hourHeight?: number    // デフォルト: 60px
  interval?: number      // デフォルト: 60分
}

export interface EventPosition {
  top: number           // ピクセル位置（上からの距離）
  height: number        // ピクセル高さ
  left: number          // ピクセル位置（左からの距離）
  width: number         // ピクセル幅
}

export interface TimeEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  color?: string
  location?: string
}

export interface PositionedEvent extends TimeEvent {
  position: EventPosition
}

export interface CurrentTime {
  hours: number
  minutes: number
  position: number      // ピクセル位置
  timeString: string    // "14:30"
}