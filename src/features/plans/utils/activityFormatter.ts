import { createActivityFormatter, detailHelpers, formatTimeRange } from '@/lib/activity-formatter';
import type { ActivityActionType } from '@/schemas/plans/activity';

import type { PlanActivity, PlanActivityDisplay } from '../types/activity';

/**
 * Plan アクティビティフォーマッター
 *
 * 共有ファクトリを使い、Plan固有のアクションタイプ → 表示情報を定義。
 * i18nキーは plan.activity.* を使用。
 */

/** ステータスラベルマッピング（detail表示用） */
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
};

function statusTransitionDetail(
  oldValue: string | null,
  newValue: string | null,
): string | undefined {
  const oldLabel = oldValue ? (STATUS_LABELS[oldValue] ?? oldValue) : '';
  const newLabel = newValue ? (STATUS_LABELS[newValue] ?? newValue) : '';
  if (oldLabel && newLabel) return `${oldLabel} → ${newLabel}`;
  return undefined;
}

function timeChangeDetail(oldValue: string | null, newValue: string | null): string | undefined {
  if (oldValue && newValue) {
    return `${formatTimeRange(oldValue)} → ${formatTimeRange(newValue)}`;
  }
  return undefined;
}

const planFormatter = createActivityFormatter<ActivityActionType>({
  visibleTypes: new Set<ActivityActionType>([
    'created',
    'status_changed',
    'title_changed',
    'time_changed',
    'tag_added',
    'tag_removed',
    'recurrence_changed',
    'reminder_changed',
  ]),
  config: {
    created: { labelKey: 'plan.activity.created', icon: 'create', iconColor: 'success' },
    updated: { labelKey: 'plan.activity.updated', icon: 'time', iconColor: 'info' },
    status_changed: {
      labelKey: 'plan.activity.statusChanged',
      icon: 'status',
      iconColor: 'info',
      formatDetail: statusTransitionDetail,
    },
    title_changed: {
      labelKey: 'plan.activity.titleChanged',
      icon: 'time',
      iconColor: 'info',
      formatDetail: detailHelpers.transition,
    },
    description_changed: {
      labelKey: 'plan.activity.descriptionChanged',
      icon: 'time',
      iconColor: 'info',
    },
    time_changed: {
      labelKey: 'plan.activity.timeChanged',
      icon: 'time',
      iconColor: 'info',
      formatDetail: timeChangeDetail,
    },
    tag_added: {
      labelKey: 'plan.activity.tagAdded',
      icon: 'tag',
      iconColor: 'primary',
      formatDetail: detailHelpers.newValue,
    },
    tag_removed: {
      labelKey: 'plan.activity.tagRemoved',
      icon: 'tag',
      iconColor: 'destructive',
      formatDetail: detailHelpers.oldValue,
    },
    recurrence_changed: {
      labelKey: 'plan.activity.recurrenceChanged',
      icon: 'time',
      iconColor: 'info',
      formatDetail: detailHelpers.removed,
    },
    reminder_changed: {
      labelKey: 'plan.activity.reminderChanged',
      icon: 'time',
      iconColor: 'info',
      formatDetail: detailHelpers.removed,
    },
    deleted: { labelKey: 'plan.activity.deleted', icon: 'delete', iconColor: 'destructive' },
  },
  defaultConfig: { labelKey: 'plan.activity.changed', icon: 'time', iconColor: 'info' },
});

export const isVisibleActivity = planFormatter.isVisible;
export const filterVisibleActivities = planFormatter.filterVisible;

/**
 * Plan アクティビティを表示用フォーマットに変換
 *
 * status_changed の iconColor は new_value に依存するため、動的に上書き。
 */
export function formatActivity(activity: PlanActivity): PlanActivityDisplay {
  const formatted = planFormatter.format(activity);

  const iconColor =
    activity.action_type === 'status_changed'
      ? activity.new_value === 'closed'
        ? 'success'
        : 'warning'
      : formatted.iconColor;

  return {
    ...activity,
    actionLabelKey: formatted.actionLabelKey,
    detail: formatted.detail,
    icon: formatted.icon as PlanActivityDisplay['icon'],
    iconColor,
  };
}
