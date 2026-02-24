/**
 * Recordアクティビティトラッキング用ユーティリティ
 * Recordの変更を検出して、適切なアクティビティを記録する
 */

import type { ActivityActionType } from '@/schemas/records/activity';
import type { SupabaseClient } from '@supabase/supabase-js';

interface RecordChanges {
  field_name: string;
  old_value: string;
  new_value: string;
  action_type: ActivityActionType;
}

/** Recordの更新可能フィールド（アクティビティ追跡用） */
interface RecordData {
  title?: string | null;
  description?: string | null;
  fulfillment_score?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  worked_at?: string | null;
}

/**
 * Recordの変更を検出してアクティビティを作成
 */
export async function trackRecordChanges(
  supabase: SupabaseClient,
  recordId: string,
  userId: string,
  oldData: RecordData,
  newData: RecordData,
) {
  const changes = detectRecordChanges(oldData, newData);

  // 各変更に対してアクティビティを記録
  for (const change of changes) {
    await supabase.from('record_activities').insert({
      record_id: recordId,
      user_id: userId,
      action_type: change.action_type,
      field_name: change.field_name,
      old_value: change.old_value,
      new_value: change.new_value,
    });
  }
}

/**
 * Record作成時のアクティビティを記録
 */
export async function recordCreatedActivity(
  supabase: SupabaseClient,
  recordId: string,
  userId: string,
) {
  await supabase.from('record_activities').insert({
    record_id: recordId,
    user_id: userId,
    action_type: 'created',
    field_name: null,
    old_value: null,
    new_value: null,
  });
}

/**
 * タグ追加時のアクティビティを記録
 */
export async function recordTagAddedActivity(
  supabase: SupabaseClient,
  recordId: string,
  userId: string,
  tagName: string,
) {
  await supabase.from('record_activities').insert({
    record_id: recordId,
    user_id: userId,
    action_type: 'tag_added',
    field_name: 'tag',
    old_value: null,
    new_value: tagName,
  });
}

/**
 * タグ削除時のアクティビティを記録
 */
export async function recordTagRemovedActivity(
  supabase: SupabaseClient,
  recordId: string,
  userId: string,
  tagName: string,
) {
  await supabase.from('record_activities').insert({
    record_id: recordId,
    user_id: userId,
    action_type: 'tag_removed',
    field_name: 'tag',
    old_value: tagName,
    new_value: null,
  });
}

/**
 * 変更を検出してアクティビティ種別を決定
 */
function detectRecordChanges(oldData: RecordData, newData: RecordData): RecordChanges[] {
  const changes: RecordChanges[] = [];

  // タイトル変更
  if (oldData.title !== newData.title && (oldData.title || newData.title)) {
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

  // 充実度変更
  if (oldData.fulfillment_score !== newData.fulfillment_score) {
    changes.push({
      field_name: 'fulfillment_score',
      old_value: oldData.fulfillment_score?.toString() || '',
      new_value: newData.fulfillment_score?.toString() || '',
      action_type: 'fulfillment_changed',
    });
  }

  // 開始・終了時刻変更
  if (
    oldData.start_time !== newData.start_time ||
    oldData.end_time !== newData.end_time ||
    oldData.worked_at !== newData.worked_at
  ) {
    const formatTime = (
      date: string | null | undefined,
      start: string | null | undefined,
      end: string | null | undefined,
    ): string => {
      const parts: string[] = [];
      if (date) parts.push(date);
      if (start && end) parts.push(`${start.substring(0, 5)} - ${end.substring(0, 5)}`);
      return parts.join(' ');
    };

    changes.push({
      field_name: 'time',
      old_value: formatTime(oldData.worked_at, oldData.start_time, oldData.end_time),
      new_value: formatTime(newData.worked_at, newData.start_time, newData.end_time),
      action_type: 'time_changed',
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
