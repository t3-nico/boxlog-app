'use client';

/**
 * Inspector 時間セクション（組み立て役）
 *
 * DateNavigatorRow + TimeRow × 2 + TimeProgressBar + TimeConflictAlert を
 * 3パターン（upcoming+planned, past+planned, past+unplanned）に応じて組み立てる。
 *
 * TimeComparisonSection の後継（同じ props interface）。
 */

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import type { EntryOrigin } from '@/core/types/entry';
import { useAutoAdjustEndTime } from '@/hooks/useAutoAdjustEndTime';
import type { EntryState } from '@/lib/entry-status';
import { computeDuration, formatDurationDisplay } from '@/lib/time-utils';

import { DateNavigatorRow } from './DateNavigatorRow';
import { TimeConflictAlert } from './TimeConflictAlert';
import { TimeRow, TimeRowPlaceholder } from './TimeRow';

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

interface InspectorTimeSectionProps {
  // 日付
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  // 予定
  plannedStart: string;
  plannedEnd: string;
  onPlannedStartChange: (time: string) => void;
  onPlannedEndChange: (time: string) => void;
  // 記録
  actualStart: string | null;
  actualEnd: string | null;
  onActualStartChange: (time: string | null) => void;
  onActualEndChange: (time: string | null) => void;
  // 状態
  entryState: EntryState;
  origin?: EntryOrigin;
  timeConflictError?: boolean;
  disabled?: boolean;
}

export function InspectorTimeSection({
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
}: InspectorTimeSectionProps) {
  const t = useTranslations();

  // 3パターンのレンダリング制御
  const isUnplanned = origin === 'unplanned';
  const isPlannedRowDisabled = isUnplanned;
  const showActualPlaceholder = entryState === 'upcoming' && !isUnplanned;

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
    <div className="flex flex-col gap-1 px-6 py-2">
      {/* 日付 */}
      <DateNavigatorRow
        label={t('plan.inspector.time.date')}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        disabled={disabled}
      />

      {/* 予定行 */}
      {isPlannedRowDisabled ? (
        <TimeRowPlaceholder
          label={t('plan.inspector.time.planned')}
          message={t('plan.inspector.time.noPlanned')}
          muted
        />
      ) : (
        <TimeRow
          label={t('plan.inspector.time.planned')}
          startTime={plannedStart}
          endTime={plannedEnd}
          onStartChange={handlePlannedStartChange}
          onEndChange={handlePlannedEndChange}
          disabled={disabled}
          hasError={timeConflictError}
          durationDisplay={plannedDurationDisplay}
        />
      )}

      {/* 記録行 */}
      {showActualPlaceholder ? (
        <TimeRowPlaceholder
          label={t('plan.inspector.time.actual')}
          message={t('plan.inspector.time.sameAsPlanned')}
        />
      ) : hasActualTime || isUnplanned ? (
        <TimeRow
          label={t('plan.inspector.time.actual')}
          startTime={effectiveActualStart}
          endTime={effectiveActualEnd}
          onStartChange={handleActualStartChange}
          onEndChange={handleActualEndChange}
          disabled={disabled}
          durationDisplay={actualDurationDisplay}
          diffDisplay={diffDisplay || undefined}
          diffType={diffMinutes < 0 ? 'under' : 'over'}
        />
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground w-8 flex-shrink-0 text-xs">
            {t('plan.inspector.time.actual')}
          </span>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            onClick={() => {
              onActualStartChange(plannedStart);
              onActualEndChange(plannedEnd);
            }}
          >
            {t('plan.inspector.time.sameAsPlanned')}
          </button>
        </div>
      )}

      {/* 時間重複エラー */}
      {timeConflictError && <TimeConflictAlert message={t('calendar.toast.conflictDescription')} />}
    </div>
  );
}
