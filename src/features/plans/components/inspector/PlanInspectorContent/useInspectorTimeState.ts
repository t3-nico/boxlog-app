'use client';

/**
 * Inspector の時間・スケジュール状態を管理するフック
 * scheduleDate, startTime, endTime, reminderMinutes, timeConflictError、各ハンドラー
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { localTimeToUTCISO, parseISOToUserTimezone } from '@/lib/date-utils';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';

import type { EntryWithTags } from '@/core/types/entry';

interface UseInspectorTimeStateProps {
  plan: EntryWithTags | null;
  planId: string | null;
  recurringEdit: {
    isRecurringInstance: boolean;
    openScopeDialog: (
      field?: 'title' | 'description' | 'start_time' | 'end_time',
      value?: string | undefined,
    ) => void;
  };
  addPendingChange: (change: Record<string, string | number | null | undefined>) => void;
  updatePlan: {
    mutate: (args: {
      id: string;
      data: Record<string, string | number | null | undefined>;
    }) => void;
  };
}

export function useInspectorTimeState({
  plan,
  planId,
  recurringEdit,
  addPendingChange,
  updatePlan,
}: UseInspectorTimeStateProps) {
  // ユーザーのタイムゾーン設定
  const timezone = useCalendarSettingsStore((state) => state.timezone);

  // 時間重複エラー状態（視覚的フィードバック用）
  const [timeConflictError, setTimeConflictError] = useState(false);

  // UI state
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  // 記録時間（actual）— null = 予定と同じ
  const [actualStartTime, setActualStartTime] = useState<string | null>(null);
  const [actualEndTime, setActualEndTime] = useState<string | null>(null);

  // Initialize state from plan data
  useEffect(() => {
    if (plan && 'id' in plan) {
      // スケジュール日と時間を設定（タイムゾーン対応）
      if (plan.start_time) {
        const date = parseISOToUserTimezone(plan.start_time, timezone);
        setScheduleDate(date);
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setScheduleDate(undefined);
        setStartTime('');
      }

      if (plan.end_time) {
        const date = parseISOToUserTimezone(plan.end_time, timezone);
        setEndTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setEndTime('');
      }

      setReminderMinutes(plan.reminder_minutes ?? null);

      // 記録時間の初期化（null = 予定と同じ）
      if (plan.actual_start_time) {
        const actStartDate = parseISOToUserTimezone(plan.actual_start_time, timezone);
        setActualStartTime(
          `${actStartDate.getHours().toString().padStart(2, '0')}:${actStartDate.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setActualStartTime(null);
      }
      if (plan.actual_end_time) {
        const actEndDate = parseISOToUserTimezone(plan.actual_end_time, timezone);
        setActualEndTime(
          `${actEndDate.getHours().toString().padStart(2, '0')}:${actEndDate.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setActualEndTime(null);
      }
    } else if (!plan) {
      setScheduleDate(undefined);
      setStartTime('');
      setEndTime('');
      setReminderMinutes(null);
      setActualStartTime(null);
      setActualEndTime(null);
    }
  }, [plan, timezone]);

  // Focus title on open
  useEffect(() => {
    if (titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current?.focus();
        titleRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [planId]);

  // Adjust description height
  useEffect(() => {
    if (descriptionRef.current && plan) {
      const textarea = descriptionRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${newHeight}px`;
    }
  }, [plan]);

  // スケジュール日変更ハンドラー（start_time/end_timeの日付部分）
  const handleScheduleDateChange = useCallback(
    (date: Date | undefined) => {
      // 日付変更時に既存のエラーをクリア
      setTimeConflictError(false);
      setScheduleDate(date);

      // ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        addPendingChange({
          start_time: localTimeToUTCISO(date, startHours ?? 0, startMinutes ?? 0, timezone),
          end_time: localTimeToUTCISO(date, endHours ?? 0, endMinutes ?? 0, timezone),
        });
      } else if (date && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        addPendingChange({
          start_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone),
        });
      } else if (date && endTime) {
        const [hours, minutes] = endTime.split(':').map(Number);
        addPendingChange({
          end_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone),
        });
      }
    },
    [startTime, endTime, addPendingChange, timezone],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      setTimeConflictError(false);

      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
      setStartTime(time);

      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone)
          : null;

      // 繰り返しインスタンス → スコープダイアログ
      if (recurringEdit.isRecurringInstance) {
        recurringEdit.openScopeDialog('start_time', isoValue ?? undefined);
        return;
      }

      // 通常モード → ローカルにバッファリング
      if (isoValue) {
        addPendingChange({ start_time: isoValue });
      }
    },
    [scheduleDate, recurringEdit, addPendingChange, timezone],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      setTimeConflictError(false);

      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
      setEndTime(time);

      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone)
          : null;

      // 繰り返しインスタンス → スコープダイアログ
      if (recurringEdit.isRecurringInstance) {
        recurringEdit.openScopeDialog('end_time', isoValue ?? undefined);
        return;
      }

      // 通常モード → ローカルにバッファリング
      if (isoValue) {
        addPendingChange({ end_time: isoValue });
      }
    },
    [scheduleDate, recurringEdit, addPendingChange, timezone],
  );

  // Reminder handler
  const handleReminderChange = useCallback(
    (minutes: number | null) => {
      setReminderMinutes(minutes);
      if (planId) {
        updatePlan.mutate({ id: planId, data: { reminder_minutes: minutes } });
      }
    },
    [planId, updatePlan],
  );

  // 記録時間変更ハンドラー
  const handleActualStartChange = useCallback(
    (time: string | null) => {
      setActualStartTime(time);

      if (time && scheduleDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const isoValue = localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone);
        addPendingChange({ actual_start_time: isoValue });
      } else {
        addPendingChange({ actual_start_time: null });
      }
    },
    [scheduleDate, addPendingChange, timezone],
  );

  const handleActualEndChange = useCallback(
    (time: string | null) => {
      setActualEndTime(time);

      if (time && scheduleDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const isoValue = localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone);
        addPendingChange({ actual_end_time: isoValue });
      } else {
        addPendingChange({ actual_end_time: null });
      }
    },
    [scheduleDate, addPendingChange, timezone],
  );

  return {
    timezone,
    timeConflictError,
    titleRef,
    descriptionRef,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    actualStartTime,
    actualEndTime,
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleReminderChange,
    handleActualStartChange,
    handleActualEndChange,
  };
}
