/**
 * 日付操作ヘルパー関数
 */

/**
 * 今日かどうか判定
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * 週末かどうか判定（土日）
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * 日付を日の開始時刻に設定
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 日付を日の終了時刻に設定
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'numeric' = 'short'): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  const month = months[date.getMonth()]
  
  switch (format) {
    case 'numeric':
      return `${day}`
    case 'short':
      return `${day}日(${weekday})`
    case 'long':
      return `${month}${day}日(${weekday})`
    default:
      return `${day}`
  }
}

/**
 * 時刻をフォーマット
 */
export function formatTime(date: Date, format: '12h' | '24h' = '24h'): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  if (format === '24h') {
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  } else {
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }
}

/**
 * 時間範囲をフォーマット
 */
export function formatTimeRange(start: Date, end: Date, format: '12h' | '24h' = '24h'): string {
  return `${formatTime(start, format)} - ${formatTime(end, format)}`
}

/**
 * 同じ日かどうか判定
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}

/**
 * 日付の差を日数で取得
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1)
  const d2 = startOfDay(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * 日付配列を生成
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * 週の開始日を取得（月曜日）
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1)
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 週の終了日を取得（日曜日）
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * 月の開始日を取得
 */
export function getMonthStart(date: Date): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * 月の終了日を取得
 */
export function getMonthEnd(date: Date): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1, 0) // 次の月の0日 = 今月の最終日
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * 日付を指定日数分移動
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 時刻を指定分数分移動
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

/**
 * 日付キー生成（yyyy-MM-dd形式）
 * 全ビューで共通使用
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * イベントの妥当性をチェック
 */
export function isValidEvent(event: { startDate?: Date | string; [key: string]: unknown }): boolean {
  if (!event.startDate) return false

  const eventStart = event.startDate instanceof Date
    ? event.startDate
    : new Date(event.startDate)

  return !isNaN(eventStart.getTime())
}

/**
 * イベントの日付を正規化（DateまたはstringをDateに変換）
 */
export function normalizeEventDate(eventDate: Date | string): Date | null {
  if (!eventDate) return null
  
  const date = eventDate instanceof Date ? eventDate : new Date(eventDate)
  return isNaN(date.getTime()) ? null : date
}

/**
 * 今日のインデックスを取得（日付配列内での位置）
 */
export function getTodayIndex(dates: Date[]): number {
  const today = new Date()
  return dates.findIndex(date => isSameDay(date, today))
}