/**
 * アクティビティトラッキング用ユーティリティ
 * エントリの変更を検出して、適切なアクティビティを記録する
 */

import type { EntryActivityActionType } from '@/schemas/entries/activity';
import type { ActivityActionType } from '@/schemas/plans/activity';
import type { SupabaseClient } from '@supabase/supabase-js';

interface ChangeRecord {
  field_name: string;
  old_value: string;
  new_value: string;
  action_type: EntryActivityActionType;
}

/** データの動的フィールド型 */
type DataRecord = Record<string, string | number | boolean | null | undefined>;

/**
 * エントリの変更を検出してアクティビティを作成
 */
export async function trackEntryChanges(
  supabase: SupabaseClient,
  entryId: string,
  userId: string,
  oldData: DataRecord,
  newData: DataRecord,
) {
  const changes = detectChanges(oldData, newData);

  if (changes.length > 0) {
    await supabase.from('entry_activities').insert(
      changes.map((change) => ({
        entry_id: entryId,
        user_id: userId,
        action_type: change.action_type,
        field_name: change.field_name,
        old_value: change.old_value,
        new_value: change.new_value,
      })),
    );
  }
}

/**
 * @deprecated trackEntryChanges を使用
 */
export async function trackPlanChanges(
  supabase: SupabaseClient,
  planId: string,
  userId: string,
  oldData: DataRecord,
  newData: DataRecord,
) {
  const changes = detectChanges(oldData, newData) as Array<{
    field_name: string;
    old_value: string;
    new_value: string;
    action_type: ActivityActionType;
  }>;

  if (changes.length > 0) {
    await supabase.from('plan_activities').insert(
      changes.map((change) => ({
        plan_id: planId,
        user_id: userId,
        action_type: change.action_type,
        field_name: change.field_name,
        old_value: change.old_value,
        new_value: change.new_value,
      })),
    );
  }
}

/**
 * 変更を検出してアクティビティ種別を決定
 */
function detectChanges(oldData: DataRecord, newData: DataRecord): ChangeRecord[] {
  const changes: ChangeRecord[] = [];

  // タイトル変更
  if (oldData.title !== newData.title) {
    changes.push({
      field_name: 'title',
      old_value: String(oldData.title ?? ''),
      new_value: String(newData.title ?? ''),
      action_type: 'title_changed',
    });
  }

  // 説明変更
  if (oldData.description !== newData.description) {
    changes.push({
      field_name: 'description',
      old_value: String(oldData.description ?? ''),
      new_value: String(newData.description ?? ''),
      action_type: 'description_changed',
    });
  }

  // 開始・終了時刻変更
  if (oldData.start_time !== newData.start_time || oldData.end_time !== newData.end_time) {
    changes.push({
      field_name: 'time',
      old_value: `${String(oldData.start_time ?? '')} - ${String(oldData.end_time ?? '')}`,
      new_value: `${String(newData.start_time ?? '')} - ${String(newData.end_time ?? '')}`,
      action_type: 'time_changed',
    });
  }

  // 充実度変更
  if (oldData.fulfillment_score !== newData.fulfillment_score) {
    changes.push({
      field_name: 'fulfillment_score',
      old_value: oldData.fulfillment_score != null ? String(oldData.fulfillment_score) : '',
      new_value: newData.fulfillment_score != null ? String(newData.fulfillment_score) : '',
      action_type: 'fulfillment_changed',
    });
  }

  // 繰り返し設定変更
  if (oldData.recurrence_type !== newData.recurrence_type) {
    changes.push({
      field_name: 'recurrence',
      old_value: String(oldData.recurrence_type ?? ''),
      new_value: String(newData.recurrence_type ?? ''),
      action_type: 'recurrence_changed',
    });
  }

  // 通知設定変更
  if (oldData.reminder_minutes !== newData.reminder_minutes) {
    changes.push({
      field_name: 'reminder',
      old_value: oldData.reminder_minutes != null ? String(oldData.reminder_minutes) : '',
      new_value: newData.reminder_minutes != null ? String(newData.reminder_minutes) : '',
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
