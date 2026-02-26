'use client';

import { useCallback } from 'react';

import { convertFromTimezone } from '@/lib/date/timezone';
import { getInstanceRef } from '@/lib/instance-id';
import { logger } from '@/lib/logger';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { usePlanInspectorStore } from '@/stores/usePlanInspectorStore';
import { useRecordInspectorStore } from '@/stores/useRecordInspectorStore';
import { useRecurringEditConfirmStore } from '@/stores/useRecurringEditConfirmStore';

import type { CalendarPlan, CalendarViewType } from '../../../types/calendar.types';

interface UseCalendarHandlersOptions {
  viewType: CalendarViewType;
  currentDate: Date;
}

export function useCalendarHandlers({ viewType, currentDate }: UseCalendarHandlersOptions) {
  const openPlanInspector = usePlanInspectorStore((state) => state.openInspector);
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const inspectorIsOpen = usePlanInspectorStore((state) => state.isOpen);

  // Record Inspector
  const openRecordInspector = useRecordInspectorStore((state) => state.openInspector);

  // カレンダー設定のタイムゾーン
  const timezone = useCalendarSettingsStore((s) => s.timezone);

  // Inspector で開いているプランIDをDnD無効化用に計算
  // Inspector が開いている場合のみ planId を返す
  const disabledPlanId = inspectorIsOpen ? inspectorPlanId : null;

  // プラン/Record クリックハンドラー
  const handlePlanClick = useCallback(
    (plan: CalendarPlan) => {
      // ドラッグ操作で開いたダイアログが残っている場合は閉じる
      const { closeDialog } = useRecurringEditConfirmStore.getState();
      closeDialog();

      // Record の場合は RecordInspector を開く
      if (plan.type === 'record' && plan.recordId) {
        openRecordInspector(plan.recordId);
        logger.log('📋 Opening Record Inspector:', {
          recordId: plan.recordId,
          title: plan.title,
          linkedPlanId: plan.linkedPlanId,
        });
        return;
      }

      // Plan の場合は PlanInspector を開く
      // 繰り返しインスタンスの場合は親プランIDを使用
      const planIdToOpen = plan.calendarId ?? plan.id;

      // 繰り返しプランの場合はインスタンス日付を渡す
      const ref = plan.isRecurring ? getInstanceRef(plan) : null;
      const instanceDateRaw = ref?.instanceDate ?? plan.startDate?.toISOString().slice(0, 10);

      openPlanInspector(
        planIdToOpen,
        instanceDateRaw && plan.isRecurring ? { instanceDate: instanceDateRaw } : undefined,
      );

      logger.log('📋 Opening Plan Inspector:', {
        planId: planIdToOpen,
        title: plan.title,
        isRecurringInstance: !!plan.calendarId,
        instanceDate: instanceDateRaw,
      });
    },
    [openPlanInspector, openRecordInspector],
  );

  const handleCreatePlan = useCallback(
    (date?: Date, time?: string) => {
      logger.log('➕ Create plan requested:', {
        date: date?.toISOString(),
        dateString: date?.toDateString(),
        time,
        currentDate: currentDate.toISOString(),
        viewType,
      });

      // 時刻の解析
      let startTime: Date | undefined;
      let endTime: Date | undefined;

      if (date) {
        if (time) {
          if (time.includes('-')) {
            const [start, end] = time.split('-');
            const [startHour, startMin] = start?.split(':').map(Number) ?? [9, 0];
            const [endHour, endMin] = end?.split(':').map(Number) ?? [10, 0];

            startTime = new Date(date);
            startTime.setHours(startHour ?? 9, startMin ?? 0, 0, 0);

            endTime = new Date(date);
            endTime.setHours(endHour ?? 10, endMin ?? 0, 0, 0);
          } else {
            const [hour, min] = time.split(':').map(Number);
            startTime = new Date(date);
            startTime.setHours(hour ?? 9, min ?? 0, 0, 0);

            endTime = new Date(date);
            endTime.setHours((hour ?? 9) + 1, min ?? 0, 0, 0); // デフォルト1時間
          }
        } else {
          startTime = new Date(date);
          startTime.setHours(9, 0, 0, 0); // デフォルト9:00

          endTime = new Date(date);
          endTime.setHours(10, 0, 0, 0); // デフォルト10:00
        }
      }

      // ドラフトモードでInspectorを開く（DB保存は入力時に遅延実行）
      // Note: 重複チェックはサーバー側で行う（Plan↔Record共存を許可するため）
      if (startTime && endTime && date) {
        // カレンダーTZの時刻をUTCに変換
        const utcStartTime = convertFromTimezone(startTime, timezone);
        const utcEndTime = convertFromTimezone(endTime, timezone);

        openInspectorWithDraft({
          title: '',
          start_time: utcStartTime.toISOString(),
          end_time: utcEndTime.toISOString(),
        });

        logger.log('📝 Opened draft plan:', {
          startTime: utcStartTime.toISOString(),
          endTime: utcEndTime.toISOString(),
        });
      }
    },
    [viewType, currentDate, openInspectorWithDraft, timezone],
  );

  // 空き時間クリック用のハンドラー（ダブルクリックで使用）
  const handleEmptyClick = useCallback(
    (date: Date, time: string) => {
      logger.log('🖱️ Empty time clicked:', { date, time });
      handleCreatePlan(date, time);
    },
    [handleCreatePlan],
  );

  // 統一された時間範囲選択ハンドラー（全ビュー共通、ドラッグまたはダブルクリックで呼ばれる）
  const handleDateTimeRangeSelect = useCallback(
    (selection: {
      date: Date;
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
    }) => {
      // 指定された日付に時間を設定（カレンダーTZの値として解釈）
      const localStart = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.startHour,
        selection.startMinute,
      );
      const localEnd = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.endHour,
        selection.endMinute,
      );

      // カレンダーTZの時刻をUTCに変換
      const startTime = convertFromTimezone(localStart, timezone);
      const endTime = convertFromTimezone(localEnd, timezone);

      logger.log('📅 Calendar Drag Selection:', {
        date: selection.date.toDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
      });

      // Note: 重複チェックはサーバー側で行う（Plan↔Record共存を許可するため）
      // ドラフトモードでInspectorを開く（DB保存は入力時に遅延実行）
      openInspectorWithDraft({
        title: '',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      logger.log('📝 Opened draft plan from drag selection:', {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    },
    [openInspectorWithDraft, timezone],
  );

  return {
    handlePlanClick,
    handleCreatePlan,
    handleEmptyClick,
    handleDateTimeRangeSelect,
    /** DnDを無効化するプランID（Inspector表示中のプラン） */
    disabledPlanId,
  };
}
