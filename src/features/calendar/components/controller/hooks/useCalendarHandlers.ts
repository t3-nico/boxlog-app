'use client';

import { useCallback } from 'react';

import { convertFromTimezone } from '@/lib/date/timezone';
import { getInstanceRef } from '@/lib/instance-id';
import { logger } from '@/lib/logger';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
import { useInlineCreateStore } from '@/stores/useInlineCreateStore';
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

  const setPendingSelection = useInlineCreateStore.use.setPendingSelection();

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
  // ドラッグ/ダブルクリック/タップ → InlineTagPalette 表示
  const handleDateTimeRangeSelect = useCallback(
    (selection: {
      date: Date;
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
    }) => {
      // 最小15分制約の適用
      const startMinutes = selection.startHour * 60 + selection.startMinute;
      let endMinutes = selection.endHour * 60 + selection.endMinute;
      if (endMinutes - startMinutes < 15) {
        endMinutes = startMinutes + 15;
      }

      logger.log('📅 Calendar Drag Selection → InlineTagPalette:', {
        date: selection.date.toDateString(),
        start: `${selection.startHour}:${String(selection.startMinute).padStart(2, '0')}`,
        end: `${Math.floor(endMinutes / 60)}:${String(endMinutes % 60).padStart(2, '0')}`,
      });

      setPendingSelection({
        date: selection.date,
        startHour: selection.startHour,
        startMinute: selection.startMinute,
        endHour: Math.floor(endMinutes / 60),
        endMinute: endMinutes % 60,
      });
    },
    [setPendingSelection],
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
