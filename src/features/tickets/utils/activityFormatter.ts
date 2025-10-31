import type { TicketActivity, TicketActivityDisplay } from '../types/activity'

/**
 * アクティビティを表示用フォーマットに変換
 */
export function formatActivity(activity: TicketActivity): TicketActivityDisplay {
  let message = ''
  let icon: TicketActivityDisplay['icon'] = 'update'

  switch (activity.action_type) {
    case 'created':
      message = 'チケットを作成'
      icon = 'create'
      break

    case 'updated':
      message = 'チケットを更新'
      icon = 'update'
      break

    case 'status_changed': {
      const statusLabels: Record<string, string> = {
        backlog: '準備中',
        ready: '配置済み',
        active: '作業中',
        wait: '待ち',
        done: '完了',
        cancel: '中止',
      }
      const oldLabel = activity.old_value ? statusLabels[activity.old_value] || activity.old_value : ''
      const newLabel = activity.new_value ? statusLabels[activity.new_value] || activity.new_value : ''
      message = `ステータスを「${oldLabel}」から「${newLabel}」に変更`
      icon = 'status'
      break
    }

    case 'priority_changed': {
      const priorityLabels: Record<string, string> = {
        urgent: '緊急',
        high: '高',
        normal: '通常',
        low: '低',
      }
      const oldLabel = activity.old_value ? priorityLabels[activity.old_value] || activity.old_value : ''
      const newLabel = activity.new_value ? priorityLabels[activity.new_value] || activity.new_value : ''
      message = `優先度を「${oldLabel}」から「${newLabel}」に変更`
      icon = 'priority'
      break
    }

    case 'title_changed':
      message =
        activity.old_value && activity.new_value
          ? `タイトルを「${activity.old_value}」から「${activity.new_value}」に変更`
          : 'タイトルを変更'
      icon = 'update'
      break

    case 'description_changed':
      message = '説明を更新'
      icon = 'update'
      break

    case 'due_date_changed':
      message =
        activity.old_value && activity.new_value
          ? `期限を「${activity.old_value}」から「${activity.new_value}」に変更`
          : '期限を変更'
      icon = 'update'
      break

    case 'time_changed':
      message =
        activity.old_value && activity.new_value
          ? `時間を「${activity.old_value}」から「${activity.new_value}」に変更`
          : '時間を変更'
      icon = 'update'
      break

    case 'tag_added':
      message = `タグ「${activity.new_value}」を追加`
      icon = 'tag'
      break

    case 'tag_removed':
      message = `タグ「${activity.old_value}」を削除`
      icon = 'tag'
      break

    case 'deleted':
      message = 'チケットを削除'
      icon = 'delete'
      break

    default:
      message = '変更'
      icon = 'update'
  }

  return {
    ...activity,
    message,
    icon,
  }
}

// formatRelativeTimeはformatters.tsにあるのでそちらを使う
export { formatRelativeTime } from './formatters'
