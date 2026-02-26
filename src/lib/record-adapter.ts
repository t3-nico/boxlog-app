/**
 * Record → CalendarEvent 変換アダプター
 *
 * RecordデータをCalendarEvent（コア型）に変換して、
 * composition層（カレンダー等）に提供する。
 */

import type { CalendarEvent } from '@/core/types/calendar-event';

/**
 * Record + Plan情報の型
 * records.list から返される形式に合わせる
 */
export interface RecordWithPlanInfo {
  id: string;
  plan_id: string | null; // Planなしでも作成可能
  title?: string | null; // マイグレーション適用前はoptional
  worked_at: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS or HH:MM
  end_time: string | null; // HH:MM:SS or HH:MM
  duration_minutes: number;
  fulfillment_score: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  tagIds?: string[]; // Recordに紐づくタグID
  plan?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

/**
 * RecordをCalendarEvent型に変換
 * Records はカレンダー上で視覚的に区別される（type: 'record'）
 */
export function recordToCalendarEvent(record: RecordWithPlanInfo): CalendarEvent | null {
  // start_time/end_time がない場合はカレンダー表示をスキップ
  if (!record.start_time || !record.end_time) {
    return null;
  }

  // worked_at (YYYY-MM-DD) と start_time/end_time (HH:MM:SS) を組み合わせて Date を作成
  const parseTime = (dateStr: string, timeStr: string): Date => {
    // timeStrが HH:MM 形式の場合は :00 を追加
    const normalizedTime =
      timeStr.includes(':') && timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
    return new Date(`${dateStr}T${normalizedTime}`);
  };

  const startDate = parseTime(record.worked_at, record.start_time);
  const endDate = parseTime(record.worked_at, record.end_time);
  const createdAt = new Date(record.created_at);
  const updatedAt = new Date(record.updated_at);

  return {
    id: `record-${record.id}`, // PlanのIDと区別するためにプレフィックスを付ける
    title: record.title ?? record.plan?.title ?? '', // 空の場合はUI側で「(タイトルなし)」を表示
    description: record.description ?? undefined,
    startDate,
    endDate,
    status: 'closed', // Records は完了済みの作業ログなので常に closed
    color: '', // デフォルト色（タグ色はTagsContainerで表示）
    tagIds: record.tagIds ?? [], // タグIDを引き継ぐ（Planと同様に表示）
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: record.duration_minutes,
    isMultiDay: false,
    isRecurring: false,
    // Record固有フィールド
    type: 'record',
    recordId: record.id,
    fulfillmentScore: record.fulfillment_score,
    linkedPlanId: record.plan_id ?? undefined,
    linkedPlanTitle: record.plan?.title,
  };
}

/**
 * 複数のRecordをCalendarEvent型に変換
 * start_time/end_time がないRecordはスキップされる
 */
export function recordsToCalendarEvents(records: RecordWithPlanInfo[]): CalendarEvent[] {
  return records
    .map(recordToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
}
