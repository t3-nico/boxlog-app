/**
 * ベースビュー型定義
 * 全カレンダービューで共通するプロパティ
 */

// CalendarPlan, ViewDateRange を Source of Truth から直接エクスポート
export type { CalendarPlan, ViewDateRange } from '@/features/calendar/types/calendar.types';
import type { CalendarPlan, ViewDateRange } from '@/features/calendar/types/calendar.types';

export type CalendarViewType = 'day' | '3day' | '5day' | 'week' | 'agenda';

/**
 * 全ビューで共通する最小限のプロパティ
 * AgendaViewなどリスト表示ビュー向け
 */
export interface BaseViewProps {
  // Core data
  plans: CalendarPlan[];
  currentDate: Date;

  // Display options
  className?: string | undefined;

  // Plan handlers（最小限）
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined;
}

/**
 * 時間グリッドビュー用の拡張プロパティ
 * DayView, ThreeDayView, FiveDayView, WeekView向け
 */
export interface GridViewProps extends BaseViewProps {
  // Core data
  dateRange: ViewDateRange;
  /** 全プラン（期限切れ未完了表示用、日付フィルタリング前） */
  allPlans?: CalendarPlan[] | undefined;

  // Display options
  showWeekends?: boolean | undefined;

  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined;

  // Plan handlers（グリッド操作用）
  onCreatePlan?: ((date: Date, time?: string) => void) | undefined;
  onUpdatePlan?:
    | ((
        planIdOrPlan: string | CalendarPlan,
        updates?: { startTime: Date; endTime: Date },
      ) => void | Promise<void> | Promise<{ skipToast: true } | void>)
    | undefined;
  onDeletePlan?: ((planId: string) => void) | undefined;
  onRestorePlan?: ((plan: CalendarPlan) => Promise<void>) | undefined;
  onEmptyClick?: ((date: Date, time: string) => void) | undefined;
  onTimeRangeSelect?:
    | ((selection: {
        date: Date;
        startHour: number;
        startMinute: number;
        endHour: number;
        endMinute: number;
      }) => void)
    | undefined;

  // Navigation handlers
  onViewChange?: ((viewType: CalendarViewType) => void) | undefined;
  onNavigatePrev?: (() => void) | undefined;
  onNavigateNext?: (() => void) | undefined;
  onNavigateToday?: (() => void) | undefined;
}

/**
 * プラン位置情報の基本型
 * 4箇所で重複していた PlanPosition を統一
 */
export interface BasePlanPosition {
  plan: CalendarPlan;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
  column: number;
  totalColumns: number;
}

/**
 * ビュー設定の基本型
 * 4箇所で重複していた ViewSettings を統一
 */
export interface BaseViewSettings {
  startHour: number;
  endHour: number;
  timeInterval: 15 | 30 | 60;
  showQuarterLines: boolean;
  showCurrentTime: boolean;
  maxPlanColumns: number;
  planMinHeight: number;
}
