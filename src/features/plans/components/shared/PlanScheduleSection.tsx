'use client';

import { ClockTimePicker } from '@/components/common/ClockTimePicker';
import { Button } from '@/components/ui/button';
import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime';
import { configToReadable, ruleToConfig } from '@/features/plans/utils/rrule';
import { Check, Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePickerPopover } from './DatePickerPopover';
import { RecurrenceDialog } from './RecurrenceDialog';

// 繰り返しオプション
const RECURRENCE_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '毎日', label: '毎日' },
  { value: '毎週', label: '毎週' },
  { value: '毎月', label: '毎月' },
  { value: '毎年', label: '毎年' },
  { value: '平日', label: '平日（月〜金）' },
] as const;

interface PlanScheduleSectionProps {
  // 日付・時刻
  selectedDate: Date | undefined;
  startTime: string;
  endTime: string;
  onDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  // 繰り返し
  recurrenceRule: string | null;
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rule: string | null) => void;
  // オプション
  showBorderTop?: boolean;
  disabled?: boolean;
  /** 時間重複エラー状態（視覚的フィードバック用） */
  timeConflictError?: boolean;
}

/**
 * 日付・時刻・繰り返しの統一セクション
 *
 * PlanInspectorとPlanCreatePopoverで共通使用
 */
export function PlanScheduleSection({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  recurrenceRule,
  recurrenceType,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  showBorderTop = false,
  disabled = false,
  timeConflictError = false,
}: PlanScheduleSectionProps) {
  const [showRecurrencePopover, setShowRecurrencePopover] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const recurrenceRef = useRef<HTMLDivElement>(null);

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recurrenceRef.current && !recurrenceRef.current.contains(event.target as Node)) {
        setShowRecurrencePopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 繰り返し表示テキスト
  const recurrenceDisplayText = useMemo(() => {
    if (recurrenceRule) {
      return configToReadable(ruleToConfig(recurrenceRule));
    }
    if (recurrenceType && recurrenceType !== 'none') {
      const typeMap: Record<string, string> = {
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月',
        yearly: '毎年',
        weekdays: '平日',
      };
      return typeMap[recurrenceType] || '繰り返し';
    }
    return '繰り返し';
  }, [recurrenceRule, recurrenceType]);

  // 繰り返しが設定されているか
  const hasRecurrence = recurrenceRule || (recurrenceType && recurrenceType !== 'none');

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
    <div className={showBorderTop ? 'border-border/50 border-t' : ''}>
      {/* 時間グループ */}
      <div className="flex gap-2 px-4 py-2">
        {/* グループアイコン */}
        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <Clock className="text-muted-foreground size-4" />
        </div>

        {/* グループコンテンツ */}
        <div className="flex flex-1 flex-col gap-1">
          {/* 1行目: 日付 */}
          <div className="flex h-8 items-center">
            <DatePickerPopover selectedDate={selectedDate} onDateChange={onDateChange} />
          </div>

          {/* 2行目: 時間 */}
          <div className="flex h-8 items-center">
            <ClockTimePicker
              value={startTime}
              onChange={handleStartTimeChange}
              disabled={disabled}
              hasError={timeConflictError}
            />
            <span className="text-muted-foreground mx-1">→</span>
            <ClockTimePicker
              value={endTime}
              onChange={handleEndTimeChange}
              disabled={disabled || !startTime}
              hasError={timeConflictError}
              minTime={startTime}
            />
            {durationDisplay && (
              <span className="text-muted-foreground ml-2 text-sm">{durationDisplay}</span>
            )}
          </div>

          {/* 3行目: 繰り返し */}
          <div className="relative flex h-8 items-center" ref={recurrenceRef}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 text-sm ${hasRecurrence ? 'text-foreground' : 'text-muted-foreground'}`}
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  setShowRecurrencePopover(!showRecurrencePopover);
                }
              }}
            >
              {hasRecurrence ? recurrenceDisplayText : '繰り返し'}
            </Button>

            {showRecurrencePopover && !disabled && (
              <div className="border-border bg-popover absolute top-10 left-0 z-50 w-48 rounded-md border shadow-md">
                <div className="p-1">
                  <button
                    className="hover:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      onRepeatTypeChange('');
                      onRecurrenceRuleChange(null);
                      setShowRecurrencePopover(false);
                    }}
                    type="button"
                  >
                    選択しない
                    {!hasRecurrence && <Check className="text-primary h-4 w-4" />}
                  </button>
                  <div className="border-border my-1 border-t" />
                  {RECURRENCE_OPTIONS.slice(1).map((option) => (
                    <button
                      key={option.value}
                      className="hover:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm"
                      onClick={() => {
                        onRepeatTypeChange(option.value);
                        onRecurrenceRuleChange(null);
                        setShowRecurrencePopover(false);
                      }}
                      type="button"
                    >
                      {option.label}
                      {recurrenceDisplayText === option.value && (
                        <Check className="text-primary h-4 w-4" />
                      )}
                    </button>
                  ))}
                  <div className="border-border my-1 border-t" />
                  <button
                    className="hover:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      setShowRecurrencePopover(false);
                      setShowCustomDialog(true);
                    }}
                    type="button"
                  >
                    カスタム...
                  </button>
                </div>
              </div>
            )}

            {/* カスタム繰り返しDialog */}
            <RecurrenceDialog
              open={showCustomDialog}
              onOpenChange={setShowCustomDialog}
              value={recurrenceRule}
              onChange={onRecurrenceRuleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
