// Core calendar event type - extracted from features/calendar/types/calendar.types.ts
// This is the canonical definition; feature-level modules re-export from here.

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | undefined;
  startDate: Date | null;
  endDate: Date | null;
  status: 'open' | 'closed';
  color: string;
  plan_number?: number | null | undefined; // プラン番号
  completed_at?: string | null | undefined; // 完了日時
  reminder_minutes?: number | null | undefined; // 通知タイミング（開始時刻の何分前か）
  /** タグIDリスト。タグの詳細情報はtags.listキャッシュから取得する。 */
  tagIds?: string[] | undefined;
  createdAt: Date;
  updatedAt: Date;
  // Display-specific properties
  displayStartDate: Date;
  displayEndDate: Date;
  duration: number; // minutes
  isMultiDay: boolean;
  isRecurring: boolean;
  // Optional properties used in various contexts
  type?: 'event' | 'plan' | 'task' | 'record' | undefined; // エントリの種類
  userId?: string | undefined; // 所有者ID
  location?: string | undefined; // 場所
  url?: string | undefined; // 関連URL
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional' | undefined; // 優先度
  calendarId?: string | undefined; // カレンダーID（繰り返しの場合は親プランID）
  // 繰り返し例外情報
  isException?: boolean | undefined; // 例外インスタンスかどうか
  exceptionType?: 'modified' | 'cancelled' | 'moved' | undefined; // 例外タイプ
  originalPlanId?: string | undefined; // 繰り返しインスタンスの親プランID
  instanceDate?: string | undefined; // インスタンス日付（YYYY-MM-DD）
  // Record固有フィールド（type === 'record' の場合）
  recordId?: string | undefined; // RecordのID
  fulfillmentScore?: number | null | undefined; // 充実度（1-5）
  linkedPlanId?: string | undefined; // 紐づくPlanのID
  linkedPlanTitle?: string | undefined; // 紐づくPlanのタイトル
  // ドラフト状態（未保存のプレビュー）
  isDraft?: boolean | undefined;
}

/** 後方互換性エイリアス */
export type CalendarPlan = CalendarEvent;
