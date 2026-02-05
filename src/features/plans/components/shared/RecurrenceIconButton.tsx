'use client';

import { useState } from 'react';

import { Check, Repeat } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

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

interface RecurrenceIconButtonProps {
  recurrenceRule: string | null;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rule: string | null) => void;
  disabled?: boolean;
}

/**
 * 繰り返し設定アイコンボタン
 * ReminderSelectと同じパターンで、アイコン + テキスト表示
 */
export function RecurrenceIconButton({
  recurrenceRule,
  recurrenceType,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  disabled = false,
}: RecurrenceIconButtonProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  // 繰り返しが設定されているかどうか
  const hasRecurrence = recurrenceRule || (recurrenceType && recurrenceType !== 'none');

  // 表示テキスト
  const displayText = (() => {
    if (recurrenceRule) {
      // RRULEがある場合は簡易表示（詳細はtooltipで）
      return 'カスタム';
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
  })();

  return (
    <>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <HoverTooltip
          content={hasRecurrence ? `繰り返し: ${displayText}` : '繰り返しを設定'}
          side="top"
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
                'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                hasRecurrence ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={hasRecurrence ? `繰り返し: ${displayText}` : '繰り返しを設定'}
            >
              <Repeat className="size-4" />
              {hasRecurrence && <span className="text-sm">{displayText}</span>}
            </button>
          </PopoverTrigger>
        </HoverTooltip>

        <PopoverContent
          className="w-48 p-1"
          align="start"
          sideOffset={4}
          style={{ zIndex: zIndex.overlayDropdown }}
        >
          <div role="menu" aria-label="繰り返しオプション">
            <button
              className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors focus-visible:outline-none"
              onClick={() => {
                onRepeatTypeChange('');
                onRecurrenceRuleChange(null);
                setShowPopover(false);
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
                className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors focus-visible:outline-none"
                onClick={() => {
                  onRepeatTypeChange(option.value);
                  onRecurrenceRuleChange(null);
                  setShowPopover(false);
                }}
                type="button"
                role="menuitem"
              >
                {option.label}
                {displayText === option.value && <Check className="text-primary h-4 w-4" />}
              </button>
            ))}
            <div className="border-border my-1 border-t" />
            <button
              className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors focus-visible:outline-none"
              onClick={() => {
                setShowPopover(false);
                setShowCustomDialog(true);
              }}
              type="button"
              role="menuitem"
            >
              カスタム...
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* カスタム繰り返しDialog */}
      <RecurrenceDialog
        open={showCustomDialog}
        onOpenChange={setShowCustomDialog}
        value={recurrenceRule}
        onChange={onRecurrenceRuleChange}
      />
    </>
  );
}
