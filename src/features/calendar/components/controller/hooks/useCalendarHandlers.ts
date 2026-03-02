'use client';

import { useCallback } from 'react';

import { convertFromTimezone } from '@/lib/date/timezone';
import { getInstanceRef } from '@/lib/instance-id';
import { logger } from '@/lib/logger';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
import { closeModal, useModalStore } from '@/stores/useModalStore';

import type { CalendarPlan, CalendarViewType } from '../../../types/calendar.types';

interface UseCalendarHandlersOptions {
  viewType: CalendarViewType;
  currentDate: Date;
}

export function useCalendarHandlers({ viewType, currentDate }: UseCalendarHandlersOptions) {
  const openPlanInspector = useEntryInspectorStore((state) => state.openInspector);
  const openInspectorWithDraft = useEntryInspectorStore((state) => state.openInspectorWithDraft);
  const inspectorPlanId = useEntryInspectorStore((state) => state.entryId);
  const inspectorIsOpen = useEntryInspectorStore((state) => state.isOpen);

  // カレンダー設定のタイムゾーン
  const timezone = useCalendarSettingsStore((s) => s.timezone);

  // Inspector で開いているプランIDをDnD無効化用に計算
  const disabledPlanId = inspectorIsOpen ? inspectorPlanId : null;

  // エントリクリックハンドラー（Plan/Record 統一）
  const handlePlanClick = useCallback(
    (plan: CalendarPlan) => {
      // ドラッグ操作で開いたダイアログが残っている場合は閉じる
      const modal = useModalStore.getState().modal;
      if (modal?.type === 'recurringEdit') closeModal();

      // 繰り返しインスタンスの場合は親エントリIDを使用
      const entryIdToOpen = plan.calendarId ?? plan.id;

      // 繰り返しプランの場合はインスタンス日付を渡す
      const ref = plan.isRecurring ? getInstanceRef(plan) : null;
      const instanceDateRaw = ref?.instanceDate ?? plan.startDate?.toISOString().slice(0, 10);

      openPlanInspector(
        entryIdToOpen,
        instanceDateRaw && plan.isRecurring ? { instanceDate: instanceDateRaw } : undefined,
      );

      logger.log('📋 Opening Entry Inspector:', {
        entryId: entryIdToOpen,
        title: plan.title,
        type: plan.type,
        isRecurringInstance: !!plan.calendarId,
        instanceDate: instanceDateRaw,
      });
    },
    [openPlanInspector],
  );

  const handleCreatePlan = useCallback(
    (date?: Date, time?: string) => {
      logger.log('➕ Create entry requested:', {
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
            endTime.setHours((hour ?? 9) + 1, min ?? 0, 0, 0);
          }
        } else {
          startTime = new Date(date);
          startTime.setHours(9, 0, 0, 0);

          endTime = new Date(date);
          endTime.setHours(10, 0, 0, 0);
        }
      }

      // ドラフトモードでInspectorを開く
      if (startTime && endTime && date) {
        const utcStartTime = convertFromTimezone(startTime, timezone);
        const utcEndTime = convertFromTimezone(endTime, timezone);

        openInspectorWithDraft({
          title: '',
          start_time: utcStartTime.toISOString(),
          end_time: utcEndTime.toISOString(),
        });

        logger.log('📝 Opened draft entry:', {
          startTime: utcStartTime.toISOString(),
          endTime: utcEndTime.toISOString(),
        });
      }
    },
    [viewType, currentDate, openInspectorWithDraft, timezone],
  );

  // 空き時間クリック用のハンドラー
  const handleEmptyClick = useCallback(
    (date: Date, time: string) => {
      logger.log('🖱️ Empty time clicked:', { date, time });
      handleCreatePlan(date, time);
    },
    [handleCreatePlan],
  );

  // 統一された時間範囲選択ハンドラー（全ビュー共通）
  const handleDateTimeRangeSelect = useCallback(
    (selection: {
      date: Date;
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
    }) => {
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

      // 最小15分制約
      const MIN_DURATION_MS = 15 * 60 * 1000;
      if (localEnd.getTime() - localStart.getTime() < MIN_DURATION_MS) {
        localEnd.setTime(localStart.getTime() + MIN_DURATION_MS);
      }

      // カレンダーTZの時刻をUTCに変換
      const startTime = convertFromTimezone(localStart, timezone);
      const endTime = convertFromTimezone(localEnd, timezone);

      logger.log('📅 Calendar Drag Selection:', {
        date: selection.date.toDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
      });

      openInspectorWithDraft({
        title: '',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
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
