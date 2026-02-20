import { createActivityFormatter, detailHelpers } from '@/lib/activity-formatter';
import type { ActivityActionType } from '@/schemas/records/activity';

import type { RecordActivity, RecordActivityDisplay } from '../types/activity';

/**
 * Record アクティビティフォーマッター
 *
 * 共有ファクトリを使い、Record固有のアクションタイプ → 表示情報を定義。
 * i18nキーは record.activity.* を使用。
 */

const recordFormatter = createActivityFormatter<ActivityActionType>({
  visibleTypes: new Set<ActivityActionType>([
    'created',
    'time_changed',
    'title_changed',
    'memo_changed',
    'fulfillment_changed',
    'tag_added',
    'tag_removed',
  ]),
  config: {
    created: { labelKey: 'record.activity.created', icon: 'create', iconColor: 'success' },
    updated: { labelKey: 'record.activity.updated', icon: 'time', iconColor: 'info' },
    time_changed: {
      labelKey: 'record.activity.timeChanged',
      icon: 'time',
      iconColor: 'info',
      formatDetail: detailHelpers.transition,
    },
    title_changed: {
      labelKey: 'record.activity.titleChanged',
      icon: 'time',
      iconColor: 'info',
      formatDetail: detailHelpers.transition,
    },
    memo_changed: {
      labelKey: 'record.activity.memoChanged',
      icon: 'time',
      iconColor: 'info',
    },
    fulfillment_changed: {
      labelKey: 'record.activity.fulfillmentChanged',
      icon: 'fulfillment',
      iconColor: 'warning',
      formatDetail: detailHelpers.transition,
    },
    tag_added: {
      labelKey: 'record.activity.tagAdded',
      icon: 'tag',
      iconColor: 'primary',
      formatDetail: detailHelpers.newValue,
    },
    tag_removed: {
      labelKey: 'record.activity.tagRemoved',
      icon: 'tag',
      iconColor: 'destructive',
      formatDetail: detailHelpers.oldValue,
    },
    deleted: { labelKey: 'record.activity.deleted', icon: 'delete', iconColor: 'destructive' },
  },
  defaultConfig: { labelKey: 'record.activity.changed', icon: 'time', iconColor: 'info' },
});

export const isVisibleActivity = recordFormatter.isVisible;
export const filterVisibleActivities = recordFormatter.filterVisible;

export function formatActivity(activity: RecordActivity): RecordActivityDisplay {
  const formatted = recordFormatter.format(activity);
  return {
    ...activity,
    actionLabelKey: formatted.actionLabelKey,
    detail: formatted.detail,
    icon: formatted.icon as RecordActivityDisplay['icon'],
    iconColor: formatted.iconColor,
  };
}
