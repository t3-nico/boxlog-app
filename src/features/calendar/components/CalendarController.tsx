'use client';

/**
 * CalendarController - Calendar View Shell
 *
 * CalendarContext（useCalendar）からデータ・コールバックを取得し、
 * キーボードショートカット・コンテキストメニュー・DnDを設定してUIをレンダリングする。
 *
 * @see contexts/CalendarContext.tsx
 * @see _composition/useCalendarComposition.ts
 */

import { useMemo } from 'react';

import { useCalendar } from '../contexts/CalendarContext';
import { useCalendarContextMenu } from '../hooks/useCalendarContextMenu';
import { useCalendarKeyboard } from '../hooks/useCalendarKeyboard';
import { useEmptyAreaContextMenu } from '../hooks/useEmptyAreaContextMenu';
import { DnDProvider } from '../providers/DnDProvider';

import { CalendarViewRenderer } from './controller/components';
import { initializePreload } from './controller/utils';

import { CalendarLayout } from './layout/CalendarLayout';
import { EmptyAreaContextMenu, EventContextMenu, MobileTouchHint } from './views/shared/components';

// 初回ロード時にビューをプリロード
initializePreload();

// =============================================================================
// Component
// =============================================================================

export function CalendarController({ className }: { className?: string } = {}) {
  // =========================================================================
  // Context（全データ・コールバックを取得）
  // =========================================================================
  const {
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
    onNavigate,
    onViewChange,
    onNavigatePrev,
    onNavigateNext,
    onNavigateToday,
    onToggleWeekends,
    onDateSelect,
  } = useCalendar();

  // =========================================================================
  // Calendar-internal hooks
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

  // キーボードショートカット（ビューナビゲーション用）
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
