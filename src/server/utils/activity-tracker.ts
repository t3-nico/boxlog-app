/**
 * アクティビティトラッキング用ユーティリティ
 * プランの変更を検出して、適切なアクティビティを記録する
 */

import type { ActivityActionType } from '@/schemas/plans/activity';
import type { SupabaseClient } from '@supabase/supabase-js';

interface PlanChanges {
  field_name: string;
  old_value: string;
  new_value: string;
  action_type: ActivityActionType;
}

/**
 * プランの変更を検出してアクティビティを作成
 */
export async function trackPlanChanges(
  supabase: SupabaseClient,
  planId: string,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 動的なプランデータ
  oldData: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 動的なプランデータ
  newData: Record<string, any>,
) {
  const changes = detectChanges(oldData, newData);

  // 各変更に対してアクティビティを記録
  for (const change of changes) {
    await supabase.from('plan_activities').insert({
      plan_id: planId,
      user_id: userId,
      action_type: change.action_type,
      field_name: change.field_name,
      old_value: change.old_value,
      new_value: change.new_value,
    });
  }
}

/**
 * 変更を検出してアクティビティ種別を決定
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 動的なプランデータ
function detectChanges(oldData: Record<string, any>, newData: Record<string, any>): PlanChanges[] {
  const changes: PlanChanges[] = [];

  // ステータス変更
  if (oldData.status !== newData.status) {
    changes.push({
      field_name: 'status',
      old_value: oldData.status || '',
      new_value: newData.status || '',
      action_type: 'status_changed',
    });
  }

  // タイトル変更
  if (oldData.title !== newData.title) {
    changes.push({
      field_name: 'title',
      old_value: oldData.title || '',
      new_value: newData.title || '',
      action_type: 'title_changed',
    });
  }

  // 説明変更
  if (oldData.description !== newData.description) {
    changes.push({
      field_name: 'description',
      old_value: oldData.description || '',
      new_value: newData.description || '',
      action_type: 'description_changed',
    });
  }

  // 開始・終了時刻変更
  if (oldData.start_time !== newData.start_time || oldData.end_time !== newData.end_time) {
    changes.push({
      field_name: 'time',
      old_value: `${oldData.start_time || ''} - ${oldData.end_time || ''}`,
      new_value: `${newData.start_time || ''} - ${newData.end_time || ''}`,
      action_type: 'time_changed',
    });
  }

  // 繰り返し設定変更
  if (oldData.recurrence_type !== newData.recurrence_type) {
    const recurrenceLabels: Record<string, string> = {
      none: 'なし',
      daily: '毎日',
      weekly: '毎週',
      monthly: '毎月',
      yearly: '毎年',
      weekdays: '平日',
    };
    changes.push({
      field_name: 'recurrence',
      old_value: recurrenceLabels[oldData.recurrence_type] || oldData.recurrence_type || '',
      new_value: recurrenceLabels[newData.recurrence_type] || newData.recurrence_type || '',
      action_type: 'recurrence_changed',
    });
  }

  // 通知設定変更
  if (oldData.reminder_minutes !== newData.reminder_minutes) {
    const formatReminder = (minutes: number | null | undefined): string => {
      if (minutes === null || minutes === undefined) return 'なし';
      if (minutes === 0) return '開始時';
      if (minutes < 60) return `${minutes}分前`;
      if (minutes < 1440) return `${minutes / 60}時間前`;
      return `${minutes / 1440}日前`;
    };
    changes.push({
      field_name: 'reminder',
      old_value: formatReminder(oldData.reminder_minutes),
      new_value: formatReminder(newData.reminder_minutes),
      action_type: 'reminder_changed',
    });
  }

  // 変更がない場合は汎用の「更新」アクティビティを記録
  if (changes.length === 0) {
    changes.push({
      field_name: '',
      old_value: '',
      new_value: '',
      action_type: 'updated',
    });
  }

  return changes;
}
