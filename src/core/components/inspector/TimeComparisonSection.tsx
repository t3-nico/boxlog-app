'use client';

/**
 * 予定/記録 時間比較セクション
 *
 * 3パターン対応:
 * 1. upcoming + planned: 予定行 + 「予定と同じ」プレースホルダー
 * 2. past + planned: 予定行 + 記録行（diff 表示付き）
 * 3. past + unplanned: 記録行のみ（予定行なし）
 *
 * 差分表示: 記録の duration − 予定の duration を ±Xm / ±Xh 形式で表示
 */

import { memo, useCallback, useMemo } from 'react';

import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ClockTimePicker } from '@/components/ui/clock-time-picker';
import { DatePickerPopover } from '@/components/ui/date-picker-popover';
import type { EntryOrigin } from '@/core/types/entry';
import { useAutoAdjustEndTime } from '@/hooks/useAutoAdjustEndTime';
import type { EntryState } from '@/lib/entry-status';
import { computeDuration, formatDurationDisplay } from '@/lib/time-utils';
import { TimeProgressBar } from './TimeProgressBar';

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
  origin?: EntryOrigin;
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

/**
 * 時刻を ±deltaMinutes 調整する
 * 0:00–23:45 の範囲にクランプ
 */
function adjustTime(time: string, deltaMinutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.max(0, Math.min(23 * 60 + 45, (h ?? 0) * 60 + (m ?? 0) + deltaMinutes));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * ±ボタン付き ClockTimePicker（past/active のみ表示）
 */
const TimePickerWithAdjust = memo(function TimePickerWithAdjust({
  value,
  onChange,
  showAdjust,
  disabled,
  hasError,
  minTime,
  showDurationInMenu,
}: {
  value: string;
  onChange: (time: string) => void;
  showAdjust: boolean;
  disabled?: boolean;
  hasError?: boolean;
  minTime?: string;
  showDurationInMenu?: boolean;
}) {
  const handleDecrement = useCallback(() => {
    onChange(adjustTime(value, -15));
  }, [value, onChange]);

  const handleIncrement = useCallback(() => {
    onChange(adjustTime(value, 15));
  }, [value, onChange]);

  if (!showAdjust) {
    return (
      <ClockTimePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        hasError={hasError}
        minTime={minTime}
        showDurationInMenu={showDurationInMenu}
      />
    );
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded transition-colors"
        onClick={handleDecrement}
        disabled={disabled}
        aria-label="15分前"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      <ClockTimePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        hasError={hasError}
        minTime={minTime}
        showDurationInMenu={showDurationInMenu}
      />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded transition-colors"
        onClick={handleIncrement}
        disabled={disabled}
        aria-label="15分後"
      >
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
});

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
  origin = 'planned',
  timeConflictError = false,
  disabled = false,
}: TimeComparisonSectionProps) {
  const t = useTranslations();

  // 3パターンのレンダリング制御
  const isUnplanned = origin === 'unplanned';
  const showPlannedRow = !isUnplanned;
  const showActualRow = entryState !== 'upcoming' || isUnplanned;
  const showPlaceholderRow = entryState === 'upcoming' && !isUnplanned;
  // ±ボタンは past/active のみ表示
  const showAdjust = entryState !== 'upcoming';

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

  // 差分（記録が明示的に設定されている場合のみ、planned エントリのみ）
  const hasActualTime = actualStart !== null || actualEnd !== null;
  const diffMinutes = hasActualTime && !isUnplanned ? actualDuration - plannedDuration : 0;
  const diffDisplay = formatDiffDisplay(diffMinutes);

  return (
    <div className="flex flex-col gap-1 px-4 py-2">
      {/* 日付 */}
      <DatePickerPopover
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        placeholder={t('common.schedule.datePlaceholder')}
        showIcon
      />

      {/* 予定行（unplanned では非表示） */}
      {showPlannedRow && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground w-8 flex-shrink-0 text-xs">
            {t('plan.inspector.time.planned')}
          </span>
          <TimePickerWithAdjust
            value={plannedStart}
            onChange={handlePlannedStartChange}
            showAdjust={showAdjust}
            disabled={disabled}
            hasError={timeConflictError}
          />
          <span className="text-muted-foreground text-sm">–</span>
          <TimePickerWithAdjust
            value={plannedEnd}
            onChange={handlePlannedEndChange}
            showAdjust={showAdjust}
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
      )}

      {/* 記録プレースホルダー行（upcoming + planned のみ） */}
      {showPlaceholderRow && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground w-8 flex-shrink-0 text-xs">
            {t('plan.inspector.time.actual')}
          </span>
          <span className="text-muted-foreground text-xs">
            ── {t('plan.inspector.time.sameAsPlanned')} ──
          </span>
        </div>
      )}

      {/* 記録行（active/past、または unplanned） */}
      {showActualRow && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground w-8 flex-shrink-0 text-xs">
            {t('plan.inspector.time.actual')}
          </span>
          {hasActualTime || isUnplanned ? (
            <>
              <TimePickerWithAdjust
                value={effectiveActualStart}
                onChange={handleActualStartChange}
                showAdjust={showAdjust}
                disabled={disabled}
              />
              <span className="text-muted-foreground text-sm">–</span>
              <TimePickerWithAdjust
                value={effectiveActualEnd}
                onChange={handleActualEndChange}
                showAdjust={showAdjust}
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
                    diffMinutes < 0 ? 'text-success' : 'text-warning'
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

      {/* プログレスバー: past + planned + 記録ありの場合のみ */}
      {showActualRow && showPlannedRow && hasActualTime && (
        <div className="px-8">
          <TimeProgressBar plannedMinutes={plannedDuration} actualMinutes={actualDuration} />
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
