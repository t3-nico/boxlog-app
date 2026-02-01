'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { AlertCircle, Check, Repeat } from 'lucide-react';

import { ClockTimePicker } from '@/components/common/ClockTimePicker';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime';
import { configToReadable, ruleToConfig } from '@/features/plans/utils/rrule';
import { cn } from '@/lib/utils';

import { DatePickerPopover } from './DatePickerPopover';
import { RecurrenceDialog } from './RecurrenceDialog';
import { ReminderSelect } from './ReminderSelect';

// 繰り返しオプション
const RECURRENCE_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '毎日', label: '毎日' },
  { value: '毎週', label: '毎週' },
  { value: '毎月', label: '毎月' },
  { value: '毎年', label: '毎年' },
  { value: '平日', label: '平日（月〜金）' },
] as const;

interface PlanScheduleRowProps {
  // 日付・時刻
  selectedDate: Date | undefined;
  startTime: string;
  endTime: string;
  onDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  // 繰り返し（optional - 渡さなければ表示しない）
  recurrenceRule?: string | null;
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;
  onRepeatTypeChange?: (type: string) => void;
  onRecurrenceRuleChange?: (rule: string | null) => void;
  // 通知
  reminderType?: string;
  onReminderChange?: (type: string) => void;
  // オプション
  disabled?: boolean;
  /** 時間重複エラー状態 */
  timeConflictError?: boolean;
}

/**
 * 日付・時刻・繰り返しの統一Row（Record画面と同じ形式）
 */
export function PlanScheduleRow({
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
  reminderType,
  onReminderChange,
  disabled = false,
  timeConflictError = false,
}: PlanScheduleRowProps) {
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
    return null;
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
    <div className="flex items-start gap-2 px-4 py-2">
      {/* 日付 */}
      <DatePickerPopover
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        placeholder="日付..."
        showIcon
      />

      {/* 時間範囲 + Duration + 繰り返し */}
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

          {/* 繰り返しアイコンボタン（onRepeatTypeChangeが渡された場合のみ表示） */}
          {onRepeatTypeChange && onRecurrenceRuleChange && (
            <div className="relative ml-2" ref={recurrenceRef}>
              <HoverTooltip
                content={hasRecurrence ? recurrenceDisplayText : '繰り返しを設定'}
                side="top"
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      setShowRecurrencePopover(!showRecurrencePopover);
                    }
                  }}
                  className={cn(
                    'flex h-8 items-center gap-1 rounded-md px-2 transition-colors',
                    'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    hasRecurrence
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label={`繰り返し設定: ${hasRecurrence ? recurrenceDisplayText : '設定なし'}`}
                  aria-expanded={showRecurrencePopover}
                  aria-haspopup="menu"
                >
                  <Repeat className="size-4" />
                  {hasRecurrence && <span className="text-sm">{recurrenceDisplayText}</span>}
                </button>
              </HoverTooltip>

              {/* 繰り返しポップオーバー */}
              {showRecurrencePopover && !disabled && (
                <div
                  className="border-border bg-popover absolute top-10 left-0 z-50 w-48 rounded-md border shadow-md"
                  role="menu"
                  aria-label="繰り返しオプション"
                >
                  <div className="p-1">
                    <button
                      className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none"
                      onClick={() => {
                        onRepeatTypeChange('');
                        onRecurrenceRuleChange(null);
                        setShowRecurrencePopover(false);
                      }}
                      type="button"
                      role="menuitem"
                    >
                      選択しない
                      {!hasRecurrence && <Check className="text-primary h-4 w-4" />}
                    </button>
                    <div className="border-border my-1 border-t" />
                    {RECURRENCE_OPTIONS.slice(1).map((option) => (
                      <button
                        key={option.value}
                        className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none"
                        onClick={() => {
                          onRepeatTypeChange(option.value);
                          onRecurrenceRuleChange(null);
                          setShowRecurrencePopover(false);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {option.label}
                        {recurrenceDisplayText === option.value && (
                          <Check className="text-primary h-4 w-4" />
                        )}
                      </button>
                    ))}
                    <div className="border-border my-1 border-t" />
                    <button
                      className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none"
                      onClick={() => {
                        setShowRecurrencePopover(false);
                        setShowCustomDialog(true);
                      }}
                      type="button"
                      role="menuitem"
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
                value={recurrenceRule ?? null}
                onChange={onRecurrenceRuleChange}
              />
            </div>
          )}

          {/* 通知アイコン */}
          {onReminderChange && (
            <ReminderSelect value={reminderType ?? ''} onChange={onReminderChange} variant="icon" />
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
            <span>この時間帯は他の予定と重複しています</span>
          </div>
        )}
      </div>
    </div>
  );
}
