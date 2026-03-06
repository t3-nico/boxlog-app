'use client';

/**
 * CalendarContext — カレンダー全体のデータ・ハンドラーを提供するContext
 *
 * CalendarNavigationContext（ナビゲーション状態のみ）とは別スコープ。
 * こちらはカレンダービュー内でのみ有効で、全データ・コールバックを提供する。
 *
 * Provider: CalendarViewClient（composition layer）
 * Consumer: CalendarController, 将来的にView components
 */

import { createContext, useContext } from 'react';

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '../types/calendar.types';

// AsideType は stores/useLayoutStore から来るが、features/ からは直接importできない。
// 型だけここで再定義する（string literal union）。
type AsideType = 'none' | 'entries' | 'chat' | 'reflection';

// =============================================================================
// Context Value Type
// =============================================================================

export interface CalendarContextValue {
  /** ビュータイプ（day, week, 3day, etc.） */
  viewType: CalendarViewType;
  /** 現在の表示日付 */
  currentDate: Date;

  // --- Data ---
  viewDateRange: ViewDateRange;
  filteredEvents: CalendarPlan[];
  allCalendarPlans: CalendarPlan[];

  // --- Settings ---
  showWeekends: boolean;

  // --- Plan state ---
  disabledPlanId: string | null;

  // --- Aside ---
  currentAside: AsideType;
  onAsideChange: (aside: AsideType) => void;

  // --- Plan click handlers ---
  onPlanClick: (plan: CalendarPlan) => void;
  onTimeRangeSelect: (selection: {
    date: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  }) => void;

  // --- Plan CRUD ---
  onUpdatePlan: (
    planIdOrPlan: string | CalendarPlan,
    updates?: { startTime: Date; endTime: Date },
  ) => void | Promise<void> | Promise<{ skipToast: true } | void>;
  onDeletePlan: (planId: string) => void;
  onRestorePlan: (plan: CalendarPlan) => Promise<void>;

  // --- Context menu actions ---
  onEditPlan: (plan: CalendarPlan) => void;
  onDeletePlanConfirm: (plan: CalendarPlan) => void;
  onDuplicatePlan: (plan: CalendarPlan) => void;
  onCopyPlan: (plan: CalendarPlan) => void;
  onCompleteWithRecord: (plan: CalendarPlan) => void;

  // --- Navigation handlers ---
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (newView: CalendarViewType) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onToggleWeekends: () => void;
  onDateSelect: (date: Date) => void;
}

// =============================================================================
// Context + Hook
// =============================================================================

const CalendarContext = createContext<CalendarContextValue | null>(null);

/** Context.Provider をそのままexport（composition layerで使用） */
export const CalendarProvider = CalendarContext.Provider;

/** カレンダーデータ・ハンドラーを取得するhook */
export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return ctx;
}
