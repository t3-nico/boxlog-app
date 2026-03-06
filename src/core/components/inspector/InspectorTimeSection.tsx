'use client';

/**
 * Inspector 時間セクション（組み立て役）
 *
 * DateNavigatorRow + TimeRow × 2 + TimeProgressBar + TimeConflictAlert を
 * 3パターン（upcoming+planned, past+planned, past+unplanned）に応じて組み立てる。
 *
 * TimeComparisonSection の後継（同じ props interface）。
 */

import { Calendar, CircleCheck, Clock, StickyNote, Timer } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import type { EntryOrigin, FulfillmentScore } from '@/core/types/entry';
import { useAutoAdjustEndTime } from '@/hooks/useAutoAdjustEndTime';
import type { EntryState } from '@/lib/entry-status';
import { computeDuration } from '@/lib/time-utils';

import { DateNavigatorRow } from './DateNavigatorRow';
import { DurationSelect } from './DurationSelect';
import { FulfillmentRow } from './FulfillmentRow';
import { InlineNoteSection } from './InlineNoteSection';
import { TimeConflictAlert } from './TimeConflictAlert';
import { TimeRow, TimeRowPlaceholder } from './TimeRow';

/**
 * start + duration(分) から end 時刻 "HH:MM" を算出
 */
function addMinutesToTime(start: string, minutes: number): string {
  if (!start) return '';
  const [h, m] = start.split(':').map(Number);
  if (isNaN(h!) || isNaN(m!)) return '';
  const total = h! * 60 + m! + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
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
  // 充実度
  fulfillmentScore?: FulfillmentScore | null | undefined;
  onFulfillmentChange?: ((score: FulfillmentScore | null) => void) | undefined;
  // メモ
  note?: string | undefined;
  onNoteChange?: ((text: string) => void) | undefined;
  notePlaceholder?: string | undefined;
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
  fulfillmentScore,
  onFulfillmentChange,
  note,
  onNoteChange,
  notePlaceholder,
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

  const hasActualTime = actualStart !== null || actualEnd !== null;

  // Duration 変更 → 予定の end_time を調整
  const handleDurationChange = useCallback(
    (minutes: number) => {
      if (!plannedStart) return;
      const newEnd = addMinutesToTime(plannedStart, minutes);
      onPlannedEndChange(newEnd);
    },
    [plannedStart, onPlannedEndChange],
  );

  return (
    <div className="flex flex-col gap-2 p-4">
      {/* 日付 */}
      <DateNavigatorRow
        label={t('plan.inspector.time.date')}
        icon={Calendar}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        disabled={disabled}
      />

      {/* 予定行 */}
      {isPlannedRowDisabled ? (
        <TimeRowPlaceholder
          label={t('plan.inspector.time.planned')}
          icon={Clock}
          message={t('plan.inspector.time.noPlanned')}
          muted
        />
      ) : (
        <TimeRow
          label={t('plan.inspector.time.planned')}
          icon={Clock}
          startTime={plannedStart}
          endTime={plannedEnd}
          onStartChange={handlePlannedStartChange}
          onEndChange={handlePlannedEndChange}
          disabled={disabled}
          hasError={timeConflictError}
        />
      )}

      {/* 記録行 */}
      {showActualPlaceholder ? (
        <TimeRowPlaceholder
          label={t('plan.inspector.time.actual')}
          icon={CircleCheck}
          message={t('plan.inspector.time.sameAsPlanned')}
        />
      ) : hasActualTime || isUnplanned ? (
        <TimeRow
          label={t('plan.inspector.time.actual')}
          icon={CircleCheck}
          startTime={effectiveActualStart}
          endTime={effectiveActualEnd}
          onStartChange={handleActualStartChange}
          onEndChange={handleActualEndChange}
          disabled={disabled}
        />
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleCheck className="text-muted-foreground size-4 flex-shrink-0" />
            <span className="text-muted-foreground text-sm">{t('plan.inspector.time.actual')}</span>
          </div>
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

      {/* 期間（Duration） */}
      {!isPlannedRowDisabled && plannedStart && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="text-muted-foreground size-4 flex-shrink-0" />
            <span className="text-muted-foreground text-sm">
              {t('plan.inspector.time.duration')}
            </span>
          </div>
          <DurationSelect
            value={plannedDuration}
            onChange={handleDurationChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* 充実度 */}
      {onFulfillmentChange && (
        <FulfillmentRow
          label={t('plan.inspector.time.fulfillment')}
          score={fulfillmentScore ?? null}
          onScoreChange={onFulfillmentChange}
          disabled={disabled}
        />
      )}

      {/* メモ */}
      {onNoteChange && (
        <InlineNoteSection
          label={t('plan.inspector.note.label')}
          icon={StickyNote}
          note={note ?? ''}
          onNoteChange={onNoteChange}
          placeholder={notePlaceholder}
          disabled={disabled}
        />
      )}

      {/* 時間重複エラー */}
      {timeConflictError && <TimeConflictAlert message={t('calendar.toast.conflictDescription')} />}
    </div>
  );
}
