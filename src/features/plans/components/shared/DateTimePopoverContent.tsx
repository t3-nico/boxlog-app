'use client';

import { MiniCalendar } from '@/components/common/MiniCalendar';
import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { ReminderSelect } from '@/features/plans/components/shared/ReminderSelect';
import { TimeSelect } from '@/features/plans/components/shared/TimeSelect';
import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime';
import { Bell, Check, Clock, Repeat } from 'lucide-react';
import { useRef, useState } from 'react';

interface DateTimePopoverContentProps {
  selectedDate?: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  reminderType: string;
  onReminderChange: (type: string) => void;
  recurrenceRule?: string | null | undefined;
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | undefined;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rule: string | null) => void;
}

// 繰り返しオプション
const RECURRENCE_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '毎日', label: '毎日' },
  { value: '毎週', label: '毎週' },
  { value: '毎月', label: '毎月' },
  { value: '毎年', label: '毎年' },
  { value: '平日', label: '平日（月〜金）' },
] as const;

/**
 * 日付・時刻・通知・繰り返し設定のPopover内容コンポーネント
 * Inspectorスタイル（アイコン左、コンパクトなインライン形式）
 */
export function DateTimePopoverContent({
  selectedDate,
  onDateSelect,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  reminderType,
  onReminderChange,
  recurrenceRule,
  recurrenceType,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
}: DateTimePopoverContentProps) {
  const [showRecurrencePopover, setShowRecurrencePopover] = useState(false);
  const recurrenceRef = useRef<HTMLDivElement>(null);

  // バリデーション: 繰り返しは日付が必須、通知は日付と開始時刻が必須
  const isRecurrenceDisabled = !selectedDate;
  const isReminderDisabled = !selectedDate || !startTime;

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
  const recurrenceDisplayText = (() => {
    if (recurrenceRule) return 'カスタム';
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
  })();

  const hasRecurrence = recurrenceRule || (recurrenceType && recurrenceType !== 'none');

  return (
    <div>
      {/* カレンダー（直接表示） */}
      <MiniCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

      {/* 時刻行 */}
      <div className="border-border/50 border-t">
        <div className="flex min-h-10 items-center gap-2 px-3 py-2">
          <Clock className="text-muted-foreground size-4 flex-shrink-0" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex h-8 items-center">
              <TimeSelect
                value={startTime}
                onChange={handleStartTimeChange}
                label=""
                disabled={!selectedDate}
              />
              <span className="text-muted-foreground mx-1">→</span>
              <TimeSelect
                value={endTime}
                onChange={handleEndTimeChange}
                label=""
                disabled={!selectedDate || !startTime}
                minTime={startTime}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 繰り返し行 */}
      <div className="border-border/50 border-t">
        <div className="flex min-h-10 items-center gap-2 px-3 py-2">
          <Repeat className="text-muted-foreground size-4 flex-shrink-0" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="relative flex h-8 items-center" ref={recurrenceRef}>
              <HoverTooltip
                content="日付を先に設定してください"
                side="top"
                disabled={!isRecurrenceDisabled}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 text-sm ${hasRecurrence ? 'text-foreground' : 'text-muted-foreground'}`}
                  type="button"
                  disabled={isRecurrenceDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isRecurrenceDisabled) {
                      setShowRecurrencePopover(!showRecurrencePopover);
                    }
                  }}
                >
                  {hasRecurrence ? recurrenceDisplayText : '繰り返し'}
                </Button>
              </HoverTooltip>

              {showRecurrencePopover && !isRecurrenceDisabled && (
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 通知行 */}
      <div className="border-border/50 border-t">
        <div className="flex min-h-10 items-center gap-2 px-3 py-2">
          <Bell className="text-muted-foreground size-4 flex-shrink-0" />
          <div className="flex h-8 flex-1 items-center">
            <HoverTooltip
              content="日付と開始時刻を先に設定してください"
              side="top"
              disabled={!isReminderDisabled}
            >
              <div>
                <ReminderSelect
                  value={reminderType}
                  onChange={onReminderChange}
                  variant="inspector"
                  disabled={isReminderDisabled}
                />
              </div>
            </HoverTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
