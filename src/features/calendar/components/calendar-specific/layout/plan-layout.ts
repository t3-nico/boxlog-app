import type { CalendarPlan } from '../../../types/calendar.types'

/**
 * プラングループ - 重なり合うプランの集合
 */
export interface EventGroup {
  id: string
  events: CalendarPlan[]
  startTime: Date
  endTime: Date
  maxColumns: number
}

/**
 * 列割り当て情報
 */
export interface ColumnAssignment {
  eventId: string
  column: number // 0から始まる列インデックス
  totalColumns: number // このグループの総列数
  width: number // パーセンテージ (0-100)
  left: number // 左位置のパーセンテージ (0-100)
}

/**
 * レイアウト適用後のプラン
 */
export interface LayoutedEvent extends CalendarPlan {
  layout: {
    column: number
    totalColumns: number
    width: number // パーセンテージ
    left: number // パーセンテージ
    top: number // ピクセルまたはパーセンテージ
    height: number // ピクセルまたはパーセンテージ
    zIndex: number
  }
}

/**
 * プラン位置情報（内部用）
 */
interface EventPosition {
  plan: CalendarPlan
  start: number // 分単位
  end: number // 分単位
  column?: number
  columns?: number
}

// 最大列数制限
const MAX_COLUMNS = 2

// 最小プラン幅（パーセンテージ）
const MIN_EVENT_WIDTH = 45 // 2列の場合は各列45%程度

// プラン間マージン（パーセンテージ）
const EVENT_MARGIN = 2

/**
 * 2つのプランが時間的に重なっているかを判定
 */
function eventsOverlap(event1: CalendarPlan, event2: CalendarPlan): boolean {
  const start1 = event1.startDate.getTime()
  const end1 = event1.endDate?.getTime() || event1.startDate.getTime()
  const start2 = event2.startDate.getTime()
  const end2 = event2.endDate?.getTime() || event2.startDate.getTime()

  return start1 < end2 && start2 < end1
}

/**
 * 時刻を分単位に変換（その日の0時からの経過分）
 */
function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * 同じ日のプランかどうかを判定
 */
function _isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * 重なり合うプランをグループ化
 * @param events カレンダープランの配列
 * @returns プラングループの配列
 */
export function detectOverlappingEvents(events: CalendarPlan[]): EventGroup[] {
  if (events.length === 0) return []

  // 日付ごとにプランを分類
  const eventsByDay = new Map<string, CalendarPlan[]>()

  events.forEach((event) => {
    const dayKey = `${event.startDate.getFullYear()}-${event.startDate.getMonth()}-${event.startDate.getDate()}`
    const dayEvents = eventsByDay.get(dayKey) || []
    dayEvents.push(event)
    eventsByDay.set(dayKey, dayEvents)
  })

  const groups: EventGroup[] = []

  // 各日のプランをグループ化
  eventsByDay.forEach((dayEvents, dayKey) => {
    // 開始時刻でソート
    const sortedEvents = [...dayEvents].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    // 重なるプランをグループ化
    const dayGroups: CalendarPlan[][] = []

    sortedEvents.forEach((event) => {
      let addedToGroup = false

      // 既存のグループに追加できるかチェック
      for (const group of dayGroups) {
        if (group.some((groupEvent) => eventsOverlap(event, groupEvent))) {
          group.push(event)
          addedToGroup = true
          break
        }
      }

      // どのグループにも追加できなかった場合、新しいグループを作成
      if (!addedToGroup) {
        dayGroups.push([event])
      }
    })

    // 隣接するグループをマージ（より正確なグループ化）
    const mergedGroups: CalendarPlan[][] = []

    dayGroups.forEach((group) => {
      let merged = false

      for (let i = 0; i < mergedGroups.length; i++) {
        const mergedGroup = i < mergedGroups.length && i in mergedGroups ? mergedGroups[i] : null
        if (!mergedGroup) continue
        // グループ同士が重なるかチェック
        const hasOverlap = group.some((event1) => mergedGroup.some((event2) => eventsOverlap(event1, event2)))

        if (hasOverlap) {
          // マージ
          mergedGroups[i] = [...mergedGroup, ...group]
          merged = true
          break
        }
      }

      if (!merged) {
        mergedGroups.push(group)
      }
    })

    // EventGroup オブジェクトを作成
    mergedGroups.forEach((group, index) => {
      const startTime = new Date(Math.min(...group.map((e) => e.startDate.getTime())))
      const endTime = new Date(Math.max(...group.map((e) => e.endDate?.getTime() || e.startDate.getTime())))

      groups.push({
        id: `${dayKey}-group-${index}`,
        events: group,
        startTime,
        endTime,
        maxColumns: 0, // 後で計算
      })
    })
  })

  return groups
}

/**
 * プラングループ内での列配置を計算
 * @param group プラングループ
 * @returns 列割り当て情報の配列
 */
export function calculateEventColumns(group: EventGroup): ColumnAssignment[] {
  if (group.events.length === 0) return []

  // プランを開始時刻でソート
  const sortedEvents = [...group.events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  // 各プランの位置情報を作成
  const positions: EventPosition[] = sortedEvents.map((plan) => ({
    plan,
    start: timeToMinutes(plan.startDate),
    end: timeToMinutes(plan.endDate || plan.startDate),
    column: undefined,
    columns: undefined,
  }))

  // 使用中の列を追跡（列番号 -> 終了時刻）
  const columnsInUse: Map<number, number> = new Map()

  // 各プランに列を割り当て（最大2列まで）
  positions.forEach((pos) => {
    // 利用可能な最小の列番号を見つける（最大MAX_COLUMNS列まで）
    let column = 0
    while (column < MAX_COLUMNS && columnsInUse.has(column)) {
      const columnEndTime = columnsInUse.get(column)!
      if (columnEndTime <= pos.start) {
        // この列は利用可能
        break
      }
      column++
    }

    // 最大列数を超える場合は最後の列に配置（重ねる）
    if (column >= MAX_COLUMNS) {
      column = MAX_COLUMNS - 1
    }

    pos.column = column
    columnsInUse.set(column, pos.end)
  })

  // 最大列数を計算（MAX_COLUMNS以下に制限）
  const maxColumns = Math.min(Math.max(...positions.map((p) => p.column!)) + 1, MAX_COLUMNS)

  // 各プランが実際に占有できる列数を計算
  positions.forEach((pos) => {
    const { start } = pos
    const { end } = pos
    const myColumn = pos.column!

    // 同じ時間帯に存在する他のプランの最大列番号を見つける
    let maxColumnInTimeRange = myColumn

    positions.forEach((other) => {
      if (other === pos) return

      // 時間が重なっている場合
      if (other.start < end && other.end > start) {
        if (other.column! > maxColumnInTimeRange) {
          maxColumnInTimeRange = other.column!
        }
      }
    })

    pos.columns = maxColumnInTimeRange - myColumn + 1
  })

  // ColumnAssignment を作成
  const assignments: ColumnAssignment[] = positions.map((pos) => {
    const column = pos.column!
    const totalColumns = maxColumns

    // 幅と位置を計算（マージンを考慮）

    // 2列制限での幅と位置計算
    let width: number
    let left: number

    if (totalColumns === 1) {
      // 1列の場合：全幅使用
      width = 100 - EVENT_MARGIN
      left = EVENT_MARGIN / 2
    } else {
      // 2列の場合：半分ずつ
      width = (100 - EVENT_MARGIN * 3) / 2 // 3つのマージン分を除いた半分
      left = column === 0 ? EVENT_MARGIN : 50 + EVENT_MARGIN / 2
    }

    return {
      eventId: pos.plan.id,
      column,
      totalColumns,
      width,
      left,
    }
  })

  // グループの maxColumns を更新
  group.maxColumns = maxColumns

  return assignments
}

/**
 * カレンダープランにレイアウト情報を適用
 * @param events カレンダープランの配列
 * @param dayStartHour 表示開始時刻（デフォルト: 0）
 * @param dayEndHour 表示終了時刻（デフォルト: 24）
 * @param hourHeight 1時間あたりの高さ（ピクセル、デフォルト: 60）
 * @returns レイアウト適用後のプラン配列
 */
export function applyEventLayout(
  events: CalendarPlan[],
  dayStartHour: number = 0,
  dayEndHour: number = 24,
  hourHeight: number = 60
): LayoutedEvent[] {
  if (events.length === 0) return []

  // 重なりグループを検出
  const groups = detectOverlappingEvents(events)

  // 各グループの列配置を計算
  const allAssignments = new Map<string, ColumnAssignment>()

  groups.forEach((group) => {
    const assignments = calculateEventColumns(group)
    assignments.forEach((assignment) => {
      allAssignments.set(assignment.eventId, assignment)
    })
  })

  // レイアウト情報を適用
  const layoutedEvents: LayoutedEvent[] = events.map((event, _index) => {
    const assignment = allAssignments.get(event.id)

    // 時間を位置に変換
    const startMinutes = event.startDate.getHours() * 60 + event.startDate.getMinutes()
    const endMinutes = event.endDate ? event.endDate.getHours() * 60 + event.endDate.getMinutes() : startMinutes + 60 // デフォルト1時間

    const dayStartMinutes = dayStartHour * 60
    const dayEndMinutes = dayEndHour * 60
    const dayDurationMinutes = dayEndMinutes - dayStartMinutes

    // ピクセル単位での位置と高さを計算
    const minuteHeight = (hourHeight * (dayEndHour - dayStartHour)) / dayDurationMinutes
    const top = (startMinutes - dayStartMinutes) * minuteHeight
    const height = Math.max((endMinutes - startMinutes) * minuteHeight, 20) // 最小高さ20px

    // デフォルトレイアウト（重なりがない場合）
    let layout = {
      column: 0,
      totalColumns: 1,
      width: 95, // デフォルト幅（マージン考慮）
      left: 2.5, // センタリング
      top,
      height,
      zIndex: 1,
    }

    // 割り当てがある場合は適用
    if (assignment) {
      layout = {
        column: assignment.column,
        totalColumns: assignment.totalColumns,
        width: assignment.width,
        left: assignment.left,
        top,
        height,
        zIndex: assignment.column + 1, // 後の列ほど前面に
      }
    }

    return {
      ...event,
      layout,
    }
  })

  return layoutedEvents
}

/**
 * レスポンシブ対応のレイアウト計算
 * 画面幅に応じて列数を調整
 */
export function applyResponsiveEventLayout(
  events: CalendarPlan[],
  containerWidth: number,
  dayStartHour: number = 0,
  dayEndHour: number = 24,
  hourHeight: number = 60
): LayoutedEvent[] {
  // 画面幅に応じて最大列数を制限
  const maxColumnsAllowed = containerWidth < 400 ? 2 : containerWidth < 600 ? 3 : containerWidth < 800 ? 4 : Infinity

  const layoutedEvents = applyEventLayout(events, dayStartHour, dayEndHour, hourHeight)

  // 最大列数を超える場合は調整
  layoutedEvents.forEach((event) => {
    if (event.layout.totalColumns > maxColumnsAllowed) {
      const scaleFactor = maxColumnsAllowed / event.layout.totalColumns

      // 幅を調整（最小幅を保証）
      event.layout.width = Math.max(event.layout.width * scaleFactor, MIN_EVENT_WIDTH)

      // 位置を調整（列インデックスに基づいて再計算）
      const adjustedColumn = Math.min(event.layout.column, maxColumnsAllowed - 1)
      const baseWidth = 100 / maxColumnsAllowed
      event.layout.left = adjustedColumn * baseWidth + EVENT_MARGIN / 2

      event.layout.totalColumns = maxColumnsAllowed
      event.layout.column = adjustedColumn
    }
  })

  return layoutedEvents
}

/**
 * デバッグ用: レイアウト情報を文字列で表示
 */
export function debugLayoutInfo(layoutedEvents: LayoutedEvent[]): string {
  return layoutedEvents
    .map((event) => {
      const { layout } = event
      return `${event.title}: Column ${layout.column}/${layout.totalColumns}, Width: ${layout.width.toFixed(1)}%, Left: ${layout.left.toFixed(1)}%, Height: ${layout.height.toFixed(0)}px`
    })
    .join('\n')
}
