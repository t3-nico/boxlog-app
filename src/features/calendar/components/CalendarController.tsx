'use client';

/**
 * CalendarController - Pure View Component
 *
 * 全データ・コールバックをpropsで受け取り、カレンダーUIをレンダリングする。
 * @/features/* からのimportは一切なし。cross-feature依存はcomposition layerが管理。
 *
 * @see _composition/useCalendarComposition.ts
 */

import { useMemo } from 'react';

import { useCalendarContextMenu } from '../hooks/useCalendarContextMenu';
import { useCalendarKeyboard } from '../hooks/useCalendarKeyboard';
import { useEmptyAreaContextMenu } from '../hooks/useEmptyAreaContextMenu';
import { DnDProvider } from '../providers/DnDProvider';

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '../types/calendar.types';

import { CalendarViewRenderer } from './controller/components';
import { initializePreload } from './controller/utils';

import { CalendarLayout } from './layout/CalendarLayout';
import { EmptyAreaContextMenu, EventContextMenu, MobileTouchHint } from './views/shared/components';

// 初回ロード時にビューをプリロード
initializePreload();

// =============================================================================
// Types
// =============================================================================

export interface CalendarControllerProps {
  /** ビュータイプ（day, week, 3day, etc.） */
  viewType: CalendarViewType;
  /** 現在の表示日付 */
  currentDate: Date;

  // --- Data ---
  /** ビュー期間 */
  viewDateRange: ViewDateRange;
  /** フィルタ適用後のイベント */
  filteredEvents: CalendarPlan[];
  /** 全イベント（未フィルタ） */
  allCalendarPlans: CalendarPlan[];

  // --- Settings ---
  /** 週末表示 */
  showWeekends: boolean;

  // --- Plan state ---
  /** DnD無効化プランID */
  disabledPlanId: string | null;

  // --- Aside ---
  /** アサイド種別（CalendarLayout互換型） */
  currentAside?: 'none' | 'plan' | 'record' | 'chat' | 'reflection';
  /** アサイド変更 */
  onAsideChange?: (aside: 'none' | 'plan' | 'record' | 'chat' | 'reflection') => void;

  // --- Plan click handlers ---
  onPlanClick: (plan: CalendarPlan) => void;
  onCreatePlan: (date?: Date, time?: string) => void;
  onEmptyClick: (date: Date, time: string) => void;
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
  onCompletePlan: (plan: CalendarPlan) => void;
  onCompleteWithRecord: (plan: CalendarPlan) => void;

  // --- Navigation handlers ---
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (newView: CalendarViewType) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onToggleWeekends: () => void;
  onDateSelect: (date: Date) => void;

  // --- Layout ---
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function CalendarController({
  viewType,
  currentDate,
  viewDateRange,
  filteredEvents,
  allCalendarPlans,
  showWeekends,
  disabledPlanId,
  currentAside,
  onAsideChange,
  onPlanClick,
  onCreatePlan,
  onEmptyClick,
  onTimeRangeSelect,
  onUpdatePlan,
  onDeletePlan,
  onRestorePlan,
  onEditPlan,
  onDeletePlanConfirm,
  onDuplicatePlan,
  onCopyPlan,
  onCompletePlan,
  onCompleteWithRecord,
  onNavigate,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onToggleWeekends,
  onDateSelect,
  className,
}: CalendarControllerProps) {
  // =========================================================================
  // Calendar-internal hooks only（zero @/features/* imports）
  // =========================================================================

  // コンテキストメニュー管理
  const { contextMenuEvent, contextMenuPosition, handleEventContextMenu, handleCloseContextMenu } =
    useCalendarContextMenu();

  // 空きエリアコンテキストメニュー管理
  const {
    emptyAreaMenuPosition,
    clickedDateTime,
    handleEmptyAreaContextMenu,
    handleCloseEmptyAreaContextMenu,
  } = useEmptyAreaContextMenu();

  // キーボードショートカット（ビューナビゲーション用、cross-feature依存なし）
  useCalendarKeyboard({
    viewType,
    onNavigate,
    onViewChange,
    onToggleWeekends,
  });

  // =========================================================================
  // View props（memo化）
  // =========================================================================
  const commonProps = useMemo(
    () => ({
      dateRange: viewDateRange,
      plans: filteredEvents,
      allPlans: allCalendarPlans,
      currentDate,
      showWeekends,
      disabledPlanId,
      onPlanClick,
      onPlanContextMenu: handleEventContextMenu,
      onCreatePlan,
      onUpdatePlan,
      onDeletePlan,
      onRestorePlan,
      onEmptyClick,
      onEmptyAreaContextMenu: handleEmptyAreaContextMenu,
      onTimeRangeSelect,
      onViewChange,
      onNavigatePrev,
      onNavigateNext,
      onNavigateToday,
    }),
    [
      viewDateRange,
      filteredEvents,
      allCalendarPlans,
      currentDate,
      showWeekends,
      disabledPlanId,
      onPlanClick,
      handleEventContextMenu,
      onCreatePlan,
      onUpdatePlan,
      onDeletePlan,
      onRestorePlan,
      onEmptyClick,
      handleEmptyAreaContextMenu,
      onTimeRangeSelect,
      onViewChange,
      onNavigatePrev,
      onNavigateNext,
      onNavigateToday,
    ],
  );

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <DnDProvider>
      <CalendarLayout
        className={className}
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
        showHeaderActions={false}
        onDateSelect={onDateSelect}
        displayRange={{
          start: viewDateRange.start,
          end: viewDateRange.end,
        }}
        currentAside={currentAside}
        onAsideChange={onAsideChange}
      >
        <CalendarViewRenderer viewType={viewType} commonProps={commonProps} />
      </CalendarLayout>

      {contextMenuEvent && contextMenuPosition ? (
        <EventContextMenu
          plan={contextMenuEvent}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
          onEdit={onEditPlan}
          onDelete={onDeletePlanConfirm}
          onDuplicate={onDuplicatePlan}
          onCopy={onCopyPlan}
          onComplete={onCompletePlan}
          onCompleteWithRecord={onCompleteWithRecord}
        />
      ) : null}

      {emptyAreaMenuPosition && clickedDateTime ? (
        <EmptyAreaContextMenu
          position={emptyAreaMenuPosition}
          clickedDateTime={clickedDateTime}
          onClose={handleCloseEmptyAreaContextMenu}
        />
      ) : null}

      {/* モバイル操作ヒント（初回のみ表示） */}
      <MobileTouchHint />
    </DnDProvider>
  );
}
