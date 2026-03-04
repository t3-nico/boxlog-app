'use client';

/**
 * 予定/記録 時間比較セクション
 *
 * 2行構成:
 * - 予定行: start_time / end_time（ClockTimePicker で編集可能）
 * - 記録行: actual_start_time / actual_end_time（null = 予定と同じ）
 *
 * 差分表示: 記録の duration − 予定の duration を ±Xm / ±Xh 形式で表示
 */

import { useMemo } from 'react';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ClockTimePicker } from '@/components/ui/clock-time-picker';
import { DatePickerPopover } from '@/components/ui/date-picker-popover';
import { useAutoAdjustEndTime } from '@/hooks/useAutoAdjustEndTime';
import type { EntryState } from '@/lib/entry-status';
import { computeDuration, formatDurationDisplay } from '@/lib/time-utils';

interface TimeComparisonSectionProps {
  // 日付（共通）
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  // 予定（plan）
  plannedStart: string; // "HH:mm"
  plannedEnd: string; // "HH:mm"
  onPlannedStartChange: (time: string) => void;
  onPlannedEndChange: (time: string) => void;
  // 記録（actual）
  actualStart: string | null; // null = 予定と同じ
  actualEnd: string | null; // null = 予定と同じ
  onActualStartChange: (time: string | null) => void;
  onActualEndChange: (time: string | null) => void;
  // 状態
  entryState: EntryState;
  timeConflictError?: boolean;
  disabled?: boolean;
}

/**
 * 差分（分）を ±Xh Ym 形式にフォーマット
 */
function formatDiffDisplay(diffMinutes: number): string {
  if (diffMinutes === 0) return '';
  const sign = diffMinutes > 0 ? '+' : '−';
  const abs = Math.abs(diffMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0 && m > 0) return `${sign}${h}h${m}m`;
  if (h > 0) return `${sign}${h}h`;
  return `${sign}${m}m`;
}

export function TimeComparisonSection({
  selectedDate,
  onDateChange,
  plannedStart,
  plannedEnd,
  onPlannedStartChange,
  onPlannedEndChange,
  actualStart,
  actualEnd,
  onActualStartChange,
  onActualEndChange,
  entryState,
  timeConflictError = false,
  disabled = false,
}: TimeComparisonSectionProps) {
  const t = useTranslations();

  // 予定行の自動調整
  const {
    handleStartTimeChange: autoPlannedStartChange,
    handleEndTimeChange: autoPlannedEndChange,
  } = useAutoAdjustEndTime(plannedStart, plannedEnd, onPlannedEndChange);

  const handlePlannedStartChange = (time: string) => {
    autoPlannedStartChange(time);
    onPlannedStartChange(time);
  };

  const handlePlannedEndChange = (time: string) => {
    autoPlannedEndChange(time);
    onPlannedEndChange(time);
  };

  // 記録行の実効値（null → 予定の値を使用）
  const effectiveActualStart = actualStart ?? plannedStart;
  const effectiveActualEnd = actualEnd ?? plannedEnd;

  // 記録行の自動調整
  const { handleStartTimeChange: autoActualStartChange, handleEndTimeChange: autoActualEndChange } =
    useAutoAdjustEndTime(effectiveActualStart, effectiveActualEnd, (time: string) =>
      onActualEndChange(time),
    );

  const handleActualStartChange = (time: string) => {
    autoActualStartChange(time);
    onActualStartChange(time);
  };

  const handleActualEndChange = (time: string) => {
    autoActualEndChange(time);
    onActualEndChange(time);
  };

  // Duration 計算
  const plannedDuration = useMemo(
    () => computeDuration(plannedStart, plannedEnd),
    [plannedStart, plannedEnd],
  );
  const actualDuration = useMemo(
    () => computeDuration(effectiveActualStart, effectiveActualEnd),
    [effectiveActualStart, effectiveActualEnd],
  );

  const plannedDurationDisplay = useMemo(
    () => formatDurationDisplay(plannedDuration),
    [plannedDuration],
  );
  const actualDurationDisplay = useMemo(
    () => formatDurationDisplay(actualDuration),
    [actualDuration],
  );

  // 差分（記録が明示的に設定されている場合のみ）
  const hasActualTime = actualStart !== null || actualEnd !== null;
  const diffMinutes = hasActualTime ? actualDuration - plannedDuration : 0;
  const diffDisplay = formatDiffDisplay(diffMinutes);

  // 記録行を表示するか（upcoming は予定のみ）
  const showActualRow = entryState !== 'upcoming';

  return (
    <div className="flex flex-col gap-1 px-4 py-2">
      {/* 日付 */}
      <DatePickerPopover
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        placeholder={t('common.schedule.datePlaceholder')}
        showIcon
      />

      {/* 予定行 */}
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground w-8 flex-shrink-0 text-xs">
          {t('plan.inspector.time.planned')}
        </span>
        <ClockTimePicker
          value={plannedStart}
          onChange={handlePlannedStartChange}
          disabled={disabled}
          hasError={timeConflictError}
        />
        <span className="text-muted-foreground text-sm">–</span>
        <ClockTimePicker
          value={plannedEnd}
          onChange={handlePlannedEndChange}
          disabled={disabled || !plannedStart}
          minTime={plannedStart}
          showDurationInMenu
          hasError={timeConflictError}
        />
        {plannedDurationDisplay && (
          <span className="text-muted-foreground ml-2 text-xs tabular-nums">
            {plannedDurationDisplay}
          </span>
        )}
      </div>

      {/* 記録行 */}
      {showActualRow && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground w-8 flex-shrink-0 text-xs">
            {t('plan.inspector.time.actual')}
          </span>
          {hasActualTime ? (
            <>
              <ClockTimePicker
                value={effectiveActualStart}
                onChange={handleActualStartChange}
                disabled={disabled}
              />
              <span className="text-muted-foreground text-sm">–</span>
              <ClockTimePicker
                value={effectiveActualEnd}
                onChange={handleActualEndChange}
                disabled={disabled || !effectiveActualStart}
                minTime={effectiveActualStart}
                showDurationInMenu
              />
              {actualDurationDisplay && (
                <span className="text-muted-foreground ml-2 text-xs tabular-nums">
                  {actualDurationDisplay}
                </span>
              )}
              {diffDisplay && (
                <span
                  className={`ml-1 text-xs tabular-nums ${
                    diffMinutes < 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {diffDisplay}
                </span>
              )}
            </>
          ) : (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              onClick={() => {
                // 予定の値をコピーして編集モードに入る
                onActualStartChange(plannedStart);
                onActualEndChange(plannedEnd);
              }}
            >
              {t('plan.inspector.time.sameAsPlanned')}
            </button>
          )}
        </div>
      )}

      {/* 時間重複エラー */}
      {timeConflictError && (
        <div
          className="text-destructive flex items-center gap-1 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="size-3 flex-shrink-0" />
          <span>{t('calendar.toast.conflictDescription')}</span>
        </div>
      )}
    </div>
  );
}
