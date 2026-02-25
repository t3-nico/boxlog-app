import type { CalendarEvent as CalendarPlan } from '@/core/types/calendar-event';

export type { CalendarEvent } from '@/core/types/calendar-event';
export type { CalendarPlan };

export type MultiDayCount = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type MultiDayViewType = `${MultiDayCount}day`;
export type CalendarViewType = 'day' | 'week' | 'agenda' | 'timesheet' | MultiDayViewType;

/** MultiDayView（2day〜9day）かどうかを判定 */
export function isMultiDayView(view: CalendarViewType): view is MultiDayViewType {
  return /^\d+day$/.test(view) && view !== 'day';
}

/** MultiDayViewType から日数を取得 */
export function getMultiDayCount(view: MultiDayViewType): MultiDayCount {
  return parseInt(view) as MultiDayCount;
}

export interface CalendarViewProps {
  className?: string;
}

export interface ViewDateRange {
  start: Date;
  end: Date;
  days: Date[];
}

export interface CalendarHeaderProps {
  viewType: CalendarViewType;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: CalendarViewType) => void;
}

export interface ViewSelectorProps {
  value: CalendarViewType;
  onChange: (view: CalendarViewType) => void;
}

// 後方互換性のためのエイリアス
export type CalendarTicket = CalendarPlan;
// ========================================
// 新しいDB設計に対応した型定義
// ========================================

// カレンダー管理
export interface Calendar {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  isVisible: boolean;
  provider?: 'local' | 'google' | 'outlook' | 'ical';
  externalId?: string;
  syncToken?: string;
  lastSyncedAt?: Date;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 繰り返しパターン
export interface RecurrencePattern {
  id: string;
  planId: string; // planId/eventId から変更
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  weekdays?: number[]; // 0=日曜, 1=月曜, ..., 6=土曜
  monthlyType?: 'day_of_month' | 'day_of_week';
  dayOfMonth?: number;
  weekOfMonth?: number; // 1-5, 5=最終週
  endType: 'never' | 'after_occurrences' | 'on_date';
  occurrences?: number;
  endDate?: Date;
  excludedDates?: Date[];
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// プランインスタンス（繰り返しプランの個別オカレンス）
export interface PlanInstance {
  id: string;
  planId: string; // planId/eventId から変更
  recurrencePatternId?: string;
  instanceStart: Date;
  instanceEnd: Date;
  exceptionType?: 'modified' | 'cancelled' | 'moved';
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 後方互換性のためのエイリアス
export type TicketInstance = PlanInstance;
export type EventInstance = PlanInstance;

// カレンダー共有
export interface CalendarShare {
  id: string;
  calendarId: string;
  sharedWithUserId?: string;
  sharedWithEmail?: string;
  permission: 'view' | 'edit' | 'admin';
  shareToken?: string;
  isPublicLink: boolean;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

/**
 * カレンダービュー状態
 * ユーザーごとのカレンダー表示設定を保持
 */
export interface CalendarViewState {
  id: string;
  userId: string;
  /** デフォルトで表示するビュータイプ */
  defaultView: CalendarViewType;
  /** 表示するカレンダーのID配列 */
  selectedCalendars: string[];
  /** タグフィルター（指定タグを持つプランのみ表示） */
  filterTags?: string[];
  /** 優先度フィルター */
  filterPriority?: string[];
  /** ステータスフィルター */
  filterStatus?: string[];
  /** 週末（土日）を表示するか */
  showWeekends: boolean;
  /** 週番号を表示するか */
  showWeekNumbers: boolean;
  /** 週の開始曜日（0=日曜, 1=月曜, ..., 6=土曜） */
  firstDayOfWeek: number;
  /** 時刻表示形式 */
  timeFormat: '12h' | '24h';
  createdAt: Date;
  updatedAt: Date;
}

// APIリクエスト用の型
export interface CreateCalendarInput {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
}

export interface UpdateCalendarInput {
  name?: string;
  description?: string;
  color?: string;
  isVisible?: boolean;
}

export interface CreatePlanInput {
  title: string;
  description?: string;
  calendarId?: string;
  plannedStart?: Date;
  plannedEnd?: Date;
  status?: 'todo' | 'doing' | 'closed';
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional';
  color?: string;
  location?: string;
  url?: string;
  reminderMinutes?: number;
  timezone?: string;
  visibility?: 'private' | 'public' | 'team';
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
  tags?: string[];
  items?: Array<{
    text: string;
    completed?: boolean;
    duration?: number;
  }>;
  recurrence?: Omit<RecurrencePattern, 'id' | 'planId' | 'createdAt' | 'updatedAt'>;
}

// 後方互換性のためのエイリアス
export type CreateTicketInput = CreatePlanInput;
export type CreateEventInput = CreatePlanInput;

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  id: string;
}

// 後方互換性のためのエイリアス
export type UpdateTicketInput = UpdatePlanInput;
export type UpdateEventInput = UpdatePlanInput;

export interface CalendarShareInput {
  calendarId: string;
  sharedWithEmail?: string;
  sharedWithUserId?: string;
  permission: 'view' | 'edit' | 'admin';
  expiresAt?: Date;
}

// フィルター条件
export interface CalendarFilter {
  calendarIds?: string[];
  startDate: Date;
  endDate: Date;
  status?: string[];
  priority?: string[];
  tags?: string[];
  includeRecurring?: boolean;
  includeAllDay?: boolean;
}
