import { 
  format, 
  isToday, 
  isTomorrow, 
  isYesterday, 
  isThisWeek, 
  isThisMonth,
  isThisYear,
  startOfDay,
  compareAsc,
  differenceInDays,
  isWeekend,
  isSameDay,
  getWeek,
  getYear,
  addWeeks
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { ScheduleEvent, EventDateGroup } from '../ScheduleView.types'

// カスタムヘルパー関数（date-fnsに存在しない関数の代替）
function isNextWeek(date: Date, options?: { weekStartsOn?: number }): boolean {
  const now = new Date()
  const targetWeek = getWeek(date)
  const currentWeek = getWeek(now)
  const targetYear = getYear(date)
  const currentYear = getYear(now)
  
  if (targetYear === currentYear) {
    return targetWeek === currentWeek + 1
  } else if (targetYear === currentYear + 1 && currentWeek >= 51) {
    return targetWeek === 1
  }
  
  return false
}

function isLastWeek(date: Date, options?: { weekStartsOn?: number }): boolean {
  const now = new Date()
  const targetWeek = getWeek(date)
  const currentWeek = getWeek(now)
  const targetYear = getYear(date)
  const currentYear = getYear(now)
  
  if (targetYear === currentYear) {
    return targetWeek === currentWeek - 1
  } else if (targetYear === currentYear - 1 && currentWeek <= 2) {
    return targetWeek >= 51
  }
  
  return false
}

/**
 * イベントを日付ごとにグループ化し、智的なラベルを付与
 */
export function groupEventsByDate(
  events: ScheduleEvent[],
  options: {
    showWeekends?: boolean
    currentDate?: Date
    groupBy?: 'day' | 'week' | 'month'
    displayDates?: Date[] // 表示する日付のリスト
  } = {}
): EventDateGroup[] {
  const { showWeekends = true, currentDate = new Date(), displayDates } = options
  
  // イベントを日付でグループ化
  const eventsByDate = new Map<string, ScheduleEvent[]>()
  
  events.forEach(event => {
    const eventDate = startOfDay(event.startDate)
    const dateKey = format(eventDate, 'yyyy-MM-dd')
    
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, [])
    }
    eventsByDate.get(dateKey)!.push(event)
  })
  
  // 日付グループを作成
  const groups: EventDateGroup[] = []
  
  // displayDatesが指定されている場合はそれを使用、そうでない場合は既存のロジック
  const datesToProcess = displayDates || Array.from(eventsByDate.keys())
    .map(dateKey => new Date(dateKey))
    .sort(compareAsc)
  
  datesToProcess.forEach(date => {
    // 週末フィルタリング
    if (!showWeekends && isWeekend(date)) {
      return
    }
    
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayEvents = eventsByDate.get(dateKey) || []
    
    // イベントを時刻順にソート
    const sortedEvents = dayEvents.sort((a, b) => {
      // 終日イベントを最初に表示
      if (a.isAllDay && !b.isAllDay) return -1
      if (!a.isAllDay && b.isAllDay) return 1
      
      // 時刻順にソート
      return compareAsc(a.startDate, b.startDate)
    })
    
    groups.push({
      date,
      label: getDateGroupLabel(date, currentDate),
      isToday: isToday(date),
      isPast: differenceInDays(date, startOfDay(currentDate)) < 0,
      isWeekend: isWeekend(date),
      events: sortedEvents
    })
  })
  
  return groups
}

/**
 * 日付に基づいて智的なラベルを生成
 * Google Calendar風の相対日付表示
 */
export function getDateGroupLabel(date: Date, currentDate: Date = new Date()): string {
  // 今日
  if (isToday(date)) {
    return `今日 • ${format(date, 'M月d日（E）', { locale: ja })}`
  }
  
  // 昨日
  if (isYesterday(date)) {
    return `昨日 • ${format(date, 'M月d日（E）', { locale: ja })}`
  }
  
  // 明日
  if (isTomorrow(date)) {
    return `明日 • ${format(date, 'M月d日（E）', { locale: ja })}`
  }
  
  // 今週
  if (isThisWeek(date, { weekStartsOn: 1 })) { // 月曜始まり
    return format(date, 'M月d日（E）', { locale: ja })
  }
  
  // 先週
  if (isLastWeek(date, { weekStartsOn: 1 })) {
    return `先週 • ${format(date, 'M月d日（E）', { locale: ja })}`
  }
  
  // 来週
  if (isNextWeek(date, { weekStartsOn: 1 })) {
    return `来週 • ${format(date, 'M月d日（E）', { locale: ja })}`
  }
  
  // 今月
  if (isThisMonth(date)) {
    return format(date, 'M月d日（E）', { locale: ja })
  }
  
  // 今年
  if (isThisYear(date)) {
    return format(date, 'M月d日（E）', { locale: ja })
  }
  
  // その他（年を含む）
  return format(date, 'yyyy年M月d日（E）', { locale: ja })
}

/**
 * 空き時間を検出（営業時間内の30分以上の空き）
 */
export function detectFreeSlots(
  events: ScheduleEvent[],
  date: Date,
  workingHours: { start: number; end: number } = { start: 9, end: 18 }
) {
  const dayStart = new Date(date)
  dayStart.setHours(workingHours.start, 0, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(workingHours.end, 0, 0, 0)
  
  // その日のイベントを時刻順にソート（終日イベントは除外）
  const dayEvents = events
    .filter(event => 
      isSameDay(event.startDate, date) && 
      !event.isAllDay
    )
    .sort((a, b) => compareAsc(a.startDate, b.startDate))
  
  const freeSlots = []
  let currentTime = dayStart
  
  for (const event of dayEvents) {
    const eventStart = event.startDate
    const eventEnd = event.endDate
    
    // 現在時刻とイベント開始時刻の間に30分以上の空きがあるか
    const gapMinutes = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60)
    
    if (gapMinutes >= 30) {
      freeSlots.push({
        startTime: new Date(currentTime),
        endTime: new Date(eventStart),
        duration: gapMinutes,
        label: `${format(currentTime, 'H:mm')} - ${format(eventStart, 'H:mm')} (${Math.floor(gapMinutes / 60)}時間${gapMinutes % 60}分空き)`
      })
    }
    
    // 次の開始時刻をイベント終了時刻に更新
    currentTime = new Date(Math.max(currentTime.getTime(), eventEnd.getTime()))
  }
  
  // 最後のイベント後から営業時間終了まで
  const finalGapMinutes = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60)
  if (finalGapMinutes >= 30) {
    freeSlots.push({
      startTime: new Date(currentTime),
      endTime: new Date(dayEnd),
      duration: finalGapMinutes,
      label: `${format(currentTime, 'H:mm')} - ${format(dayEnd, 'H:mm')} (${Math.floor(finalGapMinutes / 60)}時間${finalGapMinutes % 60}分空き)`
    })
  }
  
  return freeSlots
}

/**
 * イベントをソートするためのコンパレータ
 */
export function sortEventsByTime(a: ScheduleEvent, b: ScheduleEvent): number {
  // 終日イベントを最初に表示
  if (a.isAllDay && !b.isAllDay) return -1
  if (!a.isAllDay && b.isAllDay) return 1
  
  // 両方とも終日イベントの場合はタイトル順
  if (a.isAllDay && b.isAllDay) {
    return a.title.localeCompare(b.title)
  }
  
  // 時刻順にソート
  const timeComparison = compareAsc(a.startDate, b.startDate)
  if (timeComparison !== 0) return timeComparison
  
  // 開始時刻が同じ場合は終了時刻順
  return compareAsc(a.endDate, b.endDate)
}

/**
 * 次の予定を検索
 */
export function findNextEvent(
  events: ScheduleEvent[], 
  currentTime: Date = new Date()
): ScheduleEvent | null {
  const futureEvents = events
    .filter(event => event.startDate > currentTime)
    .sort(sortEventsByTime)
  
  return futureEvents.length > 0 ? futureEvents[0] : null
}

/**
 * 今日の残り予定数を取得
 */
export function getTodayRemainingEvents(
  events: ScheduleEvent[],
  currentTime: Date = new Date()
): number {
  const today = startOfDay(new Date())
  
  return events.filter(event => 
    isSameDay(event.startDate, today) && 
    event.startDate > currentTime
  ).length
}