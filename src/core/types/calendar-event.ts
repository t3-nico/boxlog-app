// Core calendar event type - extracted from features/calendar/types/calendar.types.ts
// This is the canonical definition; feature-level modules re-export from here.

import type { EntryOrigin, FulfillmentScore } from '@/core/types/entry';
import type { EntryState } from '@/lib/entry-status';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | undefined;
  startDate: Date | null;
  endDate: Date | null;
  status: 'open' | 'closed';
  color: string;
  /** @deprecated entries統合後は不要 */
  plan_number?: number | null | undefined;
  /** @deprecated entries統合後は reviewed_at を使用 */
  completed_at?: string | null | undefined;
  reminder_minutes?: number | null | undefined; // 通知タイミング（開始時刻の何分前か）
  /** タグID。1エントリ1タグ。タグの詳細情報はtags.listキャッシュから取得する。 */
  tagId?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  // Display-specific properties
  displayStartDate: Date;
  displayEndDate: Date;
  duration: number; // minutes
  isMultiDay: boolean;
  isRecurring: boolean;
  // === Entry 統合フィールド ===
  /** エントリの起源（planned=予定, unplanned=記録） */
  origin?: EntryOrigin | undefined;
  /** 時間位置ベースの状態（upcoming/active/past） */
  entryState?: EntryState | undefined;
  /** 充実度スコア（1-3） */
  fulfillmentScore?: FulfillmentScore | null | undefined;
  // Optional properties used in various contexts
  type?: 'event' | 'plan' | 'task' | 'record' | undefined; // UX用: plan=予定, record=記録
  userId?: string | undefined; // 所有者ID
  location?: string | undefined; // 場所
  url?: string | undefined; // 関連URL
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional' | undefined; // 優先度
  calendarId?: string | undefined; // カレンダーID（繰り返しの場合は親エントリID）
  // 繰り返し例外情報
  isException?: boolean | undefined; // 例外インスタンスかどうか
  exceptionType?: 'modified' | 'cancelled' | 'moved' | undefined; // 例外タイプ
  originalPlanId?: string | undefined; // 繰り返しインスタンスの親エントリID
  instanceDate?: string | undefined; // インスタンス日付（YYYY-MM-DD）
  /** @deprecated entries統合後はidを直接使用 */
  recordId?: string | undefined;
  /** @deprecated entries統合後は不要 */
  linkedPlanId?: string | undefined;
  /** @deprecated entries統合後は不要 */
  linkedPlanTitle?: string | undefined;
  // ドラフト状態（未保存のプレビュー）
  isDraft?: boolean | undefined;
}

/** 後方互換性エイリアス */
export type CalendarPlan = CalendarEvent;
