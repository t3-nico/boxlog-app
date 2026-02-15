'use client';

import React, { useCallback, useEffect, useMemo } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { addHours, format, startOfHour } from 'date-fns';

import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { getCurrentTimezone, setUserTimezone } from '@/features/settings/utils/timezone';
import { logger } from '@/lib/logger';

import { useCalendarNavigation } from '../contexts/CalendarNavigationContext';
import { useCalendarLayout } from '../hooks/ui/useCalendarLayout';
import { useCalendarContextMenu } from '../hooks/useCalendarContextMenu';
import { useCalendarKeyboard } from '../hooks/useCalendarKeyboard';
import { useCalendarPlanKeyboard } from '../hooks/useCalendarPlanKeyboard';
import { useEmptyAreaContextMenu } from '../hooks/useEmptyAreaContextMenu';
import { usePlanContextActions } from '../hooks/usePlanContextActions';
import { usePlanOperations } from '../hooks/usePlanOperations';
import { useRecurringPlanDrag } from '../hooks/useRecurringPlanDrag';
import { useWeekendToggleShortcut } from '../hooks/useWeekendToggleShortcut';
import { DnDProvider } from '../providers/DnDProvider';

import type { CalendarViewProps, CalendarViewType } from '../types/calendar.types';

import { useCalendarPanelStore } from '../stores/useCalendarPanelStore';
import { CalendarViewRenderer } from './controller/components';
import {
  useCalendarData,
  useCalendarHandlers,
  useCalendarNavigationHandlers,
} from './controller/hooks';
import { initializePreload } from './controller/utils';

import { CalendarLayout } from './layout/CalendarLayout';
import { EmptyAreaContextMenu, EventContextMenu, MobileTouchHint } from './views/shared/components';

// 初回ロード時にビューをプリロード
initializePreload();

interface CalendarViewExtendedProps extends CalendarViewProps {
  initialViewType?: CalendarViewType;
  initialDate?: Date | null;
}

export const CalendarController = ({
  className,
  initialViewType = 'day',
  initialDate,
}: CalendarViewExtendedProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const calendarNavigation = useCalendarNavigation();

  // サイドパネル状態（Zustand永続化）
  const currentPanel = useCalendarPanelStore.use.panelType();
  const setCurrentPanel = useCalendarPanelStore.use.setPanel();

  // 現在のlocaleを取得（例: /ja/calendar/day -> ja）
  const locale = pathname?.split('/')[1] || 'ja';

  // Context が利用可能な場合はそれを使用、そうでない場合は useCalendarLayout を使用
  const contextAvailable = calendarNavigation !== null;

  // URLを更新する関数（useCalendarLayoutより前に定義）
  const updateURL = useCallback(
    (newViewType: CalendarViewType, newDate?: Date) => {
      const dateToUse = newDate || new Date();
      const dateString = format(dateToUse, 'yyyy-MM-dd');
      const newURL = `/${locale}/calendar/${newViewType}?date=${dateString}`;
      logger.log('🔗 updateURL called:', { newViewType, dateToUse, newURL });
      router.push(newURL);
    },
    [router, locale],
  );

  // 初期日付をメモ化して参照の安定性を保つ
  const stableInitialDate = useMemo(() => initialDate || new Date(), [initialDate]);

  // カレンダーレイアウト状態管理（Context が利用できない場合のフォールバック）
  const layoutHook = useCalendarLayout({
    initialViewType,
    initialDate: stableInitialDate,
    // コールバックは layoutHook の状態を使用するので、ここでは参照しない
    onViewChange: contextAvailable ? undefined : (view) => updateURL(view),
    onDateChange: contextAvailable ? undefined : (date) => updateURL(initialViewType, date),
  });

  // Context が利用可能な場合はそれを使用、そうでない場合は layoutHook を使用
  const viewType = contextAvailable ? calendarNavigation.viewType : layoutHook.viewType;
  const currentDate = contextAvailable ? calendarNavigation.currentDate : layoutHook.currentDate;
  const navigateRelative = contextAvailable
    ? calendarNavigation.navigateRelative
    : layoutHook.navigateRelative;
  const changeView = contextAvailable ? calendarNavigation.changeView : layoutHook.changeView;
  const navigateToDate = contextAvailable
    ? calendarNavigation.navigateToDate
    : layoutHook.navigateToDate;

  // デバッグ用ログ（初回マウント時のみ）
  const hasLoggedRef = React.useRef(false);
  useEffect(() => {
    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      logger.log('📊 CalendarController mounted:', {
        contextAvailable,
        viewType,
      });
    }
  }, [contextAvailable, viewType]);

  // コンテキストメニュー管理（フック化）
  const { contextMenuEvent, contextMenuPosition, handleEventContextMenu, handleCloseContextMenu } =
    useCalendarContextMenu();

  // 空きエリアコンテキストメニュー管理
  const {
    emptyAreaMenuPosition,
    clickedDateTime,
    handleEmptyAreaContextMenu,
    handleCloseEmptyAreaContextMenu,
  } = useEmptyAreaContextMenu();

  // プランコンテキストアクション
  const {
    handleDeletePlan,
    handleEditPlan,
    handleDuplicatePlan,
    handleCopyPlan,
    handleCompletePlan,
    handleCompleteWithRecord,
  } = usePlanContextActions();

  // プラン操作（CRUD）をフック化
  const { handlePlanDelete: deletePlan, handlePlanRestore } = usePlanOperations();

  // selector化: 必要な値だけ監視（他の設定変更時の再レンダリングを防止）
  const timezone = useCalendarSettingsStore((state) => state.timezone);
  const showWeekends = useCalendarSettingsStore((state) => state.showWeekends);
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

  // 選択中のプランID（削除確認ダイアログ用）
  const selectedPlanId = usePlanInspectorStore((state) => state.planId);

  // キーボードショートカット（Cmd/Ctrl + W）
  useWeekendToggleShortcut();

  // 通知機能の統合
  const {
    permission: notificationPermission,
    hasRequested: hasRequestedNotification,
    requestPermission: requestNotificationPermission,
  } = useNotifications({
    events: [],
    onReminderTriggered: () => {},
  });

  // 🚀 初回ロード時にイベントストアを初期化（マウント時のみ）
  useEffect(() => {
    logger.log('🚀 Initializing EventStore...');
  }, []);

  // 通知許可のリクエスト（初回のみ）
  useEffect(() => {
    if (!hasRequestedNotification && (notificationPermission as string) === 'default') {
      requestNotificationPermission();
    }
  }, [hasRequestedNotification, notificationPermission, requestNotificationPermission]);

  // URLパラメータの日付変更を検知（Context利用時は無効にする）
  useEffect(() => {
    if (!contextAvailable && initialDate && initialDate.getTime() !== currentDate.getTime()) {
      logger.log('🔄 URL date change detected (fallback mode):', { initialDate, currentDate });
      navigateToDate(initialDate);
    }
  }, [contextAvailable, initialDate, currentDate, navigateToDate]);

  // タイムゾーン設定の初期化（マウント時のみ）
  useEffect(() => {
    setUserTimezone(timezone);
    if (timezone === 'Asia/Tokyo') {
      const actualTimezone = getCurrentTimezone();
      if (actualTimezone !== 'Asia/Tokyo') {
        updateSettings({ timezone: actualTimezone });
      }
    }
  }, [timezone, updateSettings]);

  // カレンダーデータ取得（フック化）
  const { viewDateRange, filteredEvents, allCalendarPlans } = useCalendarData({
    viewType,
    currentDate,
  });

  // カレンダーハンドラー（フック化）
  const {
    handlePlanClick,
    handleCreatePlan,
    handleEmptyClick,
    handleDateTimeRangeSelect,
    disabledPlanId,
  } = useCalendarHandlers({
    viewType,
    currentDate,
  });

  // 繰り返しプランのドラッグ処理（Googleカレンダー準拠）
  const { handleUpdatePlan } = useRecurringPlanDrag({
    plans: allCalendarPlans,
  });

  // ナビゲーションハンドラー（フック化）
  const {
    handleNavigate,
    handleViewChange,
    handleNavigatePrev,
    handleNavigateNext,
    handleNavigateToday,
    handleToggleWeekends,
    handleDateSelect,
  } = useCalendarNavigationHandlers({
    viewType,
    currentDate,
    showWeekends,
    navigateRelative,
    navigateToDate,
    changeView,
  });

  // キーボードショートカット
  useCalendarKeyboard({
    viewType,
    onNavigate: handleNavigate,
    onViewChange: handleViewChange,
    onToggleWeekends: handleToggleWeekends,
  });

  // プラン操作キーボードショートカット（Delete/Backspace, C）
  const getInitialPlanData = useCallback(() => {
    const now = new Date();
    const start = startOfHour(now);
    const end = addHours(start, 1);
    return {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    };
  }, []);

  // 選択中のプランタイトルを取得（削除確認ダイアログ用）
  const getSelectedPlanTitle = useCallback(() => {
    if (!selectedPlanId) return null;
    const plan = filteredEvents.find((p) => p.id === selectedPlanId);
    return plan?.title ?? null;
  }, [selectedPlanId, filteredEvents]);

  // 選択中のプランをコピー用の形式で取得
  const getSelectedPlanForCopy = useCallback(() => {
    if (!selectedPlanId) return null;
    const plan = filteredEvents.find((p) => p.id === selectedPlanId);
    if (!plan) return null;

    const startHour = plan.startDate?.getHours() ?? 0;
    const startMinute = plan.startDate?.getMinutes() ?? 0;
    const duration =
      plan.endDate && plan.startDate
        ? (plan.endDate.getTime() - plan.startDate.getTime()) / 60000
        : 60;

    return {
      title: plan.title,
      description: plan.description ?? null,
      startHour,
      startMinute,
      duration,
      tagIds: plan.tagIds,
    };
  }, [selectedPlanId, filteredEvents]);

  // ペースト先の日付を取得（現在表示中の日付）
  const getPasteDateForKeyboard = useCallback(() => {
    return currentDate;
  }, [currentDate]);

  // 削除関数をPromise化（既存のPlanDeleteConfirmDialogシステム用）
  const deletePlanAsync = useCallback(
    async (planId: string) => {
      deletePlan(planId);
    },
    [deletePlan],
  );

  useCalendarPlanKeyboard({
    enabled: true,
    onDeletePlan: deletePlanAsync,
    getSelectedPlanTitle,
    getInitialPlanData,
    getSelectedPlanForCopy,
    getPasteDateForKeyboard,
  });

  // ビューコンポーネントのレンダリング用props（memo化のため安定した参照を保持）
  const commonProps = useMemo(
    () => ({
      dateRange: viewDateRange,
      plans: filteredEvents,
      allPlans: allCalendarPlans,
      currentDate,
      showWeekends,
      disabledPlanId,
      onPlanClick: handlePlanClick,
      onPlanContextMenu: handleEventContextMenu,
      onCreatePlan: handleCreatePlan,
      onUpdatePlan: handleUpdatePlan,
      onDeletePlan: deletePlan,
      onRestorePlan: handlePlanRestore,
      onEmptyClick: handleEmptyClick,
      onEmptyAreaContextMenu: handleEmptyAreaContextMenu,
      onTimeRangeSelect: handleDateTimeRangeSelect,
      onViewChange: handleViewChange,
      onNavigatePrev: handleNavigatePrev,
      onNavigateNext: handleNavigateNext,
      onNavigateToday: handleNavigateToday,
    }),
    [
      viewDateRange,
      filteredEvents,
      allCalendarPlans,
      currentDate,
      showWeekends,
      disabledPlanId,
      handlePlanClick,
      handleEventContextMenu,
      handleCreatePlan,
      handleUpdatePlan,
      deletePlan,
      handlePlanRestore,
      handleEmptyClick,
      handleEmptyAreaContextMenu,
      handleDateTimeRangeSelect,
      handleViewChange,
      handleNavigatePrev,
      handleNavigateNext,
      handleNavigateToday,
    ],
  );

  return (
    <DnDProvider>
      <CalendarLayout
        className={className}
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onViewChange={handleViewChange}
        showHeaderActions={false}
        onDateSelect={handleDateSelect}
        currentPanel={currentPanel}
        onPanelChange={setCurrentPanel}
      >
        <CalendarViewRenderer viewType={viewType} commonProps={commonProps} />
      </CalendarLayout>

      {contextMenuEvent && contextMenuPosition ? (
        <EventContextMenu
          plan={contextMenuEvent}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onDuplicate={handleDuplicatePlan}
          onCopy={handleCopyPlan}
          onComplete={handleCompletePlan}
          onCompleteWithRecord={handleCompleteWithRecord}
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
};
