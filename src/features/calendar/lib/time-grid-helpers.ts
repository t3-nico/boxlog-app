/**
 * 時刻文字列を分に変換（"09:30" → 570）
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 分を時刻文字列に変換（570 → "09:30"）
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Y座標から時刻を計算（ドラッグ用）
 */
export function getTimeFromPosition(
  y: number,
  containerRect: DOMRect,
  _gridInterval: number
): Date {
  const minutesPerPixel = (24 * 60) / containerRect.height
  const totalMinutes = y * minutesPerPixel
  
  // グリッド間隔にスナップ
  const snappedMinutes = Math.round(totalMinutes / gridInterval) * gridInterval
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  today.setMinutes(snappedMinutes)
  
  return today
}

/**
 * CalendarTaskの型定義
 */
export interface CalendarTask {
  id: string
  title: string
  startTime: Date
  endTime: Date
  color?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'scheduled' | 'rescheduled' | 'stopped'
  priority?: 'low' | 'medium' | 'high'
  isPlan?: boolean
  isRecord?: boolean
  isEvent?: boolean
  eventType?: 'event' | 'task' | 'reminder'
  eventStatus?: 'confirmed' | 'tentative' | 'cancelled'
  location?: string
  url?: string
  satisfaction?: number
  focusLevel?: number
  energyLevel?: number
}

/**
 * タスクの配置計算
 */
export function calculateTaskPosition(
  task: CalendarTask,
  dayStart: Date,
  gridInterval: number,
  column?: number,
  totalColumns?: number
): {
  top: string
  height: string
  left: string
  width: string
} {
  const dayStartMinutes = dayStart.getHours() * 60 + dayStart.getMinutes()
  const taskStartMinutes = task.startTime.getHours() * 60 + task.startTime.getMinutes()
  const taskEndMinutes = task.endTime.getHours() * 60 + task.endTime.getMinutes()
  
  const startOffset = taskStartMinutes - dayStartMinutes
  const duration = taskEndMinutes - taskStartMinutes
  
  // 24時間 = 1440分を100%とする
  const topPercentage = (startOffset / 1440) * 100
  const heightPercentage = (duration / 1440) * 100
  
  // 重複タスクの場合は幅を計算
  let left = '0%'
  let width = '100%'
  
  if (column !== undefined && totalColumns !== undefined && totalColumns > 1) {
    const columnWidth = calculateTaskWidth(column, totalColumns)
    left = columnWidth.left
    width = columnWidth.width
  }
  
  return {
    top: `${Math.max(0, topPercentage)}%`,
    height: `${Math.max(0.5, heightPercentage)}%`, // 最小高さ0.5%
    left,
    width
  }
}

/**
 * 15分単位にスナップ
 */
export function snapToGrid(date: Date, interval: number): Date {
  const minutes = date.getMinutes()
  const snappedMinutes = Math.round(minutes / interval) * interval
  
  const snappedDate = new Date(date)
  snappedDate.setMinutes(snappedMinutes, 0, 0)
  
  return snappedDate
}

/**
 * 24時間分の時間ラベルを生成
 */
export function generateTimeLabels(interval: number): string[] {
  const labels: string[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeStr = minutesToTime(hour * 60 + minute)
      labels.push(timeStr)
    }
  }
  
  return labels
}

/**
 * 現在時刻の位置を計算（パーセンテージ）
 * @deprecated このファイルの関数は非推奨です。代わりに utils/timezone.ts の getCurrentTimePosition を使用してください
 */
export function getCurrentTimePosition(): number {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  // 24時間 = 1440分を100%とする
  return (currentMinutes / 1440) * 100
}

/**
 * 時間帯に応じた背景色クラスを取得
 */
export function getTimeSlotBgClass(hour: number): string {
  if (hour >= 0 && hour < 6) {
    // 深夜（0-6時）
    return 'bg-gray-50 dark:bg-gray-900'
  } else if (hour >= 6 && hour < 9) {
    // 早朝（6-9時）
    return 'bg-gray-50 dark:bg-gray-800'
  } else if (hour >= 9 && hour < 18) {
    // 営業時間（9-18時）
    return 'bg-white dark:bg-gray-700'
  } else {
    // 夜間（18-24時）
    return 'bg-gray-50 dark:bg-gray-800'
  }
}

/**
 * グリッド線のスタイルクラスを取得
 */
export function getGridLineClass(minutes: number, __interval: number): string {
  if (minutes === 0) {
    // 正時
    return 'border-t border-gray-300 dark:border-gray-600'
  } else {
    // 間隔線
    return 'border-t border-dashed border-gray-200 dark:border-gray-700'
  }
}

/**
 * 時刻を読みやすい形式でフォーマット
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':')
  
  if (minutes === '00') {
    return `${parseInt(hours)}:00`
  } else {
    return time
  }
}

/**
 * Y座標から時刻を計算（ドラッグ用）
 */
export function calculateTimeFromPosition(
  y: number,
  containerHeight: number,
  gridInterval: number
): Date {
  const minutesPerPixel = (24 * 60) / containerHeight
  const totalMinutes = y * minutesPerPixel
  
  // グリッド間隔にスナップ
  const snappedMinutes = Math.round(totalMinutes / gridInterval) * gridInterval
  
  // 24時間以内に制限
  const constrainedMinutes = Math.max(0, Math.min(1440 - 1, snappedMinutes))
  
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setMinutes(constrainedMinutes)
  
  return date
}

/**
 * タスクの時間を制限（最小時間・最大時間）
 */
export function constrainTaskDuration(
  startTime: Date,
  endTime: Date,
  minDurationMinutes: number = 15,
  maxDurationMinutes: number = 480
): { startTime: Date; endTime: Date } {
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
  const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()
  
  let duration = endMinutes - startMinutes
  
  // 最小時間制限
  if (duration < minDurationMinutes) {
    duration = minDurationMinutes
  }
  
  // 最大時間制限
  if (duration > maxDurationMinutes) {
    duration = maxDurationMinutes
  }
  
  // 24時間以内に制限
  const constrainedEndMinutes = Math.min(1440, startMinutes + duration)
  const constrainedStartMinutes = Math.max(0, constrainedEndMinutes - duration)
  
  const constrainedStartTime = new Date(startTime)
  constrainedStartTime.setHours(0, 0, 0, 0)
  constrainedStartTime.setMinutes(constrainedStartMinutes)
  
  const constrainedEndTime = new Date(endTime)
  constrainedEndTime.setHours(0, 0, 0, 0)
  constrainedEndTime.setMinutes(constrainedEndMinutes)
  
  return {
    startTime: constrainedStartTime,
    endTime: constrainedEndTime
  }
}

/**
 * タスクの時間重複を検出
 */
export function detectTimeConflicts(
  newTask: CalendarTask,
  existingTasks: CalendarTask[]
): CalendarTask[] {
  return existingTasks.filter(task => {
    if (task.id === newTask.id) return false
    
    const newStart = newTask.startTime.getTime()
    const newEnd = newTask.endTime.getTime()
    const existingStart = task.startTime.getTime()
    const existingEnd = task.endTime.getTime()
    
    // 重複判定
    return (
      (newStart < existingEnd && newEnd > existingStart) ||
      (existingStart < newEnd && existingEnd > newStart)
    )
  })
}

/**
 * 重複タスクのカラム割り当て
 */
export function assignTaskColumns(tasks: CalendarTask[]): Array<CalendarTask & { column: number; totalColumns: number }> {
  const sortedTasks = [...tasks].sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  )
  
  const columns: Array<CalendarTask & { column: number; totalColumns: number }> = []
  
  for (const task of sortedTasks) {
    // 重複するタスクを検出
    const conflictingTasks = detectTimeConflicts(task, tasks)
    
    // 利用可能なカラムを見つける
    let column = 0
    const usedColumns = new Set<number>()
    
    for (const conflict of conflictingTasks) {
      const existingColumn = columns.find(c => c.id === conflict.id)
      if (existingColumn) {
        usedColumns.add(existingColumn.column)
      }
    }
    
    // 最初の利用可能なカラムを使用
    while (usedColumns.has(column)) {
      column++
    }
    
    const totalColumns = Math.max(1, conflictingTasks.length + 1)
    
    columns.push({
      ...task,
      column,
      totalColumns
    })
  }
  
  return columns
}

/**
 * ドラッグ可能かどうかを判定
 */
export function isDraggable(task: CalendarTask): boolean {
  // 完了したタスクはドラッグ不可
  if (task.status === 'completed') return false
  
  // 過去のタスクはドラッグ不可（現在時刻より前）
  const now = new Date()
  if (task.endTime < now) return false
  
  return true
}

/**
 * ドロップ可能かどうかを判定
 */
export function isDroppable(
  targetDate: Date,
  targetTime: Date,
  task: CalendarTask,
  existingTasks: CalendarTask[]
): boolean {
  // 過去の時刻にはドロップ不可
  const now = new Date()
  if (targetTime < now) return false
  
  // 新しい時刻でタスクを作成
  const duration = task.endTime.getTime() - task.startTime.getTime()
  const newTask: CalendarTask = {
    ...task,
    startTime: targetTime,
    endTime: new Date(targetTime.getTime() + duration)
  }
  
  // 重複チェック
  const conflicts = detectTimeConflicts(newTask, existingTasks)
  return conflicts.length === 0
}

/**
 * タスクの表示幅を計算（重複タスク用）
 */
export function calculateTaskWidth(column: number, totalColumns: number): {
  left: string
  width: string
} {
  const widthPercentage = 100 / totalColumns
  const leftPercentage = column * widthPercentage
  
  return {
    left: `${leftPercentage}%`,
    width: `${widthPercentage}%`
  }
}