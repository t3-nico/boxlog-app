'use client';

/**
 * Calendar Composition Hook
 *
 * CalendarControllerに必要な全データ・コールバックを集約する。
 * feature間の橋渡しはこのhookのみが行い、CalendarControllerは純粋なViewとなる。
 *
 * @see /docs/architecture/grand-design.md
 */

import { useCallback, useEffect } from 'react';

import { addHours, startOfHour } from 'date-fns';

// Feature barrel imports（cross-feature依存はここに集約）
import type { CalendarPlan, CalendarViewType, ViewDateRange } from '@/features/calendar';
import {
  useCalendarData,
  useCalendarHandlers,
  useCalendarNavigationHandlers,
  useCalendarPlanKeyboard,
  usePlanContextActions,
  usePlanOperations,
  useRecurringPlanDrag,
  useWeekendToggleShortcut,
} from '@/features/calendar';
import type { AsideType } from '@/features/navigation';
import { useAppAsideStore } from '@/features/navigation';
import { useNotifications } from '@/features/notifications';
import type { PlanInitialData } from '@/features/plans';
import { usePlanInspectorStore } from '@/features/plans';
import { getCurrentTimezone, setUserTimezone, useCalendarSettingsStore } from '@/features/settings';
import { logger } from '@/lib/logger';

// =============================================================================
// Types
// =============================================================================

export interface CalendarCompositionInput {
  /** 現在のビュータイプ */
  viewType: CalendarViewType;
  /** 現在の表示日付 */
  currentDate: Date;
  /** 相対ナビゲーション */
  navigateRelative: (direction: 'prev' | 'next' | 'today') => void;
  /** 日付指定ナビゲーション */
  navigateToDate: (date: Date) => void;
  /** ビュー変更 */
  changeView: (view: CalendarViewType) => void;
}

export interface CalendarCompositionResult {
  // === Data ===
  viewDateRange: ViewDateRange;
  filteredEvents: CalendarPlan[];
  allCalendarPlans: CalendarPlan[];

  // === Settings ===
  showWeekends: boolean;

  // === Plan state ===
  disabledPlanId: string | null;

  // === Aside ===
  currentAside: AsideType;
  onAsideChange: (aside: AsideType) => void;

  // === Plan click handlers ===
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

  // === Plan CRUD ===
  onUpdatePlan: (
    planIdOrPlan: string | CalendarPlan,
    updates?: { startTime: Date; endTime: Date },
  ) => void | Promise<void> | Promise<{ skipToast: true } | void>;
  onDeletePlan: (planId: string) => void;
  onRestorePlan: (plan: CalendarPlan) => Promise<void>;

  // === Context menu actions ===
  onEditPlan: (plan: CalendarPlan) => void;
  onDeletePlanConfirm: (plan: CalendarPlan) => void;
  onDuplicatePlan: (plan: CalendarPlan) => void;
  onCopyPlan: (plan: CalendarPlan) => void;
  onCompletePlan: (plan: CalendarPlan) => void;
  onCompleteWithRecord: (plan: CalendarPlan) => void;

  // === Navigation handlers ===
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (newView: CalendarViewType) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onToggleWeekends: () => void;
  onDateSelect: (date: Date) => void;
}

// =============================================================================
// Composition Hook
// =============================================================================

export function useCalendarComposition({
  viewType,
  currentDate,
  navigateRelative,
  navigateToDate,
  changeView,
}: CalendarCompositionInput): CalendarCompositionResult {
  // =========================================================================
  // Settings
  // =========================================================================
  const timezone = useCalendarSettingsStore((state) => state.timezone);
  const showWeekends = useCalendarSettingsStore((state) => state.showWeekends);
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

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

  // =========================================================================
  // Aside state
  // =========================================================================
  const currentAside = useAppAsideStore.use.asideType();
  const setCurrentAside = useAppAsideStore.use.setAside();

  // =========================================================================
  // Plan Inspector state
  // =========================================================================
  const selectedPlanId = usePlanInspectorStore((state) => state.planId);

  // =========================================================================
  // Notifications（初回許可リクエスト）
  // =========================================================================
  const {
    permission: notificationPermission,
    hasRequested: hasRequestedNotification,
    requestPermission: requestNotificationPermission,
  } = useNotifications();

  useEffect(() => {
    if (!hasRequestedNotification && (notificationPermission as string) === 'default') {
      requestNotificationPermission();
    }
  }, [hasRequestedNotification, notificationPermission, requestNotificationPermission]);

  // =========================================================================
  // Data Layer（plans + records + filtering）
  // =========================================================================
  const { viewDateRange, filteredEvents, allCalendarPlans } = useCalendarData({
    viewType,
    currentDate,
  });

  // =========================================================================
  // Calendar Handlers（click, create, drag-select）
  // =========================================================================
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

  // =========================================================================
  // Plan Operations（CRUD）
  // =========================================================================
  const { handlePlanDelete: deletePlan, handlePlanRestore } = usePlanOperations();

  // =========================================================================
  // Recurring Plan Drag（ダイアログ付きドラッグ処理）
  // =========================================================================
  const { handleUpdatePlan } = useRecurringPlanDrag({
    plans: allCalendarPlans,
  });

  // =========================================================================
  // Context Actions（右クリックメニュー）
  // =========================================================================
  const {
    handleDeletePlan: handleDeletePlanConfirm,
    handleEditPlan,
    handleDuplicatePlan,
    handleCopyPlan,
    handleCompletePlan,
    handleCompleteWithRecord,
  } = usePlanContextActions();

  // =========================================================================
  // Navigation Handlers
  // =========================================================================
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

  // =========================================================================
  // Weekend Toggle Shortcut
  // =========================================================================
  useWeekendToggleShortcut();

  // =========================================================================
  // Plan Keyboard Shortcuts
  // =========================================================================
  const getInitialPlanData = useCallback((): PlanInitialData => {
    const now = new Date();
    const start = startOfHour(now);
    const end = addHours(start, 1);
    return {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    };
  }, []);

  const getSelectedPlanTitle = useCallback(() => {
    if (!selectedPlanId) return null;
    const plan = filteredEvents.find((p) => p.id === selectedPlanId);
    return plan?.title ?? null;
  }, [selectedPlanId, filteredEvents]);

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

  const getPasteDateForKeyboard = useCallback(() => {
    return currentDate;
  }, [currentDate]);

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

  // =========================================================================
  // Debug logging（初回マウント時のみ）
  // =========================================================================
  useEffect(() => {
    logger.log('📊 CalendarComposition initialized:', { viewType });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回のみ
  }, []);

  // =========================================================================
  // Return composition result
  // =========================================================================
  return {
    // Data
    viewDateRange,
    filteredEvents,
    allCalendarPlans,

    // Settings
    showWeekends,

    // Plan state
    disabledPlanId,

    // Aside
    currentAside,
    onAsideChange: setCurrentAside,

    // Plan click handlers
    onPlanClick: handlePlanClick,
    onCreatePlan: handleCreatePlan,
    onEmptyClick: handleEmptyClick,
    onTimeRangeSelect: handleDateTimeRangeSelect,

    // Plan CRUD
    onUpdatePlan: handleUpdatePlan,
    onDeletePlan: deletePlan,
    onRestorePlan: handlePlanRestore,

    // Context menu actions
    onEditPlan: handleEditPlan,
    onDeletePlanConfirm: handleDeletePlanConfirm,
    onDuplicatePlan: handleDuplicatePlan,
    onCopyPlan: handleCopyPlan,
    onCompletePlan: handleCompletePlan,
    onCompleteWithRecord: handleCompleteWithRecord,

    // Navigation handlers
    onNavigate: handleNavigate,
    onViewChange: handleViewChange,
    onNavigatePrev: handleNavigatePrev,
    onNavigateNext: handleNavigateNext,
    onNavigateToday: handleNavigateToday,
    onToggleWeekends: handleToggleWeekends,
    onDateSelect: handleDateSelect,
  };
}
