import type { PlanStatus } from '../types/plan'

/**
 * チケット番号のフォーマット
 * @example formatplanNumber("TKT-20241030-001") => "#TKT-001"
 */
export function formatplanNumber(planNumber: string): string {
  // TKT-20241030-001 → #TKT-001
  const parts = planNumber.split('-')
  if (parts.length === 3) {
    return `#${parts[0]}-${parts[2]}`
  }
  return `#${planNumber}`
}

/**
 * チケットステータスの表示名
 */
export function formatplanStatus(status: PlanStatus): string {
  const statusMap: Record<PlanStatus, string> = {
    backlog: '準備中',
    ready: '配置済み',
    active: '作業中',
    wait: '待ち',
    done: '完了',
    cancel: '中止',
  }
  return statusMap[status]
}

/**
 * 日付のフォーマット（YYYY-MM-DD → YYYY年MM月DD日）
 */
export function formatplanDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  } catch {
    return dateString
  }
}

/**
 * 日時のフォーマット（ISO 8601 → YYYY/MM/DD HH:mm）
 */
export function formatplanDateTime(dateTimeString: string | null | undefined): string {
  if (!dateTimeString) return '-'

  try {
    const date = new Date(dateTimeString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}`
  } catch {
    return dateTimeString
  }
}

/**
 * 相対時間のフォーマット（created_at, updated_at用）
 * @example "2分前", "3時間前", "2日前"
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'たった今'
    if (diffMinutes < 60) return `${diffMinutes}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 30) return `${diffDays}日前`

    return formatplanDate(dateString)
  } catch {
    return dateString
  }
}
