import type { ActivityActionType } from '@/schemas/records/activity';

import type { ActivityIconColor, RecordActivity, RecordActivityDisplay } from '../types/activity';

/**
 * 相対時間をフォーマット
 */
export function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === 'ja') {
    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  }

  // English
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * UI表示対象のアクションタイプ
 *
 * - created: ライフサイクル開始
 * - time_changed: 記録時間の変更
 * - title_changed: タイトル変更
 * - memo_changed: メモ変更（Recordでは記録の一部として重要）
 * - fulfillment_changed: 充実度変更
 * - tag_added: タグ追加
 * - tag_removed: タグ削除
 *
 * ※ deleted は除外: record_activities が ON DELETE CASCADE のため
 */
const VISIBLE_ACTION_TYPES: Set<ActivityActionType> = new Set([
  'created',
  'time_changed',
  'title_changed',
  'memo_changed',
  'fulfillment_changed',
  'tag_added',
  'tag_removed',
]);

/**
 * アクティビティが表示対象かどうかを判定
 */
export function isVisibleActivity(activity: RecordActivity): boolean {
  return VISIBLE_ACTION_TYPES.has(activity.action_type);
}

/**
 * アクティビティ配列から表示対象のみをフィルタリング
 */
export function filterVisibleActivities(activities: RecordActivity[]): RecordActivity[] {
  return activities.filter(isVisibleActivity);
}

/**
 * アクティビティを表示用フォーマットに変換
 */
export function formatActivity(activity: RecordActivity): RecordActivityDisplay {
  let actionLabelKey = '';
  let detail: string | undefined;
  let icon: RecordActivityDisplay['icon'] = 'time';
  let iconColor: ActivityIconColor = 'info';

  switch (activity.action_type) {
    case 'created':
      actionLabelKey = 'record.activity.created';
      icon = 'create';
      iconColor = 'success';
      break;

    case 'updated':
      actionLabelKey = 'record.activity.updated';
      icon = 'time';
      iconColor = 'info';
      break;

    case 'time_changed':
      actionLabelKey = 'record.activity.timeChanged';
      if (activity.old_value && activity.new_value) {
        detail = `${activity.old_value} → ${activity.new_value}`;
      }
      icon = 'time';
      iconColor = 'info';
      break;

    case 'title_changed':
      actionLabelKey = 'record.activity.titleChanged';
      if (activity.old_value && activity.new_value) {
        detail = `${activity.old_value} → ${activity.new_value}`;
      }
      icon = 'time';
      iconColor = 'info';
      break;

    case 'memo_changed':
      actionLabelKey = 'record.activity.memoChanged';
      icon = 'time';
      iconColor = 'info';
      break;

    case 'fulfillment_changed':
      actionLabelKey = 'record.activity.fulfillmentChanged';
      if (activity.old_value && activity.new_value) {
        detail = `${activity.old_value} → ${activity.new_value}`;
      }
      icon = 'fulfillment';
      iconColor = 'warning';
      break;

    case 'tag_added':
      actionLabelKey = 'record.activity.tagAdded';
      if (activity.new_value) {
        detail = activity.new_value;
      }
      icon = 'tag';
      iconColor = 'primary';
      break;

    case 'tag_removed':
      actionLabelKey = 'record.activity.tagRemoved';
      if (activity.old_value) {
        detail = activity.old_value;
      }
      icon = 'tag';
      iconColor = 'destructive';
      break;

    case 'deleted':
      actionLabelKey = 'record.activity.deleted';
      icon = 'delete';
      iconColor = 'destructive';
      break;

    default:
      actionLabelKey = 'record.activity.changed';
      icon = 'time';
      iconColor = 'info';
  }

  return {
    ...activity,
    actionLabelKey,
    detail,
    icon,
    iconColor,
  };
}
