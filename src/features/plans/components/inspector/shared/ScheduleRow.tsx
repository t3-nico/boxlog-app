'use client';

/**
 * 日付 + 時間 + Duration の入力行（共通コンポーネント）
 *
 * Plan/Record共通で使用するスケジュール入力UI
 * - 日付選択
 * - 開始/終了時刻選択
 * - Duration表示
 * - 時間重複エラー表示
 */

import { useMemo } from 'react';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DatePickerPopover } from '@/components/ui/date-picker-popover';
import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime';

import { ClockTimePicker } from '@/components/ui/clock-time-picker';

interface ScheduleRowProps {
  // 日付・時刻（必須）
  selectedDate: Date | undefined;
  startTime: string;
  endTime: string;
  onDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  // オプション
  disabled?: boolean;
  /** 時間重複エラー状態 */
  timeConflictError?: boolean;
  /** 日付プレースホルダー */
  datePlaceholder?: string;
}

/**
 * ScheduleRow
 *
 * 日付・時刻の入力行
 * Plan/Record両方で使用可能
 */
export function ScheduleRow({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
  timeConflictError = false,
  datePlaceholder,
}: ScheduleRowProps) {
  const t = useTranslations();
  const resolvedPlaceholder = datePlaceholder ?? t('common.schedule.datePlaceholder');

  // 時刻自動調整フック
  const { handleStartTimeChange: autoStartTimeChange, handleEndTimeChange: autoEndTimeChange } =
    useAutoAdjustEndTime(startTime, endTime, onEndTimeChange);

  // 開始時刻変更ハンドラー
  const handleStartTimeChange = (time: string) => {
    autoStartTimeChange(time);
    onStartTimeChange(time);
  };

  // 終了時刻変更ハンドラー
  const handleEndTimeChange = (time: string) => {
    autoEndTimeChange(time);
    onEndTimeChange(time);
  };

  // 合計時間（分）を計算
  const durationMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    if (isNaN(startH!) || isNaN(startM!) || isNaN(endH!) || isNaN(endM!)) return 0;
    const startMinutes = startH! * 60 + startM!;
    const endMinutes = endH! * 60 + endM!;
    const duration = endMinutes - startMinutes;
    return duration > 0 ? duration : 0;
  }, [startTime, endTime]);

  // 時間表示フォーマット（例: "2h 30m"）
  const durationDisplay = useMemo(() => {
    if (durationMinutes <= 0) return '';
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }, [durationMinutes]);

  return (
    <div className="flex items-start gap-2 px-4 py-2">
      {/* 日付 */}
      <DatePickerPopover
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        placeholder={resolvedPlaceholder}
        showIcon
      />

      {/* 時間範囲 + Duration */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <ClockTimePicker
            value={startTime}
            onChange={handleStartTimeChange}
            disabled={disabled}
            showIcon
            hasError={timeConflictError}
          />
          <span className="text-muted-foreground px-2 text-sm">–</span>
          <ClockTimePicker
            value={endTime}
            onChange={handleEndTimeChange}
            disabled={disabled || !startTime}
            showIcon
            iconType="flag"
            minTime={startTime}
            showDurationInMenu
            hasError={timeConflictError}
          />
          {durationDisplay && (
            <span className="text-muted-foreground ml-4 text-sm tabular-nums">
              {durationDisplay}
            </span>
          )}
        </div>

        {/* 時間重複エラーメッセージ */}
        {timeConflictError && (
          <div
            className="text-destructive flex items-center gap-1 py-1 text-sm"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="size-3 flex-shrink-0" />
            <span>{t('calendar.toast.conflictDescription')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
