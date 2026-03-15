'use client';

/**
 * Inspector 時間セクション（組み立て役）
 *
 * DateNavigatorRow + TimeRow × 2 を
 * 2パターン（upcoming/active, past）に応じて組み立てる。
 *
 * - upcoming/active: 予定行（編集可）＋記録行（プレースホルダー or 編集可）
 * - past: 記録行のみ（予定行・日付・差分バッジ非表示）
 */

import type { ReactNode } from 'react';

import { Calendar, Clock, Play, StickyNote } from 'lucide-react';
import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { useAutoAdjustEndTime } from '../../hooks/useAutoAdjustEndTime';
import type { EntryState, FulfillmentScore } from '../../types/entry';

import { DateNavigatorRow } from './DateNavigatorRow';
import { FulfillmentRow } from './FulfillmentRow';
import { InlineNoteSection } from './InlineNoteSection';
import { TimeRow } from './TimeRow';

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
  timeConflictError?: boolean;
  disabled?: boolean;
  // 充実度
  fulfillmentScore?: FulfillmentScore | null | undefined;
  onFulfillmentChange?: ((score: FulfillmentScore | null) => void) | undefined;
  // メモ
  note?: string | undefined;
  onNoteChange?: ((text: string) => void) | undefined;
  notePlaceholder?: string | undefined;
  // 繰り返し・通知（ReactNode スロット）
  recurrenceRow?: ReactNode;
  reminderRow?: ReactNode;
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
  timeConflictError = false,
  disabled = false,
  fulfillmentScore,
  onFulfillmentChange,
  note,
  onNoteChange,
  notePlaceholder,
  recurrenceRow,
  reminderRow,
}: InspectorTimeSectionProps) {
  const t = useTranslations();

  const isPast = entryState === 'past';

  // 未来/進行中ブロック: 過去の日付への移動を防止
  const today = useMemo(() => new Date(), []);

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

  // 記録行は連動なし（開始を変えても終了はそのまま）
  const handleActualStartChange = (time: string) => {
    onActualStartChange(time);
  };

  const handleActualEndChange = (time: string) => {
    onActualEndChange(time);
  };

  return (
    <div className="flex flex-col gap-2 px-4 pt-2.5 pb-4">
      {/* 日付（過去は非表示、未来は minDate=today） */}
      {!isPast && (
        <DateNavigatorRow
          label={t('plan.inspector.time.date')}
          icon={Calendar}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          disabled={disabled}
          minDate={today}
        />
      )}

      {/* 予定行（過去は非表示） */}
      {!isPast && (
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

      {/* 記録行（常に表示） */}
      <TimeRow
        label={t('plan.inspector.time.actual')}
        icon={Play}
        startTime={effectiveActualStart}
        endTime={effectiveActualEnd}
        onStartChange={handleActualStartChange}
        onEndChange={handleActualEndChange}
        disabled={disabled}
      />

      {/* 充実度 */}
      {onFulfillmentChange && (
        <FulfillmentRow
          label={t('plan.inspector.time.fulfillment')}
          score={fulfillmentScore ?? null}
          onScoreChange={onFulfillmentChange}
          disabled={disabled}
        />
      )}

      {/* 繰り返し・通知（過去のエントリでは非表示） */}
      {!isPast && recurrenceRow}
      {!isPast && reminderRow}

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
    </div>
  );
}
