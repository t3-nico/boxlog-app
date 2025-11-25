import type { PlanStatus } from '@/features/plans/types/plan'
import { isBefore, isToday, isTomorrow, isWithinInterval, startOfDay } from 'date-fns'
import type { InboxItem } from '../hooks/useInboxData'
import type { GroupByField, GroupedData } from '../types/group'

/**
 * ステータスラベルマップ
 */
const STATUS_LABELS: Record<PlanStatus, string> = {
  backlog: '準備中',
  ready: '配置済み',
  active: '作業中',
  wait: '待ち',
  done: '完了',
  cancel: '中止',
}

/**
 * アイテムをグループ化
 *
 * 指定されたフィールドでアイテムをグループ分けする
 *
 * @param items - グループ化するアイテム
 * @param groupBy - グループ化フィールド
 * @returns グループ化されたデータ
 *
 * @example
 * ```typescript
 * const grouped = groupItems(items, 'status')
 * // => [
 * //   { groupKey: 'active', groupLabel: '作業中', items: [...], count: 5 },
 * //   { groupKey: 'ready', groupLabel: '配置済み', items: [...], count: 3 }
 * // ]
 * ```
 */
export function groupItems(items: InboxItem[], groupBy: GroupByField): GroupedData<InboxItem>[] {
  if (!groupBy) {
    return [
      {
        groupKey: 'all',
        groupLabel: 'すべて',
        items,
        count: items.length,
      },
    ]
  }

  const groups = new Map<string, InboxItem[]>()

  items.forEach((item) => {
    const groupKey = getGroupKey(item, groupBy)
    const existing = groups.get(groupKey) || []
    groups.set(groupKey, [...existing, item])
  })

  // グループをソート順に変換
  const sortedGroups = Array.from(groups.entries())
    .map(([groupKey, groupItems]) => ({
      groupKey,
      groupLabel: getGroupLabel(groupKey, groupBy),
      items: groupItems,
      count: groupItems.length,
    }))
    .sort((a, b) => {
      // グループの並び順を定義
      if (groupBy === 'status') {
        const statusOrder: PlanStatus[] = ['active', 'ready', 'backlog', 'wait', 'done', 'cancel']
        return statusOrder.indexOf(a.groupKey as PlanStatus) - statusOrder.indexOf(b.groupKey as PlanStatus)
      }

      if (groupBy === 'due_date') {
        const dueDateOrder = ['overdue', 'today', 'tomorrow', 'this-week', 'later', 'no-due-date']
        return dueDateOrder.indexOf(a.groupKey) - dueDateOrder.indexOf(b.groupKey)
      }

      // その他はアルファベット順
      return a.groupLabel.localeCompare(b.groupLabel)
    })

  return sortedGroups
}

/**
 * アイテムのグループキーを取得
 */
function getGroupKey(item: InboxItem, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'status':
      return item.status

    case 'due_date':
      return getDueDateGroup(item.due_date || null)

    case 'tags':
      return item.tags && item.tags.length > 0 ? item.tags[0].name : 'タグなし'

    default:
      return 'unknown'
  }
}

/**
 * グループラベルを取得
 */
function getGroupLabel(groupKey: string, groupBy: GroupByField): string {
  switch (groupBy) {
    case 'status':
      return STATUS_LABELS[groupKey as PlanStatus] || groupKey

    case 'due_date':
      return getDueDateLabel(groupKey)

    case 'tags':
      return groupKey

    default:
      return groupKey
  }
}

/**
 * 期限からグループを判定
 */
function getDueDateGroup(dueDate: string | null): string {
  if (!dueDate) return 'no-due-date'

  const date = new Date(dueDate)
  const today = startOfDay(new Date())

  if (isBefore(date, today)) return 'overdue'
  if (isToday(date)) return 'today'
  if (isTomorrow(date)) return 'tomorrow'

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  if (isWithinInterval(date, { start: today, end: nextWeek })) {
    return 'this-week'
  }

  return 'later'
}

/**
 * 期限グループのラベルを取得
 */
function getDueDateLabel(groupKey: string): string {
  const labels: Record<string, string> = {
    overdue: '期限超過',
    today: '今日',
    tomorrow: '明日',
    'this-week': '今週',
    later: '今週以降',
    'no-due-date': '期限なし',
  }

  return labels[groupKey] || groupKey
}
