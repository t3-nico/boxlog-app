import type { ActivityActionType } from '@/schemas/plans/activity';

import type { ActivityIconColor, PlanActivity, PlanActivityDisplay } from '../types/activity';

/**
 * UI表示対象のアクションタイプ
 * GAFA基準: 「意思決定」を伴う変更のみ表示
 *
 * - created: ライフサイクル開始
 * - status_changed: 最重要（完了/未完了）
 * - title_changed: プラン名の変更（識別情報の変更）
 * - time_changed: カレンダーアプリの本質
 * - due_date_changed: 期限管理の重要イベント
 * - tag_added: タグ追加（分類の意思決定）
 * - tag_removed: タグ削除（分類の意思決定）
 * - recurrence_changed: 繰り返し設定（習慣化の意思決定）
 * - reminder_changed: 通知設定（リマインダーの意思決定）
 *
 * ※ deleted は除外: plan_activities が ON DELETE CASCADE のため、
 *   プラン削除時にアクティビティも削除され誰も見れない
 * ※ description_changed は除外: 頻繁な編集作業でノイズになりやすい
 */
const VISIBLE_ACTION_TYPES: Set<ActivityActionType> = new Set([
  'created',
  'status_changed',
  'title_changed',
  'time_changed',
  'due_date_changed',
  'tag_added',
  'tag_removed',
  'recurrence_changed',
  'reminder_changed',
]);

/**
 * アクティビティが表示対象かどうかを判定
 */
export function isVisibleActivity(activity: PlanActivity): boolean {
  return VISIBLE_ACTION_TYPES.has(activity.action_type);
}

/**
 * アクティビティ配列から表示対象のみをフィルタリング
 */
export function filterVisibleActivities(activities: PlanActivity[]): PlanActivity[] {
  return activities.filter(isVisibleActivity);
}

/**
 * アクティビティを表示用フォーマットに変換
 *
 * TickTick風のデザイン:
 * - actionLabel: 簡潔なアクション名（例: "ステータスを変更"）
 * - detail: 詳細情報（例: "未完了 → 完了"）※任意
 * - iconColor: アイコンの色
 */
export function formatActivity(activity: PlanActivity): PlanActivityDisplay {
  let actionLabel = '';
  let detail: string | undefined;
  let icon: PlanActivityDisplay['icon'] = 'update';
  let iconColor: ActivityIconColor = 'info';

  switch (activity.action_type) {
    case 'created':
      actionLabel = 'プランを作成';
      icon = 'create';
      iconColor = 'success';
      break;

    case 'updated':
      actionLabel = 'プランを更新';
      icon = 'update';
      iconColor = 'info';
      break;

    case 'status_changed': {
      const statusLabels: Record<string, string> = {
        open: 'Open',
        closed: 'Closed',
        // 後方互換: 旧ステータス値
        todo: '未完了',
        doing: '進行中',
        done: '完了',
        backlog: '準備中',
        ready: '配置済み',
        active: '作業中',
        wait: '待ち',
        cancel: '中止',
      };
      actionLabel = 'ステータスを変更';
      const oldLabel = activity.old_value
        ? (statusLabels[activity.old_value] ?? activity.old_value)
        : '';
      const newLabel = activity.new_value
        ? (statusLabels[activity.new_value] ?? activity.new_value)
        : '';
      if (oldLabel && newLabel) {
        detail = `${oldLabel} → ${newLabel}`;
      }
      icon = 'status';
      iconColor = 'warning';
      break;
    }

    case 'title_changed':
      actionLabel = 'タイトルを変更';
      if (activity.old_value && activity.new_value) {
        detail = `${activity.old_value} → ${activity.new_value}`;
      }
      icon = 'update';
      iconColor = 'info';
      break;

    case 'description_changed':
      actionLabel = '説明を更新';
      icon = 'update';
      iconColor = 'info';
      break;

    case 'due_date_changed':
      actionLabel = '期限を変更';
      if (activity.old_value && activity.new_value) {
        detail = `${activity.old_value} → ${activity.new_value}`;
      }
      icon = 'due_date';
      iconColor = 'info';
      break;

    case 'time_changed':
      actionLabel = '時間を変更';
      if (activity.old_value && activity.new_value) {
        detail = `${activity.old_value} → ${activity.new_value}`;
      }
      icon = 'time';
      iconColor = 'info';
      break;

    case 'tag_added':
      actionLabel = 'タグを追加';
      if (activity.new_value) {
        detail = activity.new_value;
      }
      icon = 'tag';
      iconColor = 'primary';
      break;

    case 'tag_removed':
      actionLabel = 'タグを削除';
      if (activity.old_value) {
        detail = activity.old_value;
      }
      icon = 'tag';
      iconColor = 'primary';
      break;

    case 'recurrence_changed':
      actionLabel = '繰り返しを変更';
      if (activity.new_value) {
        detail = activity.new_value;
      } else if (activity.old_value) {
        detail = `${activity.old_value} → なし`;
      }
      icon = 'recurrence';
      iconColor = 'info';
      break;

    case 'reminder_changed':
      actionLabel = '通知を変更';
      if (activity.new_value) {
        detail = activity.new_value;
      } else if (activity.old_value) {
        detail = `${activity.old_value} → なし`;
      }
      icon = 'reminder';
      iconColor = 'info';
      break;

    case 'deleted':
      actionLabel = 'プランを削除';
      icon = 'delete';
      iconColor = 'destructive';
      break;

    default:
      actionLabel = '変更';
      icon = 'update';
      iconColor = 'info';
  }

  return {
    ...activity,
    actionLabel,
    detail,
    icon,
    iconColor,
  };
}

// formatRelativeTimeはformatters.tsにあるのでそちらを使う
export { formatRelativeTime } from './formatters';
