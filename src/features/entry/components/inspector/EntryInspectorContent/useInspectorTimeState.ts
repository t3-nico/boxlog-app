'use client';

/**
 * Inspector の時間・スケジュール状態を管理するフック
 * scheduleDate, startTime, endTime, reminderMinutes, timeConflictError、各ハンドラー
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { localTimeToUTCISO, parseISOToUserTimezone } from '@/lib/date-utils';
import { api } from '@/platform/trpc';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { isEntryPast } from '../../../lib/entry-status';

import type { EntryWithTags } from '@/types/entry';

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
  updatePlan,
}: UseInspectorTimeStateProps) {
  // ユーザーのタイムゾーン設定
  const timezone = useCalendarSettingsStore((state) => state.timezone);

  // TanStack Query キャッシュアクセス（重複チェック用）
  const utils = api.useUtils();

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

  // デバウンス即時保存（予定時間用: 500ms後にmutate）
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFieldsRef = useRef<Record<string, string | number | null | undefined>>({});

  const debouncedSave = useCallback(
    (fields: Record<string, string | number | null | undefined>) => {
      if (!planId) return;

      // フィールドをマージ（start_time + end_time が短時間に両方変わる場合に対応）
      pendingFieldsRef.current = { ...pendingFieldsRef.current, ...fields };

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const data = pendingFieldsRef.current;
        pendingFieldsRef.current = {};
        updatePlan.mutate({ id: planId, data });
      }, 500);
    },
    [planId, updatePlan],
  );

  // デバウンスタイマーのクリーンアップ
  useEffect(() => {
    return () => {
      // アンマウント時に未送信の変更をフラッシュ
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        const data = pendingFieldsRef.current;
        if (planId && Object.keys(data).length > 0) {
          pendingFieldsRef.current = {};
          updatePlan.mutate({ id: planId, data });
        }
      }
    };
  }, [planId, updatePlan]);

  // Initialize state from plan data
  useEffect(() => {
    if (plan && 'id' in plan) {
      // スケジュール日と時間を設定（タイムゾーン対応）
      if (plan.start_time) {
        const date = parseISOToUserTimezone(plan.start_time, timezone);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- planデータからのタイムゾーン変換結果を同期
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

  // リアルタイム重複チェック: scheduleDate / startTime / endTime の変更を監視
  useEffect(() => {
    if (!scheduleDate || !startTime || !endTime || !planId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tRPCキャッシュ参照を伴う重複チェック結果の反映
      setTimeConflictError(false);
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startISO = localTimeToUTCISO(scheduleDate, startH ?? 0, startM ?? 0, timezone);
    const endISO = localTimeToUTCISO(scheduleDate, endH ?? 0, endM ?? 0, timezone);

    const entries = utils.entries.list.getData();
    if (!entries) {
      setTimeConflictError(false);
      return;
    }

    const hasOverlap = entries.some(
      (entry: { id: string; start_time: string | null; end_time: string | null }) => {
        if (entry.id === planId) return false;
        if (!entry.start_time || !entry.end_time) return false;
        return (
          new Date(entry.start_time) < new Date(endISO) &&
          new Date(entry.end_time) > new Date(startISO)
        );
      },
    );

    setTimeConflictError(hasOverlap);
  }, [scheduleDate, startTime, endTime, planId, timezone, utils.entries.list]);

  // スケジュール日変更ハンドラー（start_time/end_timeの日付部分）
  const handleScheduleDateChange = useCallback(
    (date: Date | undefined) => {
      // 過去ブロックの予定変更をブロック（UI disabled と二重防御）
      if (plan && isEntryPast(plan)) return;

      setScheduleDate(date);

      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        debouncedSave({
          start_time: localTimeToUTCISO(date, startHours ?? 0, startMinutes ?? 0, timezone),
          end_time: localTimeToUTCISO(date, endHours ?? 0, endMinutes ?? 0, timezone),
        });
      } else if (date && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        debouncedSave({
          start_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone),
        });
      } else if (date && endTime) {
        const [hours, minutes] = endTime.split(':').map(Number);
        debouncedSave({
          end_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone),
        });
      }
    },
    [plan, startTime, endTime, debouncedSave, timezone],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      // 過去ブロックの予定変更をブロック（UI disabled と二重防御）
      if (plan && isEntryPast(plan)) return;

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

      // 通常モード → デバウンス即時保存（重複時はブロック）
      if (isoValue && !timeConflictError) {
        debouncedSave({ start_time: isoValue });
      }
    },
    [plan, scheduleDate, recurringEdit, debouncedSave, timezone, timeConflictError],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      // 過去ブロックの予定変更をブロック（UI disabled と二重防御）
      if (plan && isEntryPast(plan)) return;

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

      // 通常モード → デバウンス即時保存（重複時はブロック）
      if (isoValue && !timeConflictError) {
        debouncedSave({ end_time: isoValue });
      }
    },
    [plan, scheduleDate, recurringEdit, debouncedSave, timezone, timeConflictError],
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

  // 記録時間変更ハンドラー（即座にmutate → サーバー側で隣接auto-shrink）
  const handleActualStartChange = useCallback(
    (time: string | null) => {
      setActualStartTime(time);
      if (!planId) return;

      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(
              scheduleDate,
              ...(time.split(':').map(Number) as [number, number]),
              timezone,
            )
          : null;

      updatePlan.mutate({ id: planId, data: { actual_start_time: isoValue } });
    },
    [planId, scheduleDate, updatePlan, timezone],
  );

  const handleActualEndChange = useCallback(
    (time: string | null) => {
      setActualEndTime(time);
      if (!planId) return;

      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(
              scheduleDate,
              ...(time.split(':').map(Number) as [number, number]),
              timezone,
            )
          : null;

      updatePlan.mutate({ id: planId, data: { actual_end_time: isoValue } });
    },
    [planId, scheduleDate, updatePlan, timezone],
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
