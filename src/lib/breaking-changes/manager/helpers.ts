/**
 * 表示ヘルパー関数
 */

import type { AffectedGroup, BreakingChange, ImpactLevel } from '../types'

/**
 * 🎨 影響度の絵文字取得
 */
export function getImpactEmoji(impact: ImpactLevel): string {
  const emojis = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }
  return emojis[impact]
}

/**
 * 🎨 変更タイプの絵文字取得
 */
export function getChangeEmoji(type: string): string {
  const emojis = {
    api_change: '🔌',
    config_change: '⚙️',
    database_change: '🗄️',
    dependency_change: '📦',
    interface_change: '🎨',
    auth_change: '🔐',
    behavior_change: '🔄',
    removal: '🗑️',
  }
  return emojis[type as keyof typeof emojis] || '🔧'
}

/**
 * 🎨 グループの絵文字取得
 */
export function getGroupEmoji(group: AffectedGroup): string {
  const emojis = {
    end_users: '👥',
    developers: '💻',
    api_consumers: '🔌',
    devops: '🚀',
    administrators: '👮',
    external_systems: '🌐',
  }
  return emojis[group] || '👤'
}

/**
 * 🎨 グループの表示名取得
 */
export function getGroupDisplayName(group: AffectedGroup): string {
  const names = {
    end_users: 'エンドユーザー',
    developers: '開発者',
    api_consumers: 'API利用者',
    devops: 'DevOps・運用担当',
    administrators: 'システム管理者',
    external_systems: '外部システム連携',
  }
  return names[group] || group
}

/**
 * 📅 デフォルト開始日取得
 */
export function getDefaultStartDate(): string {
  return new Date().toISOString().split('T')[0]!
}

/**
 * 📅 終了日計算
 */
export function calculateEndDate(changes: BreakingChange[]): string {
  const totalTime = changes.reduce((sum, change) => sum + (change.migration.estimatedTime || 0), 0)
  const days = Math.ceil(totalTime / (8 * 60)) // 8時間/日として計算
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)
  return endDate.toISOString().split('T')[0]!
}

/**
 * 🆔 変更IDの生成
 */
export function generateChangeId(version: string, title: string): string {
  const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return `${version}-${sanitized}`.substring(0, 50)
}

/**
 * 🆔 プランIDの生成
 */
export function generatePlanId(version: string): string {
  return `migration-plan-${version}-${Date.now()}`
}

/**
 * 🔄 バージョンでグループ化
 */
export function groupChangesByVersion(changes: BreakingChange[]): Record<string, BreakingChange[]> {
  return changes.reduce(
    (groups, change) => {
      if (!groups[change.version]) {
        groups[change.version] = []
      }
      groups[change.version]!.push(change)
      return groups
    },
    {} as Record<string, BreakingChange[]>
  )
}
