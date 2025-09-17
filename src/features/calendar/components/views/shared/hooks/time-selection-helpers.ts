/**
 * タイムセレクション関連のヘルパー関数とユーティリティ
 */

export interface TimePoint {
  hour: number
  minute: number
}

export interface TimeSelection {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

/**
 * ピクセル座標から時間を計算
 */
export function pixelsToTime(y: number, hourHeight: number): TimePoint {
  const totalMinutes = (y / hourHeight) * 60
  const hour = Math.floor(totalMinutes / 60)
  const minute = Math.floor((totalMinutes % 60) / 15) * 15 // 15分単位に丸める
  return {
    hour: Math.max(0, Math.min(23, hour)),
    minute: Math.max(0, Math.min(45, minute))
  }
}

/**
 * 時間から総分数に変換
 */
export function timeToMinutes(time: TimePoint): number {
  return time.hour * 60 + time.minute
}

/**
 * 時間の比較（time1 < time2 の場合true）
 */
export function isTimeBefore(time1: TimePoint, time2: TimePoint): boolean {
  return time1.hour < time2.hour ||
    (time1.hour === time2.hour && time1.minute < time2.minute)
}

/**
 * 選択範囲を計算（上向き・下向きドラッグに対応）
 */
export function calculateTimeSelection(
  startTime: TimePoint,
  currentTime: TimePoint,
  minDurationMinutes = 15
): TimeSelection {
  let startHour, startMinute, endHour, endMinute

  if (isTimeBefore(currentTime, startTime)) {
    // 上向きにドラッグ
    startHour = currentTime.hour
    startMinute = currentTime.minute
    endHour = startTime.hour
    endMinute = startTime.minute + 15
  } else {
    // 下向きにドラッグ
    startHour = startTime.hour
    startMinute = startTime.minute
    endHour = currentTime.hour
    endMinute = currentTime.minute + 15
  }

  // 最低選択時間を保証
  if (endHour === startHour && endMinute <= startMinute) {
    endMinute = startMinute + minDurationMinutes
    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60)
      endMinute = endMinute % 60
    }
  }

  return {
    startHour: Math.max(0, startHour),
    startMinute: Math.max(0, startMinute),
    endHour: Math.min(23, endHour),
    endMinute: Math.min(59, endMinute)
  }
}

/**
 * 選択の期間を分単位で計算
 */
export function calculateSelectionDuration(selection: TimeSelection): number {
  const startTotalMinutes = selection.startHour * 60 + selection.startMinute
  const endTotalMinutes = selection.endHour * 60 + selection.endMinute
  return endTotalMinutes - startTotalMinutes
}

/**
 * 選択範囲の表示スタイルを生成
 */
export function generateSelectionStyle(
  selection: TimeSelection,
  hourHeight: number
): React.CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    top: `${(selection.startHour * 60 + selection.startMinute) * (hourHeight / 60)}px`,
    height: `${calculateSelectionDuration(selection) * (hourHeight / 60)}px`,
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
    border: '2px solid rgb(59, 130, 246)', // blue-500
    borderRadius: '4px',
    pointerEvents: 'none',
    zIndex: 1000
  }
}

/**
 * マウス座標からコンテナ内のY座標を計算
 */
export function getRelativeY(
  mouseY: number,
  container: HTMLElement
): number {
  const rect = container.getBoundingClientRect()
  return mouseY - rect.top + container.scrollTop
}