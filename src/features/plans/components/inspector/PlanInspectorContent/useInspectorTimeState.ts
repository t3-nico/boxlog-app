'use client';

/**
 * Inspector の時間・スケジュール状態を管理するフック
 * scheduleDate, startTime, endTime, reminderMinutes, timeConflictError、各ハンドラー
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { localTimeToUTCISO, parseDatetimeString, parseISOToUserTimezone } from '@/lib/date-utils';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';

import { type DraftPlan } from '@/stores/usePlanInspectorStore';
import type { Plan } from '../../../types/plan';

interface UseInspectorTimeStateProps {
  plan: Plan | null;
  planId: string | null;
  isDraftMode: boolean;
  draftPlan: DraftPlan | null;
  initialData: { start_time?: string | null; end_time?: string | null } | null;
  recurringEdit: {
    isRecurringInstance: boolean;
    openScopeDialog: (
      field?: 'title' | 'description' | 'start_time' | 'end_time',
      value?: string | undefined,
    ) => void;
  };
  addPendingChange: (change: Record<string, string | number | null | undefined>) => void;
  updateDraft: (partial: Partial<DraftPlan>) => void;
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
  isDraftMode,
  draftPlan,
  initialData,
  recurringEdit,
  addPendingChange,
  updateDraft,
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

  // Initialize state from plan data or draftPlan
  useEffect(() => {
    // ドラフトモードの場合はdraftPlanから初期化
    if (isDraftMode && draftPlan) {
      if (draftPlan.start_time) {
        const date = parseDatetimeString(draftPlan.start_time);
        setScheduleDate(date);
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setScheduleDate(undefined);
        setStartTime('');
      }

      if (draftPlan.end_time) {
        const date = parseDatetimeString(draftPlan.end_time);
        setEndTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setEndTime('');
      }

      // リマインダーのデフォルトは常に null（なし）
      setReminderMinutes(draftPlan.reminder_minutes ?? null);
      return;
    }

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

      setReminderMinutes('reminder_minutes' in plan ? (plan.reminder_minutes ?? null) : null);
    } else if (!plan && initialData) {
      if (initialData.start_time) {
        const startDate = parseISOToUserTimezone(initialData.start_time, timezone);
        setScheduleDate(startDate);
        setStartTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
      if (initialData.end_time) {
        const endDate = parseISOToUserTimezone(initialData.end_time, timezone);
        setEndTime(
          `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
    } else if (!plan && !initialData) {
      setScheduleDate(undefined);
      setStartTime('');
      setEndTime('');
      setReminderMinutes(null);
    }
  }, [plan, initialData, isDraftMode, draftPlan, timezone]);

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

      // ドラフトモードの場合はローカル更新のみ
      if (isDraftMode) {
        if (date && startTime) {
          const [hours, minutes] = startTime.split(':').map(Number);
          updateDraft({ start_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone) });
        }
        if (date && endTime) {
          const [hours, minutes] = endTime.split(':').map(Number);
          updateDraft({ end_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone) });
        }
        return;
      }

      // 通常モード: ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        // 両フィールドを一度にバッファリング（タイムゾーン対応）
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
    [isDraftMode, startTime, endTime, addPendingChange, updateDraft, timezone],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      // 時間変更時に既存のエラーをクリア
      setTimeConflictError(false);

      // 時刻をパース
      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];

      setStartTime(time);

      // タイムゾーン対応のISO文字列を生成
      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone)
          : null;

      // ドラフトモード
      if (isDraftMode) {
        updateDraft({ start_time: isoValue });
        return;
      }

      // 繰り返しインスタンス → スコープダイアログ
      if (recurringEdit.isRecurringInstance) {
        recurringEdit.openScopeDialog('start_time', isoValue ?? undefined);
        return;
      }

      // 通常モード → ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (isoValue) {
        addPendingChange({ start_time: isoValue });
      }
    },
    [scheduleDate, isDraftMode, recurringEdit, updateDraft, addPendingChange, timezone],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      // 時間変更時に既存のエラーをクリア
      setTimeConflictError(false);

      // 時刻をパース
      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];

      setEndTime(time);

      // タイムゾーン対応のISO文字列を生成
      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone)
          : null;

      // ドラフトモード
      if (isDraftMode) {
        updateDraft({ end_time: isoValue });
        return;
      }

      // 繰り返しインスタンス → スコープダイアログ
      if (recurringEdit.isRecurringInstance) {
        recurringEdit.openScopeDialog('end_time', isoValue ?? undefined);
        return;
      }

      // 通常モード → ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (isoValue) {
        addPendingChange({ end_time: isoValue });
      }
    },
    [scheduleDate, isDraftMode, recurringEdit, updateDraft, addPendingChange, timezone],
  );

  // Reminder handler
  const handleReminderChange = useCallback(
    (minutes: number | null) => {
      setReminderMinutes(minutes);

      if (isDraftMode) {
        updateDraft({ reminder_minutes: minutes });
      } else if (planId) {
        updatePlan.mutate({ id: planId, data: { reminder_minutes: minutes } });
      }
    },
    [isDraftMode, planId, updateDraft, updatePlan],
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
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleReminderChange,
  };
}
